package com.example.backend.tasks.api;

import com.example.backend.tasks.TaskService;
import com.example.backend.tasks.TaskService.CreateRequest;
import com.example.backend.tasks.TaskService.PagedTasksResponse;
import com.example.backend.tasks.TaskService.TaskDto;
import com.example.backend.tasks.TaskService.UpdateRequest;
import com.example.backend.users.CurrentUserService;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalTime;
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

@RestController
@RequestMapping("/api/tasks")
public class TasksController {

  // PATCH is not in CORS allowed methods — use POST for all action endpoints
  public record SchedulePayload(LocalDate plannedDate, LocalTime plannedTime) {}
  public record ClassifyPayload(Boolean important, Boolean urgent) {}

  private final TaskService taskService;
  private final CurrentUserService currentUserService;

  public TasksController(TaskService taskService, CurrentUserService currentUserService) {
    this.taskService = taskService;
    this.currentUserService = currentUserService;
  }

  // ------------------------------------------------------------------
  // List with filters
  // ------------------------------------------------------------------

  @GetMapping
  public PagedTasksResponse list(
      @RequestParam(required = false) String status,
      @RequestParam(required = false) Long projectId,
      @RequestParam(required = false) Long categoryId,
      @RequestParam(required = false) Boolean important,
      @RequestParam(required = false) Boolean urgent,
      @RequestParam(required = false) Boolean recurring,
      @RequestParam(required = false) String q,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "25") int size,
      Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.findFiltered(
        user.getId(), status, projectId, categoryId,
        important, urgent, recurring, q, page, size);
  }

  // ------------------------------------------------------------------
  // CRUD
  // ------------------------------------------------------------------

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public TaskDto create(@RequestBody CreateRequest req, Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.create(user, req);
  }

  @GetMapping("/{id}")
  public TaskDto getById(@PathVariable Long id, Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.findById(id, user.getId());
  }

  @PutMapping("/{id}")
  public TaskDto update(
      @PathVariable Long id,
      @RequestBody UpdateRequest req,
      Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.update(id, user, req);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id, Principal principal) {
    var user = currentUserService.requireUser(principal);
    taskService.softDelete(id, user.getId());
  }

  // ------------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------------

  @PostMapping("/{id}/duplicate")
  @ResponseStatus(HttpStatus.CREATED)
  public TaskDto duplicate(@PathVariable Long id, Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.duplicate(id, user.getId());
  }

  @PostMapping("/{id}/complete")
  public TaskDto complete(@PathVariable Long id, Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.complete(id, user.getId());
  }

  @PostMapping("/{id}/cancel")
  public TaskDto cancel(@PathVariable Long id, Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.cancel(id, user.getId());
  }

  @PostMapping("/{id}/start")
  public TaskDto start(@PathVariable Long id, Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.start(id, user.getId());
  }

  @PostMapping("/{id}/block")
  public TaskDto block(@PathVariable Long id, Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.block(id, user.getId());
  }

  @PostMapping("/{id}/reopen")
  public TaskDto reopen(@PathVariable Long id, Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.reopen(id, user.getId());
  }

  @PostMapping("/{id}/schedule")
  public TaskDto schedule(
      @PathVariable Long id,
      @RequestBody SchedulePayload payload,
      Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.schedule(id, user.getId(),
        payload != null ? payload.plannedDate() : null,
        payload != null ? payload.plannedTime() : null);
  }

  @PostMapping("/{id}/classify")
  public TaskDto classify(
      @PathVariable Long id,
      @RequestBody ClassifyPayload payload,
      Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.classify(id, user.getId(),
        payload != null ? payload.important() : null,
        payload != null ? payload.urgent() : null);
  }
}
