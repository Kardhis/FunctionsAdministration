package com.example.backend.habits.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.api.ApiExceptionHandler;
import com.example.backend.habits.UserSetting;
import com.example.backend.habits.UserSettingKey;
import com.example.backend.habits.UserSettingRepository;
import com.example.backend.support.ControllerTestSupport;
import com.example.backend.users.CurrentUserService;
import com.example.backend.users.User;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class UserSettingsControllerTest {

  @Mock UserSettingRepository settingRepository;
  @Mock CurrentUserService currentUserService;

  MockMvc mockMvc;
  User user;
  ObjectMapper objectMapper = new ObjectMapper();

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(
                new UserSettingsController(settingRepository, currentUserService, objectMapper))
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
    user = ControllerTestSupport.userWithId(1L, "user@example.com");
  }

  @Test
  void getReturnsNullWhenMissing() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    when(settingRepository.findByIdUserIdAndIdSettingKey(1L, "theme")).thenReturn(Optional.empty());

    mockMvc
        .perform(
            get("/api/settings/theme").principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.key").value("theme"))
        .andExpect(jsonPath("$.value").doesNotExist());
  }

  @Test
  void getReturnsStoredValue() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    UserSetting row = new UserSetting();
    row.setId(new UserSettingKey(1L, "theme"));
    row.setSettingValueJson("{\"mode\":\"dark\"}");
    when(settingRepository.findByIdUserIdAndIdSettingKey(1L, "theme")).thenReturn(Optional.of(row));

    mockMvc
        .perform(
            get("/api/settings/theme").principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.value.mode").value("dark"));
  }

  @Test
  void putUpsertsSetting() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    when(settingRepository.findByIdUserIdAndIdSettingKey(eq(1L), eq("theme")))
        .thenReturn(Optional.empty());
    when(settingRepository.save(any(UserSetting.class))).thenAnswer(inv -> inv.getArgument(0));

    mockMvc
        .perform(
            put("/api/settings/theme")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"mode\":\"dark\"}")
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.key").value("theme"))
        .andExpect(jsonPath("$.value.mode").value("dark"));
  }
}
