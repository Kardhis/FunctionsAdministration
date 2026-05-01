package com.example.backend.objectives.api;

import com.example.backend.objectives.ObjectiveStatus;
import com.example.backend.objectives.ObjectiveStatusRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/objective-statuses")
public class ObjectiveStatusesController {

  public record ObjectiveStatusDto(Long id, String code, String label) {}

  private final ObjectiveStatusRepository statusRepository;

  public ObjectiveStatusesController(ObjectiveStatusRepository statusRepository) {
    this.statusRepository = statusRepository;
  }

  @GetMapping
  public List<ObjectiveStatusDto> list() {
    return statusRepository.findAll().stream()
        .map(s -> new ObjectiveStatusDto(s.getId(), s.getCode(), s.getLabel()))
        .toList();
  }
}

