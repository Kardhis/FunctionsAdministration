package com.example.backend.tasks;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRecurrenceExceptionRepository extends JpaRepository<TaskRecurrenceException, Long> {

  List<TaskRecurrenceException> findAllByTaskId(Long taskId);

  Optional<TaskRecurrenceException> findByTaskIdAndOccurrenceDate(Long taskId, LocalDate occurrenceDate);

  List<TaskRecurrenceException> findAllByTaskIdAndOccurrenceDateBetween(
      Long taskId, LocalDate from, LocalDate to);
}
