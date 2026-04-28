package com.example.backend.habits.api;

import com.example.backend.habits.Habit;
import com.example.backend.habits.HabitEntry;
import com.example.backend.habits.HabitEntryRepository;
import com.example.backend.habits.HabitRepository;
import com.example.backend.users.CurrentUserService;
import java.security.Principal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/habit-entries")
public class HabitEntriesController {

  public record HabitEntryDto(
      String id,
      String habitId,
      String date,
      String startTime,
      String endTime,
      int durationMinutes,
      String notes,
      Instant createdAt,
      Instant updatedAt) {}

  public record HabitEntryUpsertRequest(
      String id, String habitId, String date, String startTime, String endTime, String notes) {}

  private final HabitEntryRepository entryRepository;
  private final HabitRepository habitRepository;
  private final CurrentUserService currentUserService;

  public HabitEntriesController(
      HabitEntryRepository entryRepository,
      HabitRepository habitRepository,
      CurrentUserService currentUserService) {
    this.entryRepository = entryRepository;
    this.habitRepository = habitRepository;
    this.currentUserService = currentUserService;
  }

  @GetMapping
  public List<HabitEntryDto> list(
      @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate fromDate,
      @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate toDate,
      Principal principal) {
    var user = currentUserService.requireUser(principal);
    if (fromDate != null && toDate != null) {
      return entryRepository
          .findAllByUserIdAndDateBetweenOrderByDateAsc(user.getId(), fromDate, toDate)
          .stream()
          .map(HabitEntriesController::toDto)
          .toList();
    }
    return entryRepository.findAllByUserIdOrderByDateDesc(user.getId()).stream()
        .map(HabitEntriesController::toDto)
        .toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public HabitEntryDto create(@RequestBody HabitEntryUpsertRequest req, Principal principal) {
    var user = currentUserService.requireUser(principal);
    if (req == null || req.id() == null || req.id().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id_required");
    }
    Habit habit = requireHabit(user.getId(), req.habitId());

    LocalDate date = parseDate(req.date());
    LocalTime start = parseTime(req.startTime());
    LocalTime end = parseTime(req.endTime());
    if (end.isBefore(start)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "end_before_start");
    }

    boolean exists = entryRepository.findByIdAndUserId(req.id(), user.getId()).isPresent();
    if (exists) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "entry_exists");
    }

    Instant now = Instant.now();
    HabitEntry e = new HabitEntry();
    e.setId(req.id());
    e.setUser(user);
    e.setHabit(habit);
    e.setDate(date);
    e.setStartTime(start);
    e.setEndTime(end);
    e.setDurationMinutes((int) Duration.between(start, end).toMinutes());
    e.setNotes(req.notes());
    e.setCreatedAt(now);
    e.setUpdatedAt(now);
    return toDto(entryRepository.save(e));
  }

  @PutMapping("/{id}")
  public HabitEntryDto update(
      @PathVariable("id") String id, @RequestBody HabitEntryUpsertRequest req, Principal principal) {
    var user = currentUserService.requireUser(principal);
    HabitEntry prev =
        entryRepository
            .findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "entry_not_found"));

    if (req == null) req = new HabitEntryUpsertRequest(null, null, null, null, null, null);

    if (req.habitId() != null) {
      Habit habit = requireHabit(user.getId(), req.habitId());
      prev.setHabit(habit);
    }
    if (req.date() != null) prev.setDate(parseDate(req.date()));
    if (req.startTime() != null) prev.setStartTime(parseTime(req.startTime()));
    if (req.endTime() != null) prev.setEndTime(parseTime(req.endTime()));
    if (req.notes() != null || (req.notes() == null && true)) prev.setNotes(req.notes());

    if (prev.getEndTime().isBefore(prev.getStartTime())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "end_before_start");
    }

    prev.setDurationMinutes((int) Duration.between(prev.getStartTime(), prev.getEndTime()).toMinutes());
    prev.setUpdatedAt(Instant.now());
    return toDto(entryRepository.save(prev));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable("id") String id, Principal principal) {
    var user = currentUserService.requireUser(principal);
    HabitEntry e =
        entryRepository
            .findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "entry_not_found"));
    entryRepository.delete(e);
  }

  private Habit requireHabit(Long userId, String habitId) {
    if (habitId == null || habitId.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "habitId_required");
    }
    return habitRepository
        .findByIdAndUserId(habitId, userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "habit_not_found"));
  }

  private static LocalDate parseDate(String date) {
    if (date == null || date.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date_required");
    }
    try {
      return LocalDate.parse(date);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date_invalid");
    }
  }

  private static LocalTime parseTime(String time) {
    if (time == null || time.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "time_required");
    }
    try {
      return LocalTime.parse(time);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "time_invalid");
    }
  }

  private static HabitEntryDto toDto(HabitEntry e) {
    return new HabitEntryDto(
        e.getId(),
        e.getHabit().getId(),
        e.getDate().toString(),
        e.getStartTime().toString().substring(0, 5),
        e.getEndTime().toString().substring(0, 5),
        e.getDurationMinutes(),
        e.getNotes(),
        e.getCreatedAt(),
        e.getUpdatedAt());
  }
}

