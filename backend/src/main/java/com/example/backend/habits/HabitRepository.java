package com.example.backend.habits;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HabitRepository extends JpaRepository<Habit, String> {
  List<Habit> findAllByUserIdOrderByCreatedAtDesc(Long userId);

  Optional<Habit> findByIdAndUserId(String id, Long userId);
}

