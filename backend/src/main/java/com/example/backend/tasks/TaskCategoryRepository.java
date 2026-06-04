package com.example.backend.tasks;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskCategoryRepository extends JpaRepository<TaskCategory, Long> {

  List<TaskCategory> findAllByUserIdOrderByNameAsc(Long userId);

  Optional<TaskCategory> findByIdAndUserId(Long id, Long userId);

  boolean existsByIdAndUserId(Long id, Long userId);
}
