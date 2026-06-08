package com.example.backend.tasks;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Long> {

  Optional<Task> findByIdAndUserIdAndDeletedAtIsNull(Long id, Long userId);

  // Paginated filtered list — specific status filter
  @Query(value = """
      SELECT t FROM Task t
      WHERE t.user.id = :userId
        AND t.deletedAt IS NULL
        AND t.status.code = :statusCode
        AND (:projectId IS NULL OR t.project.id = :projectId)
        AND (:categoryId IS NULL OR t.category.id = :categoryId)
        AND (:important IS NULL OR t.important = :important)
        AND (:urgent IS NULL OR t.urgent = :urgent)
        AND (:isRecurring IS NULL OR t.recurring = :isRecurring)
        AND (:titleQuery IS NULL OR LOWER(t.title) LIKE :titleQuery)
      ORDER BY t.plannedDate ASC NULLS LAST, t.plannedTime ASC NULLS LAST, t.id ASC
      """,
      countQuery = """
      SELECT COUNT(t) FROM Task t
      WHERE t.user.id = :userId
        AND t.deletedAt IS NULL
        AND t.status.code = :statusCode
        AND (:projectId IS NULL OR t.project.id = :projectId)
        AND (:categoryId IS NULL OR t.category.id = :categoryId)
        AND (:important IS NULL OR t.important = :important)
        AND (:urgent IS NULL OR t.urgent = :urgent)
        AND (:isRecurring IS NULL OR t.recurring = :isRecurring)
        AND (:titleQuery IS NULL OR LOWER(t.title) LIKE :titleQuery)
      """)
  Page<Task> findFilteredByStatus(
      @Param("userId") Long userId,
      @Param("statusCode") String statusCode,
      @Param("projectId") Long projectId,
      @Param("categoryId") Long categoryId,
      @Param("important") Boolean important,
      @Param("urgent") Boolean urgent,
      @Param("isRecurring") Boolean isRecurring,
      @Param("titleQuery") String titleQuery,
      Pageable pageable);

  // Paginated filtered list — all statuses (no status filter)
  @Query(value = """
      SELECT t FROM Task t
      WHERE t.user.id = :userId
        AND t.deletedAt IS NULL
        AND (:projectId IS NULL OR t.project.id = :projectId)
        AND (:categoryId IS NULL OR t.category.id = :categoryId)
        AND (:important IS NULL OR t.important = :important)
        AND (:urgent IS NULL OR t.urgent = :urgent)
        AND (:isRecurring IS NULL OR t.recurring = :isRecurring)
        AND (:titleQuery IS NULL OR LOWER(t.title) LIKE :titleQuery)
      ORDER BY t.plannedDate ASC NULLS LAST, t.plannedTime ASC NULLS LAST, t.id ASC
      """,
      countQuery = """
      SELECT COUNT(t) FROM Task t
      WHERE t.user.id = :userId
        AND t.deletedAt IS NULL
        AND (:projectId IS NULL OR t.project.id = :projectId)
        AND (:categoryId IS NULL OR t.category.id = :categoryId)
        AND (:important IS NULL OR t.important = :important)
        AND (:urgent IS NULL OR t.urgent = :urgent)
        AND (:isRecurring IS NULL OR t.recurring = :isRecurring)
        AND (:titleQuery IS NULL OR LOWER(t.title) LIKE :titleQuery)
      """)
  Page<Task> findFilteredAll(
      @Param("userId") Long userId,
      @Param("projectId") Long projectId,
      @Param("categoryId") Long categoryId,
      @Param("important") Boolean important,
      @Param("urgent") Boolean urgent,
      @Param("isRecurring") Boolean isRecurring,
      @Param("titleQuery") String titleQuery,
      Pageable pageable);

  // Paginated filtered list — default view excludes completed tasks
  @Query(value = """
      SELECT t FROM Task t
      WHERE t.user.id = :userId
        AND t.deletedAt IS NULL
        AND t.status.code <> 'COMPLETADA'
        AND (:projectId IS NULL OR t.project.id = :projectId)
        AND (:categoryId IS NULL OR t.category.id = :categoryId)
        AND (:important IS NULL OR t.important = :important)
        AND (:urgent IS NULL OR t.urgent = :urgent)
        AND (:isRecurring IS NULL OR t.recurring = :isRecurring)
        AND (:titleQuery IS NULL OR LOWER(t.title) LIKE :titleQuery)
      ORDER BY t.plannedDate ASC NULLS LAST, t.plannedTime ASC NULLS LAST, t.id ASC
      """,
      countQuery = """
      SELECT COUNT(t) FROM Task t
      WHERE t.user.id = :userId
        AND t.deletedAt IS NULL
        AND t.status.code <> 'COMPLETADA'
        AND (:projectId IS NULL OR t.project.id = :projectId)
        AND (:categoryId IS NULL OR t.category.id = :categoryId)
        AND (:important IS NULL OR t.important = :important)
        AND (:urgent IS NULL OR t.urgent = :urgent)
        AND (:isRecurring IS NULL OR t.recurring = :isRecurring)
        AND (:titleQuery IS NULL OR LOWER(t.title) LIKE :titleQuery)
      """)
  Page<Task> findFilteredExcludingCompleted(
      @Param("userId") Long userId,
      @Param("projectId") Long projectId,
      @Param("categoryId") Long categoryId,
      @Param("important") Boolean important,
      @Param("urgent") Boolean urgent,
      @Param("isRecurring") Boolean isRecurring,
      @Param("titleQuery") String titleQuery,
      Pageable pageable);

  // Today: planned for a specific date, not finished, ordered by time
  @Query("""
      SELECT t FROM Task t
      WHERE t.user.id = :userId
        AND t.deletedAt IS NULL
        AND t.plannedDate = :date
        AND t.status.code NOT IN ('COMPLETADA','CANCELADA')
      ORDER BY t.plannedTime ASC, t.id ASC
      """)
  List<Task> findPlannedForDate(@Param("userId") Long userId, @Param("date") LocalDate date);

  // Overdue: due_date < today, not finished
  @Query("""
      SELECT t FROM Task t
      WHERE t.user.id = :userId
        AND t.deletedAt IS NULL
        AND t.dueDate < :today
        AND t.status.code NOT IN ('COMPLETADA','CANCELADA')
      ORDER BY t.dueDate ASC, t.id ASC
      """)
  List<Task> findOverdue(@Param("userId") Long userId, @Param("today") LocalDate today);

  // Important + unplanned (backlog with important=true)
  @Query("""
      SELECT t FROM Task t
      WHERE t.user.id = :userId
        AND t.deletedAt IS NULL
        AND t.important = true
        AND t.plannedDate IS NULL
        AND t.status.code NOT IN ('COMPLETADA','CANCELADA')
      ORDER BY t.createdAt DESC
      """)
  List<Task> findImportantUnplanned(@Param("userId") Long userId);

  // Eisenhower: all active tasks
  @Query("""
      SELECT t FROM Task t
      WHERE t.user.id = :userId
        AND t.deletedAt IS NULL
        AND t.status.code NOT IN ('COMPLETADA','CANCELADA')
      ORDER BY t.createdAt DESC
      """)
  List<Task> findAllActiveForEisenhower(@Param("userId") Long userId);

  // Calendar: tasks with planned_date in range
  @Query("""
      SELECT t FROM Task t
      WHERE t.user.id = :userId
        AND t.deletedAt IS NULL
        AND t.plannedDate BETWEEN :from AND :to
        AND t.status.code NOT IN ('CANCELADA')
      ORDER BY t.plannedDate ASC, t.plannedTime ASC, t.id ASC
      """)
  List<Task> findCalendarRange(
      @Param("userId") Long userId,
      @Param("from") LocalDate from,
      @Param("to") LocalDate to);

  // Backlog: not planned, not finished — paginated
  @Query(value = """
      SELECT t FROM Task t
      WHERE t.user.id = :userId
        AND t.deletedAt IS NULL
        AND t.plannedDate IS NULL
        AND t.status.code NOT IN ('COMPLETADA','CANCELADA')
      ORDER BY t.createdAt DESC
      """,
      countQuery = """
      SELECT COUNT(t) FROM Task t
      WHERE t.user.id = :userId
        AND t.deletedAt IS NULL
        AND t.plannedDate IS NULL
        AND t.status.code NOT IN ('COMPLETADA','CANCELADA')
      """)
  Page<Task> findBacklog(@Param("userId") Long userId, Pageable pageable);

  // Search autocomplete — bounded with LIMIT via Pageable
  @Query("""
      SELECT t FROM Task t
      WHERE t.user.id = :userId
        AND t.deletedAt IS NULL
        AND t.status.code NOT IN ('COMPLETADA','CANCELADA')
        AND LOWER(t.title) LIKE :q
      ORDER BY t.title ASC
      """)
  List<Task> searchByTitle(
      @Param("userId") Long userId,
      @Param("q") String q,
      Pageable pageable);
}
