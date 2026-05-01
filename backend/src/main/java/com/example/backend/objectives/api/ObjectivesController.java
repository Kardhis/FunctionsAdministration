package com.example.backend.objectives.api;

import com.example.backend.habits.Habit;
import com.example.backend.habits.HabitRepository;
import com.example.backend.objectives.Objective;
import com.example.backend.objectives.ObjectiveProgressService;
import com.example.backend.objectives.ObjectiveRepository;
import com.example.backend.objectives.ObjectiveStatus;
import com.example.backend.objectives.ObjectiveStatusRepository;
import com.example.backend.users.CurrentUserService;
import java.security.Principal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/objectives")
public class ObjectivesController {

  public record ObjectiveDto(
      String id,
      String habitId,
      String habitName,
      LocalDate startDate,
      Instant createdAt,
      LocalDate endDate,
      Objective.MetricType metricType,
      int targetValue,
      long progressValue,
      String statusCode,
      String statusLabel,
      String notes,
      Instant updatedAt) {}

  public record ObjectiveUpsertRequest(
      String id,
      String habitId,
      LocalDate startDate,
      LocalDate endDate,
      String notes,
      Objective.MetricType metricType,
      Integer targetValue) {}

  private final ObjectiveRepository objectiveRepository;
  private final ObjectiveStatusRepository statusRepository;
  private final HabitRepository habitRepository;
  private final CurrentUserService currentUserService;
  private final ObjectiveProgressService progressService;

  public ObjectivesController(
      ObjectiveRepository objectiveRepository,
      ObjectiveStatusRepository statusRepository,
      HabitRepository habitRepository,
      CurrentUserService currentUserService,
      ObjectiveProgressService progressService) {
    this.objectiveRepository = objectiveRepository;
    this.statusRepository = statusRepository;
    this.habitRepository = habitRepository;
    this.currentUserService = currentUserService;
    this.progressService = progressService;
  }

  @GetMapping
  @Transactional
  public List<ObjectiveDto> list(
      @RequestParam(value = "status", required = false) String status,
      @RequestParam(value = "habitId", required = false) String habitId,
      @RequestParam(value = "from", required = false) LocalDate from,
      @RequestParam(value = "to", required = false) LocalDate to,
      Principal principal) {
    var user = currentUserService.requireUser(principal);

    Map<String, ObjectiveStatus> byCode = new HashMap<>();
    for (ObjectiveStatus s : statusRepository.findAll()) byCode.put(s.getCode(), s);

    var rows = objectiveRepository.findAllForUserFiltered(user.getId(), emptyToNull(habitId), from, to);
    var zone = progressService.defaultZone();

    return rows.stream()
        .map(
            o -> {
              var p = progressService.compute(o, zone);
              if (o.getStatus() == null || !p.statusCode().equals(o.getStatus().getCode())) {
                o.setStatus(progressService.requireStatus(byCode, p.statusCode()));
                o.setUpdatedAt(progressService.now());
                objectiveRepository.save(o);
              }
              var s = o.getStatus();
              return new ObjectiveDto(
                  o.getId(),
                  o.getHabit().getId(),
                  o.getHabit().getName(),
                  o.getStartDate(),
                  o.getCreatedAt(),
                  o.getEndDate(),
                  o.getMetricType(),
                  o.getTargetValue(),
                  p.progressValue(),
                  s == null ? p.statusCode() : s.getCode(),
                  s == null ? null : s.getLabel(),
                  o.getNotes(),
                  o.getUpdatedAt());
            })
        .filter(d -> status == null || status.isBlank() || status.equalsIgnoreCase(d.statusCode()))
        .toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Transactional
  public ObjectiveDto create(@RequestBody ObjectiveUpsertRequest req, Principal principal) {
    var user = currentUserService.requireUser(principal);
    if (req == null || req.id() == null || req.id().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id_required");
    }
    if (req.habitId() == null || req.habitId().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "habit_id_required");
    }
    if (req.startDate() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "start_date_required");
    }
    if (req.endDate() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "end_date_required");
    }
    if (req.startDate().isAfter(req.endDate())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "start_date_after_end_date");
    }
    if (req.metricType() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "metric_type_required");
    }
    if (req.targetValue() == null || req.targetValue() <= 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "target_value_required");
    }

    boolean exists = objectiveRepository.findByIdAndUserId(req.id(), user.getId()).isPresent();
    if (exists) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "objective_exists");
    }

    Habit habit =
        habitRepository
            .findByIdAndUserId(req.habitId(), user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "habit_not_found"));

    ObjectiveStatus inProgress =
        statusRepository
            .findByCode("IN_PROGRESS")
            .orElseThrow(() -> new IllegalStateException("objective_status_missing:IN_PROGRESS"));

    Instant now = progressService.now();
    Objective o = new Objective();
    o.setId(req.id());
    o.setUser(user);
    o.setHabit(habit);
    o.setCreatedAt(now);
    o.setStartDate(req.startDate());
    o.setEndDate(req.endDate());
    o.setNotes(req.notes());
    o.setMetricType(req.metricType());
    o.setTargetValue(req.targetValue());
    o.setStatus(inProgress);
    o.setUpdatedAt(now);

    Objective saved = objectiveRepository.save(o);
    // compute + persist proper status immediately
    var zone = progressService.defaultZone();
    var p = progressService.compute(saved, zone);
    ObjectiveStatus statusEntity =
        statusRepository
            .findByCode(p.statusCode())
            .orElseThrow(() -> new IllegalStateException("objective_status_missing:" + p.statusCode()));
    saved.setStatus(statusEntity);
    saved.setUpdatedAt(progressService.now());
    saved = objectiveRepository.save(saved);

    return new ObjectiveDto(
        saved.getId(),
        saved.getHabit().getId(),
        saved.getHabit().getName(),
        saved.getStartDate(),
        saved.getCreatedAt(),
        saved.getEndDate(),
        saved.getMetricType(),
        saved.getTargetValue(),
        p.progressValue(),
        saved.getStatus().getCode(),
        saved.getStatus().getLabel(),
        saved.getNotes(),
        saved.getUpdatedAt());
  }

  @PutMapping("/{id}")
  @Transactional
  public ObjectiveDto update(
      @PathVariable("id") String id, @RequestBody ObjectiveUpsertRequest req, Principal principal) {
    var user = currentUserService.requireUser(principal);
    Objective prev =
        objectiveRepository
            .findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "objective_not_found"));

    if (req == null) req = new ObjectiveUpsertRequest(null, null, null, null, null, null, null);

    if (req.habitId() != null) {
      Habit habit =
          habitRepository
              .findByIdAndUserId(req.habitId(), user.getId())
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "habit_not_found"));
      prev.setHabit(habit);
    }
    if (req.startDate() != null) prev.setStartDate(req.startDate());
    if (req.endDate() != null) prev.setEndDate(req.endDate());
    if (prev.getStartDate() != null && prev.getEndDate() != null && prev.getStartDate().isAfter(prev.getEndDate())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "start_date_after_end_date");
    }
    if (req.notes() != null) prev.setNotes(req.notes());
    if (req.metricType() != null) prev.setMetricType(req.metricType());
    if (req.targetValue() != null) {
      if (req.targetValue() <= 0) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "target_value_required");
      }
      prev.setTargetValue(req.targetValue());
    }

    prev.setUpdatedAt(progressService.now());
    Objective saved = objectiveRepository.save(prev);

    var zone = progressService.defaultZone();
    var p = progressService.compute(saved, zone);
    ObjectiveStatus statusEntity =
        statusRepository
            .findByCode(p.statusCode())
            .orElseThrow(() -> new IllegalStateException("objective_status_missing:" + p.statusCode()));
    saved.setStatus(statusEntity);
    saved.setUpdatedAt(progressService.now());
    saved = objectiveRepository.save(saved);

    return new ObjectiveDto(
        saved.getId(),
        saved.getHabit().getId(),
        saved.getHabit().getName(),
        saved.getStartDate(),
        saved.getCreatedAt(),
        saved.getEndDate(),
        saved.getMetricType(),
        saved.getTargetValue(),
        p.progressValue(),
        saved.getStatus().getCode(),
        saved.getStatus().getLabel(),
        saved.getNotes(),
        saved.getUpdatedAt());
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable("id") String id, Principal principal) {
    var user = currentUserService.requireUser(principal);
    Objective prev =
        objectiveRepository
            .findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "objective_not_found"));
    objectiveRepository.delete(prev);
  }

  private static String emptyToNull(String s) {
    if (s == null) return null;
    String t = s.trim();
    return t.isEmpty() ? null : t;
  }
}

