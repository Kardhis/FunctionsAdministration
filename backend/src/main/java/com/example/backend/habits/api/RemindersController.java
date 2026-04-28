package com.example.backend.habits.api;

import com.example.backend.habits.HabitRepository;
import com.example.backend.habits.Reminder;
import com.example.backend.habits.ReminderRepository;
import com.example.backend.users.CurrentUserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.security.Principal;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/reminders")
public class RemindersController {

  public record ReminderDto(
      String id,
      String habitId,
      String title,
      JsonNode schedule,
      boolean enabled,
      Instant createdAt) {}

  public record ReminderUpsertRequest(
      String id, String habitId, String title, JsonNode schedule, Boolean enabled, Instant createdAt) {}

  private final ReminderRepository reminderRepository;
  private final HabitRepository habitRepository;
  private final CurrentUserService currentUserService;
  private final ObjectMapper objectMapper;

  public RemindersController(
      ReminderRepository reminderRepository,
      HabitRepository habitRepository,
      CurrentUserService currentUserService,
      ObjectMapper objectMapper) {
    this.reminderRepository = reminderRepository;
    this.habitRepository = habitRepository;
    this.currentUserService = currentUserService;
    this.objectMapper = objectMapper;
  }

  @GetMapping
  public List<ReminderDto> list(Principal principal) {
    var user = currentUserService.requireUser(principal);
    return reminderRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId()).stream()
        .map(this::toDto)
        .toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ReminderDto create(@RequestBody ReminderUpsertRequest req, Principal principal) {
    var user = currentUserService.requireUser(principal);
    if (req == null || req.id() == null || req.id().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id_required");
    }
    if (req.title() == null || req.title().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title_required");
    }
    if (req.schedule() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "schedule_required");
    }

    boolean exists = reminderRepository.findByIdAndUserId(req.id(), user.getId()).isPresent();
    if (exists) throw new ResponseStatusException(HttpStatus.CONFLICT, "reminder_exists");

    Reminder r = new Reminder();
    r.setId(req.id());
    r.setUser(user);
    if (req.habitId() != null) {
      r.setHabit(
          habitRepository
              .findByIdAndUserId(req.habitId(), user.getId())
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "habit_not_found")));
    } else {
      r.setHabit(null);
    }
    r.setTitle(req.title());
    r.setScheduleJson(writeJson(req.schedule()));
    r.setEnabled(req.enabled() != null && req.enabled());
    r.setCreatedAt(req.createdAt() != null ? req.createdAt() : Instant.now());
    return toDto(reminderRepository.save(r));
  }

  @PutMapping("/{id}")
  public ReminderDto update(
      @PathVariable("id") String id, @RequestBody ReminderUpsertRequest req, Principal principal) {
    var user = currentUserService.requireUser(principal);
    Reminder prev =
        reminderRepository
            .findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "reminder_not_found"));

    if (req == null) req = new ReminderUpsertRequest(null, null, null, null, null, null);
    if (req.habitId() != null) {
      prev.setHabit(
          habitRepository
              .findByIdAndUserId(req.habitId(), user.getId())
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "habit_not_found")));
    }
    if (req.title() != null) prev.setTitle(req.title());
    if (req.schedule() != null) prev.setScheduleJson(writeJson(req.schedule()));
    if (req.enabled() != null) prev.setEnabled(req.enabled());
    return toDto(reminderRepository.save(prev));
  }

  private String writeJson(JsonNode node) {
    try {
      return objectMapper.writeValueAsString(node);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "json_invalid");
    }
  }

  private ReminderDto toDto(Reminder r) {
    try {
      JsonNode schedule = objectMapper.readTree(r.getScheduleJson());
      return new ReminderDto(
          r.getId(),
          r.getHabit() == null ? null : r.getHabit().getId(),
          r.getTitle(),
          schedule,
          r.isEnabled(),
          r.getCreatedAt());
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "invalid_schedule_json");
    }
  }
}

