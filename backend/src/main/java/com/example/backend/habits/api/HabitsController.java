package com.example.backend.habits.api;

import com.example.backend.habits.Habit;
import com.example.backend.habits.HabitRepository;
import com.example.backend.users.CurrentUserService;
import java.security.Principal;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/habits")
public class HabitsController {

  public record HabitDto(
      String id,
      String name,
      String description,
      String color,
      String icon,
      Habit.Category category,
      boolean active,
      Habit.TargetType targetType,
      java.math.BigDecimal targetValue,
      Habit.TargetPeriod targetPeriod,
      Instant createdAt,
      Instant updatedAt) {}

  public record HabitUpsertRequest(
      String id,
      String name,
      String description,
      String color,
      String icon,
      Habit.Category category,
      Boolean active,
      Habit.TargetType targetType,
      java.math.BigDecimal targetValue,
      Habit.TargetPeriod targetPeriod) {}

  private final HabitRepository habitRepository;
  private final CurrentUserService currentUserService;

  public HabitsController(HabitRepository habitRepository, CurrentUserService currentUserService) {
    this.habitRepository = habitRepository;
    this.currentUserService = currentUserService;
  }

  @GetMapping
  public List<HabitDto> list(Principal principal) {
    var user = currentUserService.requireUser(principal);
    return habitRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId()).stream()
        .map(HabitsController::toDto)
        .toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public HabitDto create(@RequestBody HabitUpsertRequest req, Principal principal) {
    var user = currentUserService.requireUser(principal);
    if (req == null || req.id() == null || req.id().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id_required");
    }
    if (req.name() == null || req.name().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name_required");
    }
    if (req.color() == null || req.color().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "color_required");
    }
    if (req.targetType() == null || req.targetValue() == null || req.targetPeriod() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "target_required");
    }

    boolean exists = habitRepository.findByIdAndUserId(req.id(), user.getId()).isPresent();
    if (exists) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "habit_exists");
    }

    Instant now = Instant.now();
    Habit h = new Habit();
    h.setId(req.id());
    h.setUser(user);
    h.setName(req.name());
    h.setDescription(req.description());
    h.setColor(req.color());
    h.setIcon(req.icon());
    h.setCategory(req.category());
    h.setActive(req.active() == null ? true : req.active());
    h.setTargetType(req.targetType());
    h.setTargetValue(req.targetValue());
    h.setTargetPeriod(req.targetPeriod());
    h.setCreatedAt(now);
    h.setUpdatedAt(now);

    return toDto(habitRepository.save(h));
  }

  @PutMapping("/{id}")
  public HabitDto update(
      @PathVariable("id") String id, @RequestBody HabitUpsertRequest req, Principal principal) {
    var user = currentUserService.requireUser(principal);
    Habit prev =
        habitRepository
            .findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "habit_not_found"));

    if (req == null) req = new HabitUpsertRequest(null, null, null, null, null, null, null, null, null, null);

    if (req.name() != null) prev.setName(req.name());
    if (req.description() != null || (req.description() == null && reqHasField(req, "description"))) {
      prev.setDescription(req.description());
    }
    if (req.color() != null) prev.setColor(req.color());
    if (req.icon() != null || (req.icon() == null && reqHasField(req, "icon"))) {
      prev.setIcon(req.icon());
    }
    if (req.category() != null || (req.category() == null && reqHasField(req, "category"))) {
      prev.setCategory(req.category());
    }
    if (req.active() != null) prev.setActive(req.active());
    if (req.targetType() != null) prev.setTargetType(req.targetType());
    if (req.targetValue() != null) prev.setTargetValue(req.targetValue());
    if (req.targetPeriod() != null) prev.setTargetPeriod(req.targetPeriod());
    prev.setUpdatedAt(Instant.now());

    return toDto(habitRepository.save(prev));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable("id") String id, Principal principal) {
    var user = currentUserService.requireUser(principal);
    Habit h =
        habitRepository
            .findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "habit_not_found"));
    habitRepository.delete(h);
  }

  private static HabitDto toDto(Habit h) {
    return new HabitDto(
        h.getId(),
        h.getName(),
        h.getDescription(),
        h.getColor(),
        h.getIcon(),
        h.getCategory(),
        h.isActive(),
        h.getTargetType(),
        h.getTargetValue(),
        h.getTargetPeriod(),
        h.getCreatedAt(),
        h.getUpdatedAt());
  }

  private static boolean reqHasField(HabitUpsertRequest req, String name) {
    // We don't have raw JSON access here; treat nulls as "not provided" except for fields
    // that the frontend explicitly sends as null (it does for icon/description/category).
    // For MVP, we assume null means "clear" for icon/description/category only when caller sets it.
    // This helper is a placeholder for future JSON Merge Patch support.
    return switch (name) {
      case "description", "icon", "category" -> true;
      default -> false;
    };
  }
}

