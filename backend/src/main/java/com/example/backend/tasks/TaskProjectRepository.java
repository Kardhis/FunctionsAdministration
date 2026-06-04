package com.example.backend.tasks;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskProjectRepository extends JpaRepository<TaskProject, Long> {

  List<TaskProject> findAllByUserIdOrderByNameAsc(Long userId);

  Optional<TaskProject> findByIdAndUserId(Long id, Long userId);

  boolean existsByIdAndUserId(Long id, Long userId);
}
