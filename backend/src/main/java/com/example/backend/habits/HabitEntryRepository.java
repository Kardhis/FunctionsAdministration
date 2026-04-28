package com.example.backend.habits;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HabitEntryRepository extends JpaRepository<HabitEntry, String> {
  List<HabitEntry> findAllByUserIdOrderByDateDesc(Long userId);

  List<HabitEntry> findAllByUserIdAndDateBetweenOrderByDateAsc(Long userId, LocalDate from, LocalDate to);

  Optional<HabitEntry> findByIdAndUserId(String id, Long userId);
}

