package com.example.backend.categories;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HabitCategoryRepository extends JpaRepository<HabitCategory, String> {
  List<HabitCategory> findAllByUserIdOrderByNameAsc(Long userId);

  Optional<HabitCategory> findByIdAndUserId(String id, Long userId);

  boolean existsByUserIdAndNameIgnoreCase(Long userId, String name);
}

