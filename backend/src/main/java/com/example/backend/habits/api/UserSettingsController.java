package com.example.backend.habits.api;

import com.example.backend.habits.UserSetting;
import com.example.backend.habits.UserSettingKey;
import com.example.backend.habits.UserSettingRepository;
import com.example.backend.users.CurrentUserService;
import java.security.Principal;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/settings")
public class UserSettingsController {

  public record SettingResponse(String key, JsonNode value) {}

  private final UserSettingRepository settingRepository;
  private final CurrentUserService currentUserService;
  private final ObjectMapper objectMapper;

  public UserSettingsController(
      UserSettingRepository settingRepository,
      CurrentUserService currentUserService,
      ObjectMapper objectMapper) {
    this.settingRepository = settingRepository;
    this.currentUserService = currentUserService;
    this.objectMapper = objectMapper;
  }

  @GetMapping("/{key}")
  public SettingResponse get(@PathVariable("key") String key, Principal principal) {
    var user = currentUserService.requireUser(principal);
    var row = settingRepository.findByIdUserIdAndIdSettingKey(user.getId(), key).orElse(null);
    if (row == null) {
      return new SettingResponse(key, null);
    }
    try {
      return new SettingResponse(key, objectMapper.readTree(row.getSettingValueJson()));
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "invalid_setting_json");
    }
  }

  @PutMapping("/{key}")
  @ResponseStatus(HttpStatus.OK)
  public SettingResponse put(
      @PathVariable("key") String key, @RequestBody JsonNode value, Principal principal) {
    var user = currentUserService.requireUser(principal);
    if (value == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "value_required");
    }
    String json;
    try {
      json = objectMapper.writeValueAsString(value);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "value_invalid");
    }

    UserSetting row =
        settingRepository
            .findByIdUserIdAndIdSettingKey(user.getId(), key)
            .orElseGet(
                () -> {
                  UserSetting s = new UserSetting();
                  s.setId(new UserSettingKey(user.getId(), key));
                  s.setUser(user);
                  return s;
                });

    row.setSettingValueJson(json);
    row.setUpdatedAt(Instant.now());
    settingRepository.save(row);
    return new SettingResponse(key, value);
  }
}

