package com.example.backend.tasks;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskStatusRepository extends JpaRepository<TaskStatus, Long> {

  Optional<TaskStatus> findByCode(String code);

  List<TaskStatus> findAllByOrderByIdAsc();
}
