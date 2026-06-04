package com.example.backend.tasks.api;

import com.example.backend.tasks.TaskProject;
import com.example.backend.tasks.TaskProjectRepository;
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
@RequestMapping("/api/task-projects")
public class TaskProjectsController {

  public record ProjectDto(Long id, String name, String color) {}
  public record ProjectRequest(String name, String color) {}

  private final TaskProjectRepository projectRepository;
  private final CurrentUserService currentUserService;

  public TaskProjectsController(
      TaskProjectRepository projectRepository,
      CurrentUserService currentUserService) {
    this.projectRepository = projectRepository;
    this.currentUserService = currentUserService;
  }

  @GetMapping
  @Transactional(readOnly = true)
  public List<ProjectDto> list(Principal principal) {
    var user = currentUserService.requireUser(principal);
    return projectRepository.findAllByUserIdOrderByNameAsc(user.getId())
        .stream()
        .map(p -> new ProjectDto(p.getId(), p.getName(), p.getColor()))
        .toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Transactional
  public ProjectDto create(@RequestBody ProjectRequest req, Principal principal) {
    var user = currentUserService.requireUser(principal);
    if (req == null || req.name() == null || req.name().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name_required");
    }
    Instant now = Instant.now();
    TaskProject p = new TaskProject();
    p.setUser(user);
    p.setName(req.name().trim());
    p.setColor(req.color() != null && !req.color().isBlank() ? req.color() : "#6366f1");
    p.setCreatedAt(now);
    p.setUpdatedAt(now);
    TaskProject saved = projectRepository.save(p);
    return new ProjectDto(saved.getId(), saved.getName(), saved.getColor());
  }

  @PutMapping("/{id}")
  @Transactional
  public ProjectDto update(
      @PathVariable Long id,
      @RequestBody ProjectRequest req,
      Principal principal) {
    var user = currentUserService.requireUser(principal);
    TaskProject p = projectRepository.findByIdAndUserId(id, user.getId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "project_not_found"));
    if (req == null || req.name() == null || req.name().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name_required");
    }
    p.setName(req.name().trim());
    if (req.color() != null && !req.color().isBlank()) p.setColor(req.color());
    p.setUpdatedAt(Instant.now());
    TaskProject saved = projectRepository.save(p);
    return new ProjectDto(saved.getId(), saved.getName(), saved.getColor());
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Transactional
  public void delete(@PathVariable Long id, Principal principal) {
    var user = currentUserService.requireUser(principal);
    TaskProject p = projectRepository.findByIdAndUserId(id, user.getId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "project_not_found"));
    projectRepository.delete(p);
  }
}
