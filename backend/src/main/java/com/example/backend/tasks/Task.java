package com.example.backend.tasks;

import com.example.backend.users.User;
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
@Table(name = "tasks")
public class Task {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "title", nullable = false, length = 160)
  private String title;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "task_status_id", nullable = false)
  private TaskStatus status;

  @Column(name = "due_date")
  private LocalDate dueDate;

  @Column(name = "planned_date")
  private LocalDate plannedDate;

  @Column(name = "planned_time")
  private LocalTime plannedTime;

  // NULL = unclassified (not in Eisenhower matrix yet)
  // TRUE/FALSE = classified
  @Column(name = "important")
  private Boolean important;

  @Column(name = "urgent")
  private Boolean urgent;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id")
  private TaskProject project;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id")
  private TaskCategory category;

  @Column(name = "is_recurring", nullable = false)
  private boolean recurring;

  @Column(name = "recurrence_type", length = 32)
  private String recurrenceType;

  @Column(name = "recurrence_interval")
  private Integer recurrenceInterval;

  @Column(name = "recurrence_end_date")
  private LocalDate recurrenceEndDate;

  @Column(name = "estimated_minutes")
  private Integer estimatedMinutes;

  @Column(name = "total_minutes")
  private Integer totalMinutes;

  @Column(name = "completed_at")
  private Instant completedAt;

  @Column(name = "deleted_at")
  private Instant deletedAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  public Long getId() { return id; }

  public User getUser() { return user; }
  public void setUser(User user) { this.user = user; }

  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }

  public String getDescription() { return description; }
  public void setDescription(String description) { this.description = description; }

  public TaskStatus getStatus() { return status; }
  public void setStatus(TaskStatus status) { this.status = status; }

  public LocalDate getDueDate() { return dueDate; }
  public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

  public LocalDate getPlannedDate() { return plannedDate; }
  public void setPlannedDate(LocalDate plannedDate) { this.plannedDate = plannedDate; }

  public LocalTime getPlannedTime() { return plannedTime; }
  public void setPlannedTime(LocalTime plannedTime) { this.plannedTime = plannedTime; }

  public Boolean getImportant() { return important; }
  public void setImportant(Boolean important) { this.important = important; }

  public Boolean getUrgent() { return urgent; }
  public void setUrgent(Boolean urgent) { this.urgent = urgent; }

  public TaskProject getProject() { return project; }
  public void setProject(TaskProject project) { this.project = project; }

  public TaskCategory getCategory() { return category; }
  public void setCategory(TaskCategory category) { this.category = category; }

  public boolean isRecurring() { return recurring; }
  public void setRecurring(boolean recurring) { this.recurring = recurring; }

  public String getRecurrenceType() { return recurrenceType; }
  public void setRecurrenceType(String recurrenceType) { this.recurrenceType = recurrenceType; }

  public Integer getRecurrenceInterval() { return recurrenceInterval; }
  public void setRecurrenceInterval(Integer recurrenceInterval) { this.recurrenceInterval = recurrenceInterval; }

  public LocalDate getRecurrenceEndDate() { return recurrenceEndDate; }
  public void setRecurrenceEndDate(LocalDate recurrenceEndDate) { this.recurrenceEndDate = recurrenceEndDate; }

  public Integer getEstimatedMinutes() { return estimatedMinutes; }
  public void setEstimatedMinutes(Integer estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }

  public Integer getTotalMinutes() { return totalMinutes; }
  public void setTotalMinutes(Integer totalMinutes) { this.totalMinutes = totalMinutes; }

  public Instant getCompletedAt() { return completedAt; }
  public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

  public Instant getDeletedAt() { return deletedAt; }
  public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }

  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
