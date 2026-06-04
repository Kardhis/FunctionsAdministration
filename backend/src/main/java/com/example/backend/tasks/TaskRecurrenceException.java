package com.example.backend.tasks;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "task_recurrence_exceptions")
public class TaskRecurrenceException {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "task_id", nullable = false)
  private Task task;

  @Column(name = "occurrence_date", nullable = false)
  private LocalDate occurrenceDate;

  // COMPLETED | SKIPPED | RESCHEDULED | CANCELLED
  @Column(name = "action", nullable = false, length = 32)
  private String action;

  @Column(name = "planned_date_override")
  private LocalDate plannedDateOverride;

  @Column(name = "planned_time_override")
  private LocalTime plannedTimeOverride;

  @Column(name = "completed_at")
  private Instant completedAt;

  @Column(name = "notes", columnDefinition = "TEXT")
  private String notes;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  public Long getId() { return id; }

  public Task getTask() { return task; }
  public void setTask(Task task) { this.task = task; }

  public LocalDate getOccurrenceDate() { return occurrenceDate; }
  public void setOccurrenceDate(LocalDate occurrenceDate) { this.occurrenceDate = occurrenceDate; }

  public String getAction() { return action; }
  public void setAction(String action) { this.action = action; }

  public LocalDate getPlannedDateOverride() { return plannedDateOverride; }
  public void setPlannedDateOverride(LocalDate plannedDateOverride) { this.plannedDateOverride = plannedDateOverride; }

  public LocalTime getPlannedTimeOverride() { return plannedTimeOverride; }
  public void setPlannedTimeOverride(LocalTime plannedTimeOverride) { this.plannedTimeOverride = plannedTimeOverride; }

  public Instant getCompletedAt() { return completedAt; }
  public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

  public String getNotes() { return notes; }
  public void setNotes(String notes) { this.notes = notes; }

  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
