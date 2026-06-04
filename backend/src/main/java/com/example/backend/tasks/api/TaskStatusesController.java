package com.example.backend.tasks.api;

import com.example.backend.tasks.TaskStatus;
import com.example.backend.tasks.TaskStatusRepository;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/task-statuses")
public class TaskStatusesController {

  public record TaskStatusDto(Long id, String code, String label) {}

  private final TaskStatusRepository statusRepository;

  public TaskStatusesController(TaskStatusRepository statusRepository) {
    this.statusRepository = statusRepository;
  }

  @GetMapping
  @Transactional(readOnly = true)
  public List<TaskStatusDto> list() {
    return statusRepository.findAllByOrderByIdAsc()
        .stream()
        .map(s -> new TaskStatusDto(s.getId(), s.getCode(), s.getLabel()))
        .toList();
  }
}
