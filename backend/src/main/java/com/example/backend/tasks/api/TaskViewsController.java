package com.example.backend.tasks.api;

import com.example.backend.tasks.TaskService;
import com.example.backend.tasks.TaskService.EisenhowerResponse;
import com.example.backend.tasks.TaskService.PagedTasksResponse;
import com.example.backend.tasks.TaskService.TaskDto;
import com.example.backend.tasks.TaskService.TaskSummaryDto;
import com.example.backend.tasks.TaskService.TodayResponse;
import com.example.backend.users.CurrentUserService;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskViewsController {

  private final TaskService taskService;
  private final CurrentUserService currentUserService;

  public TaskViewsController(TaskService taskService, CurrentUserService currentUserService) {
    this.taskService = taskService;
    this.currentUserService = currentUserService;
  }

  @GetMapping("/today")
  public TodayResponse today(
      @RequestParam(required = false) LocalDate date,
      Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.findToday(user.getId(), date);
  }

  @GetMapping("/eisenhower")
  public EisenhowerResponse eisenhower(Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.findEisenhower(user.getId());
  }

  @GetMapping("/calendar")
  public List<TaskDto> calendar(
      @RequestParam LocalDate from,
      @RequestParam LocalDate to,
      Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.findCalendar(user.getId(), from, to);
  }

  @GetMapping("/backlog")
  public PagedTasksResponse backlog(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "25") int size,
      Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.findBacklog(user.getId(), page, size);
  }

  @GetMapping("/search")
  public List<TaskSummaryDto> search(
      @RequestParam(required = false) String q,
      @RequestParam(defaultValue = "10") int limit,
      Principal principal) {
    var user = currentUserService.requireUser(principal);
    return taskService.search(user.getId(), q, limit);
  }
}
