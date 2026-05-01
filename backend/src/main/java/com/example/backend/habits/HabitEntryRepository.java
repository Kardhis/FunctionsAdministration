package com.example.backend.habits;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HabitEntryRepository extends JpaRepository<HabitEntry, String> {
  List<HabitEntry> findAllByUserIdOrderByDateDesc(Long userId);

  List<HabitEntry> findAllByUserIdAndDateBetweenOrderByDateAsc(Long userId, LocalDate from, LocalDate to);

  Optional<HabitEntry> findByIdAndUserId(String id, Long userId);

  @Query(
      "select coalesce(sum(e.durationMinutes), 0) from HabitEntry e"
          + " where e.user.id = :userId and e.habit.id = :habitId and e.date between :from and :to")
  long sumDurationMinutesForHabitBetween(
      @Param("userId") Long userId,
      @Param("habitId") String habitId,
      @Param("from") LocalDate from,
      @Param("to") LocalDate to);

  @Query(
      "select count(e) from HabitEntry e"
          + " where e.user.id = :userId and e.habit.id = :habitId and e.date between :from and :to")
  long countEntriesForHabitBetween(
      @Param("userId") Long userId,
      @Param("habitId") String habitId,
      @Param("from") LocalDate from,
      @Param("to") LocalDate to);
}

