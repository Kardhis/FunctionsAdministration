package com.example.backend.categories.api;

import com.example.backend.categories.HabitCategory;
import com.example.backend.categories.HabitCategoryLinkRepository;
import com.example.backend.categories.HabitCategoryRepository;
import com.example.backend.users.CurrentUserService;
import java.security.Principal;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
@RequestMapping({"/api/habit-categories", "/api/categories"})
public class HabitCategoriesController {

  public record HabitCategoryDto(
      String id, String name, boolean active, long habitCount, Instant createdAt, Instant updatedAt) {}

  public record HabitCategoryCreateRequest(String id, String name, Boolean active) {}

  public record HabitCategoryUpdateRequest(String name, Boolean active) {}

  private final HabitCategoryRepository categoryRepository;
  private final HabitCategoryLinkRepository linkRepository;
  private final CurrentUserService currentUserService;

  public HabitCategoriesController(
      HabitCategoryRepository categoryRepository,
      HabitCategoryLinkRepository linkRepository,
      CurrentUserService currentUserService) {
    this.categoryRepository = categoryRepository;
    this.linkRepository = linkRepository;
    this.currentUserService = currentUserService;
  }

  @GetMapping
  public List<HabitCategoryDto> list(Principal principal) {
    var user = currentUserService.requireUser(principal);

    Map<String, Long> counts = new HashMap<>();
    for (Object[] row : linkRepository.countDistinctHabitsByCategoryIdForUser(user.getId())) {
      String categoryId = String.valueOf(row[0]);
      long cnt = ((Number) row[1]).longValue();
      counts.put(categoryId, cnt);
    }

    var rows = categoryRepository.findAllByUserIdOrderByNameAsc(user.getId());

    return rows.stream()
        .map(
            c ->
                new HabitCategoryDto(
                    c.getId(),
                    c.getName(),
                    c.isActive(),
                    counts.getOrDefault(c.getId(), 0L),
                    c.getCreatedAt(),
                    c.getUpdatedAt()))
        .toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public HabitCategoryDto create(@RequestBody HabitCategoryCreateRequest req, Principal principal) {
    var user = currentUserService.requireUser(principal);
    if (req == null || req.id() == null || req.id().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id_required");
    }
    if (req.name() == null || req.name().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name_required");
    }
    String name = req.name().trim();
    if (categoryRepository.existsByUserIdAndNameIgnoreCase(user.getId(), name)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "category_name_exists");
    }

    Instant now = Instant.now();
    HabitCategory c = new HabitCategory();
    c.setId(req.id());
    c.setUser(user);
    c.setName(name);
    c.setActive(req.active() == null ? true : req.active());
    c.setCreatedAt(now);
    c.setUpdatedAt(now);

    HabitCategory saved = categoryRepository.save(c);
    return new HabitCategoryDto(
        saved.getId(), saved.getName(), saved.isActive(), 0, saved.getCreatedAt(), saved.getUpdatedAt());
  }

  @PutMapping("/{id}")
  public HabitCategoryDto update(
      @PathVariable("id") String id, @RequestBody HabitCategoryUpdateRequest req, Principal principal) {
    var user = currentUserService.requireUser(principal);
    HabitCategory prev =
        categoryRepository
            .findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "category_not_found"));

    if (req == null) req = new HabitCategoryUpdateRequest(null, null);
    if (req.name() != null) {
      String nextName = req.name().trim();
      if (!nextName.equalsIgnoreCase(prev.getName())
          && categoryRepository.existsByUserIdAndNameIgnoreCase(user.getId(), nextName)) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "category_name_exists");
      }
      prev.setName(nextName);
    }
    if (req.active() != null) prev.setActive(req.active());
    prev.setUpdatedAt(Instant.now());

    // habitCount is returned by list; keep it lightweight here
    HabitCategory saved = categoryRepository.save(prev);
    long count = linkRepository.countDistinctHabitsByCategoryIdForUser(user.getId()).stream()
        .filter(r -> String.valueOf(r[0]).equals(saved.getId()))
        .map(r -> ((Number) r[1]).longValue())
        .findFirst()
        .orElse(0L);
    return new HabitCategoryDto(
        saved.getId(), saved.getName(), saved.isActive(), count, saved.getCreatedAt(), saved.getUpdatedAt());
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable("id") String id, Principal principal) {
    var user = currentUserService.requireUser(principal);
    HabitCategory prev =
        categoryRepository
            .findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "category_not_found"));
    categoryRepository.delete(prev);
  }
}

