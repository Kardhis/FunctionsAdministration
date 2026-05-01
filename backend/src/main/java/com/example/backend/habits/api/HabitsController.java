package com.example.backend.habits.api;

import com.example.backend.habits.Habit;
import com.example.backend.habits.HabitRepository;
import com.example.backend.categories.HabitCategory;
import com.example.backend.categories.HabitCategoryLink;
import com.example.backend.categories.HabitCategoryLinkKey;
import com.example.backend.categories.HabitCategoryLinkRepository;
import com.example.backend.categories.HabitCategoryRepository;
import com.example.backend.users.CurrentUserService;
import java.security.Principal;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
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
      List<String> categoryIds,
      boolean active,
      Instant createdAt,
      Instant updatedAt) {}

  public record HabitUpsertRequest(
      String id,
      String name,
      String description,
      String color,
      String icon,
      List<String> categoryIds,
      Boolean active) {}

  private final HabitRepository habitRepository;
  private final HabitCategoryRepository habitCategoryRepository;
  private final HabitCategoryLinkRepository habitCategoryLinkRepository;
  private final CurrentUserService currentUserService;

  public HabitsController(
      HabitRepository habitRepository,
      HabitCategoryRepository habitCategoryRepository,
      HabitCategoryLinkRepository habitCategoryLinkRepository,
      CurrentUserService currentUserService) {
    this.habitRepository = habitRepository;
    this.habitCategoryRepository = habitCategoryRepository;
    this.habitCategoryLinkRepository = habitCategoryLinkRepository;
    this.currentUserService = currentUserService;
  }

  @GetMapping
  public List<HabitDto> list(Principal principal) {
    var user = currentUserService.requireUser(principal);
    return habitRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId()).stream()
        .map(h -> toDto(h, habitCategoryLinkRepository.findCategoryIdsByHabitId(h.getId())))
        .toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Transactional
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
    h.setActive(req.active() == null ? true : req.active());
    h.setCreatedAt(now);
    h.setUpdatedAt(now);

    Habit saved = habitRepository.save(h);
    habitRepository.flush();
    replaceHabitCategories(saved, user.getId(), req.categoryIds());
    return toDto(saved, habitCategoryLinkRepository.findCategoryIdsByHabitId(saved.getId()));
  }

  @PutMapping("/{id}")
  @Transactional
  public HabitDto update(
      @PathVariable("id") String id, @RequestBody HabitUpsertRequest req, Principal principal) {
    var user = currentUserService.requireUser(principal);
    Habit prev =
        habitRepository
            .findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "habit_not_found"));

    if (req == null) req = new HabitUpsertRequest(null, null, null, null, null, null, null);

    if (req.name() != null) prev.setName(req.name());
    if (req.description() != null || (req.description() == null && reqHasField(req, "description"))) {
      prev.setDescription(req.description());
    }
    if (req.color() != null) prev.setColor(req.color());
    if (req.icon() != null || (req.icon() == null && reqHasField(req, "icon"))) {
      prev.setIcon(req.icon());
    }
    if (req.active() != null) prev.setActive(req.active());
    prev.setUpdatedAt(Instant.now());

    Habit saved = habitRepository.save(prev);
    habitRepository.flush();
    if (req.categoryIds() != null) {
      replaceHabitCategories(saved, user.getId(), req.categoryIds());
    }
    return toDto(saved, habitCategoryLinkRepository.findCategoryIdsByHabitId(saved.getId()));
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

  private static HabitDto toDto(Habit h, List<String> categoryIds) {
    return new HabitDto(
        h.getId(),
        h.getName(),
        h.getDescription(),
        h.getColor(),
        h.getIcon(),
        categoryIds == null ? List.of() : categoryIds,
        h.isActive(),
        h.getCreatedAt(),
        h.getUpdatedAt());
  }

  private static boolean reqHasField(HabitUpsertRequest req, String name) {
    // We don't have raw JSON access here; treat nulls as "not provided" except for fields
    // that the frontend explicitly sends as null (it does for icon/description/category).
    // For MVP, we assume null means "clear" for icon/description/category only when caller sets it.
    // This helper is a placeholder for future JSON Merge Patch support.
    return switch (name) {
      case "description", "icon" -> true;
      default -> false;
    };
  }

  private void replaceHabitCategories(Habit habit, Long userId, List<String> categoryIds) {
    habitCategoryLinkRepository.deleteAllByIdHabitId(habit.getId());
    if (categoryIds == null || categoryIds.isEmpty()) return;

    for (String categoryId : categoryIds) {
      if (categoryId == null || categoryId.isBlank()) continue;
      HabitCategory category =
          habitCategoryRepository
              .findByIdAndUserId(categoryId, userId)
              .orElseThrow(
                  () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "category_not_found"));

      HabitCategoryLink link = new HabitCategoryLink();
      link.setHabit(habit);
      link.setCategory(category);
      link.setId(new HabitCategoryLinkKey(habit.getId(), category.getId()));
      habitCategoryLinkRepository.save(link);
    }
  }
}

