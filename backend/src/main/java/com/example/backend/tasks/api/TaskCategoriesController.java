package com.example.backend.tasks.api;

import com.example.backend.tasks.TaskCategory;
import com.example.backend.tasks.TaskCategoryRepository;
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
@RequestMapping("/api/task-categories")
public class TaskCategoriesController {

  public record CategoryDto(Long id, String name, String color) {}
  public record CategoryRequest(String name, String color) {}

  private final TaskCategoryRepository categoryRepository;
  private final CurrentUserService currentUserService;

  public TaskCategoriesController(
      TaskCategoryRepository categoryRepository,
      CurrentUserService currentUserService) {
    this.categoryRepository = categoryRepository;
    this.currentUserService = currentUserService;
  }

  @GetMapping
  @Transactional(readOnly = true)
  public List<CategoryDto> list(Principal principal) {
    var user = currentUserService.requireUser(principal);
    return categoryRepository.findAllByUserIdOrderByNameAsc(user.getId())
        .stream()
        .map(c -> new CategoryDto(c.getId(), c.getName(), c.getColor()))
        .toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Transactional
  public CategoryDto create(@RequestBody CategoryRequest req, Principal principal) {
    var user = currentUserService.requireUser(principal);
    if (req == null || req.name() == null || req.name().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name_required");
    }
    Instant now = Instant.now();
    TaskCategory c = new TaskCategory();
    c.setUser(user);
    c.setName(req.name().trim());
    c.setColor(req.color() != null && !req.color().isBlank() ? req.color() : "#6366f1");
    c.setCreatedAt(now);
    c.setUpdatedAt(now);
    TaskCategory saved = categoryRepository.save(c);
    return new CategoryDto(saved.getId(), saved.getName(), saved.getColor());
  }

  @PutMapping("/{id}")
  @Transactional
  public CategoryDto update(
      @PathVariable Long id,
      @RequestBody CategoryRequest req,
      Principal principal) {
    var user = currentUserService.requireUser(principal);
    TaskCategory c = categoryRepository.findByIdAndUserId(id, user.getId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "category_not_found"));
    if (req == null || req.name() == null || req.name().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name_required");
    }
    c.setName(req.name().trim());
    if (req.color() != null && !req.color().isBlank()) c.setColor(req.color());
    c.setUpdatedAt(Instant.now());
    TaskCategory saved = categoryRepository.save(c);
    return new CategoryDto(saved.getId(), saved.getName(), saved.getColor());
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Transactional
  public void delete(@PathVariable Long id, Principal principal) {
    var user = currentUserService.requireUser(principal);
    TaskCategory c = categoryRepository.findByIdAndUserId(id, user.getId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "category_not_found"));
    categoryRepository.delete(c);
  }
}
