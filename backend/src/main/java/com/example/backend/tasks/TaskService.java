package com.example.backend.tasks;

import com.example.backend.users.User;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TaskService {

  private static final Set<String> FINAL_STATUSES = Set.of("COMPLETADA", "CANCELADA");

  private static final Map<String, Set<String>> ALLOWED_TRANSITIONS = Map.of(
      "BACKLOG",     Set.of("PENDIENTE", "PLANIFICADA", "CANCELADA"),
      "PENDIENTE",   Set.of("PLANIFICADA", "EN_PROGRESO", "BLOQUEADA", "COMPLETADA", "CANCELADA", "BACKLOG"),
      "PLANIFICADA", Set.of("EN_PROGRESO", "BLOQUEADA", "COMPLETADA", "CANCELADA", "BACKLOG"),
      "EN_PROGRESO", Set.of("BLOQUEADA", "COMPLETADA", "CANCELADA", "PENDIENTE"),
      "BLOQUEADA",   Set.of("PENDIENTE", "PLANIFICADA", "CANCELADA"),
      "COMPLETADA",  Set.of("PENDIENTE", "PLANIFICADA"),
      "CANCELADA",   Set.of("PENDIENTE", "PLANIFICADA")
  );

  private final TaskRepository taskRepository;
  private final TaskStatusRepository statusRepository;
  private final TaskProjectRepository projectRepository;
  private final TaskCategoryRepository categoryRepository;

  public TaskService(
      TaskRepository taskRepository,
      TaskStatusRepository statusRepository,
      TaskProjectRepository projectRepository,
      TaskCategoryRepository categoryRepository) {
    this.taskRepository = taskRepository;
    this.statusRepository = statusRepository;
    this.projectRepository = projectRepository;
    this.categoryRepository = categoryRepository;
  }

  // -----------------------------------------------------------------------
  // DTOs
  // -----------------------------------------------------------------------

  public record TaskDto(
      Long id,
      String title,
      String description,
      String status,
      String statusLabel,
      LocalDate dueDate,
      LocalDate plannedDate,
      LocalTime plannedTime,
      Boolean important,
      Boolean urgent,
      Long projectId,
      String projectName,
      String projectColor,
      Long categoryId,
      String categoryName,
      String categoryColor,
      boolean recurring,
      String recurrenceType,
      Integer recurrenceInterval,
      LocalDate recurrenceEndDate,
      Integer estimatedMinutes,
      Integer totalMinutes,
      Instant completedAt,
      Instant createdAt,
      Instant updatedAt,
      boolean overdue) {}

  public record TaskSummaryDto(Long id, String title, String status, LocalDate plannedDate) {}

  public record PagedTasksResponse(
      List<TaskDto> content,
      int page,
      int size,
      long totalElements,
      int totalPages,
      boolean first,
      boolean last) {}

  public record TodayResponse(
      List<TaskDto> plannedToday,
      List<TaskDto> overdue,
      List<TaskDto> importantUnplanned) {}

  public record EisenhowerResponse(
      List<TaskDto> importantUrgent,
      List<TaskDto> importantNotUrgent,
      List<TaskDto> notImportantUrgent,
      List<TaskDto> notImportantNotUrgent,
      List<TaskDto> unclassified) {}

  // -----------------------------------------------------------------------
  // Reads
  // -----------------------------------------------------------------------

  @Transactional(readOnly = true)
  public PagedTasksResponse findFiltered(
      Long userId,
      String status,
      Long projectId,
      Long categoryId,
      Boolean important,
      Boolean urgent,
      Boolean isRecurring,
      String q,
      int page,
      int size) {

    String titleQuery = (q != null && !q.isBlank()) ? "%" + q.trim().toLowerCase() + "%" : null;
    Pageable pageable = PageRequest.of(page, Math.min(size, 100));

    Page<Task> result = taskRepository.findFiltered(
        userId, emptyToNull(status), projectId, categoryId,
        important, urgent, isRecurring, titleQuery, pageable);

    LocalDate today = LocalDate.now();
    List<TaskDto> content = result.getContent().stream().map(t -> toDto(t, today)).toList();
    return new PagedTasksResponse(content, result.getNumber(), result.getSize(),
        result.getTotalElements(), result.getTotalPages(), result.isFirst(), result.isLast());
  }

  @Transactional(readOnly = true)
  public TaskDto findById(Long taskId, Long userId) {
    return toDto(requireTask(taskId, userId), LocalDate.now());
  }

  @Transactional(readOnly = true)
  public TodayResponse findToday(Long userId, LocalDate date) {
    LocalDate today = date != null ? date : LocalDate.now();
    List<TaskDto> planned = taskRepository.findPlannedForDate(userId, today)
        .stream().map(t -> toDto(t, today)).toList();
    List<TaskDto> overdue = taskRepository.findOverdue(userId, today)
        .stream().map(t -> toDto(t, today)).toList();
    List<TaskDto> importantUnplanned = taskRepository.findImportantUnplanned(userId)
        .stream().map(t -> toDto(t, today)).toList();
    return new TodayResponse(planned, overdue, importantUnplanned);
  }

  @Transactional(readOnly = true)
  public EisenhowerResponse findEisenhower(Long userId) {
    LocalDate today = LocalDate.now();
    List<Task> all = taskRepository.findAllActiveForEisenhower(userId);

    List<TaskDto> q1  = filter(all, today, Boolean.TRUE,  Boolean.TRUE);
    List<TaskDto> q2  = filter(all, today, Boolean.TRUE,  Boolean.FALSE);
    List<TaskDto> q3  = filter(all, today, Boolean.FALSE, Boolean.TRUE);
    List<TaskDto> q4  = filter(all, today, Boolean.FALSE, Boolean.FALSE);
    List<TaskDto> unc = all.stream()
        .filter(t -> t.getImportant() == null && t.getUrgent() == null)
        .map(t -> toDto(t, today))
        .toList();

    return new EisenhowerResponse(q1, q2, q3, q4, unc);
  }

  @Transactional(readOnly = true)
  public List<TaskDto> findCalendar(Long userId, LocalDate from, LocalDate to) {
    if (from == null || to == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "from_and_to_required");
    }
    if (from.isAfter(to)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "from_after_to");
    }
    LocalDate today = LocalDate.now();
    return taskRepository.findCalendarRange(userId, from, to)
        .stream().map(t -> toDto(t, today)).toList();
  }

  @Transactional(readOnly = true)
  public PagedTasksResponse findBacklog(Long userId, int page, int size) {
    Pageable pageable = PageRequest.of(page, Math.min(size, 100));
    Page<Task> result = taskRepository.findBacklog(userId, pageable);
    LocalDate today = LocalDate.now();
    List<TaskDto> content = result.getContent().stream().map(t -> toDto(t, today)).toList();
    return new PagedTasksResponse(content, result.getNumber(), result.getSize(),
        result.getTotalElements(), result.getTotalPages(), result.isFirst(), result.isLast());
  }

  @Transactional(readOnly = true)
  public List<TaskSummaryDto> search(Long userId, String q, int limit) {
    if (q == null || q.isBlank()) return List.of();
    String pattern = "%" + q.trim().toLowerCase() + "%";
    Pageable pageable = PageRequest.of(0, Math.min(limit, 20));
    return taskRepository.searchByTitle(userId, pattern, pageable)
        .stream()
        .map(t -> new TaskSummaryDto(t.getId(), t.getTitle(), t.getStatus().getCode(), t.getPlannedDate()))
        .toList();
  }

  // -----------------------------------------------------------------------
  // Writes
  // -----------------------------------------------------------------------

  @Transactional
  public TaskDto create(User user, CreateRequest req) {
    if (req.title() == null || req.title().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title_required");
    }
    if (req.plannedTime() != null && req.plannedDate() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "planned_time_requires_planned_date");
    }
    if (req.recurring()) {
      if (req.recurrenceType() == null || req.recurrenceType().isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "recurrence_type_required");
      }
      if (req.recurrenceInterval() == null || req.recurrenceInterval() < 1) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "recurrence_interval_required");
      }
    }

    String initialCode = req.plannedDate() != null ? "PLANIFICADA" : "BACKLOG";
    TaskStatus status = requireStatus(initialCode);

    Instant now = Instant.now();
    Task t = new Task();
    t.setUser(user);
    t.setTitle(req.title().trim());
    t.setDescription(req.description());
    t.setStatus(status);
    t.setDueDate(req.dueDate());
    t.setPlannedDate(req.plannedDate());
    t.setPlannedTime(req.plannedTime());
    t.setImportant(req.important());
    t.setUrgent(req.urgent());
    t.setProject(resolveProject(req.projectId(), user.getId()));
    t.setCategory(resolveCategory(req.categoryId(), user.getId()));
    t.setRecurring(req.recurring());
    t.setRecurrenceType(req.recurring() ? req.recurrenceType() : null);
    t.setRecurrenceInterval(req.recurring() ? req.recurrenceInterval() : null);
    t.setRecurrenceEndDate(req.recurring() ? req.recurrenceEndDate() : null);
    t.setEstimatedMinutes(req.estimatedMinutes());
    t.setCreatedAt(now);
    t.setUpdatedAt(now);

    return toDto(taskRepository.save(t), LocalDate.now());
  }

  @Transactional
  public TaskDto update(Long taskId, User user, UpdateRequest req) {
    Task t = requireTask(taskId, user.getId());

    if (req.title() != null) {
      if (req.title().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title_required");
      t.setTitle(req.title().trim());
    }
    if (req.description() != null)   t.setDescription(req.description());
    if (req.dueDate() != null)        t.setDueDate(req.dueDate());
    if (req.plannedDate() != null)    t.setPlannedDate(req.plannedDate());
    if (req.plannedTime() != null)    t.setPlannedTime(req.plannedTime());
    if (Boolean.TRUE.equals(req.clearPlannedTime()))  t.setPlannedTime(null);
    if (Boolean.TRUE.equals(req.clearPlannedDate())) {
      t.setPlannedDate(null);
      t.setPlannedTime(null);
    }
    if (Boolean.TRUE.equals(req.clearDueDate()))      t.setDueDate(null);

    if (t.getPlannedTime() != null && t.getPlannedDate() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "planned_time_requires_planned_date");
    }

    if (req.important() != null || Boolean.TRUE.equals(req.clearImportant())) t.setImportant(Boolean.TRUE.equals(req.clearImportant()) ? null : req.important());
    if (req.urgent() != null || Boolean.TRUE.equals(req.clearUrgent()))       t.setUrgent(Boolean.TRUE.equals(req.clearUrgent()) ? null : req.urgent());

    if (req.projectId() != null)                      t.setProject(resolveProject(req.projectId(), user.getId()));
    if (Boolean.TRUE.equals(req.clearProject()))       t.setProject(null);
    if (req.categoryId() != null)                     t.setCategory(resolveCategory(req.categoryId(), user.getId()));
    if (Boolean.TRUE.equals(req.clearCategory()))      t.setCategory(null);

    if (req.estimatedMinutes() != null)                    t.setEstimatedMinutes(req.estimatedMinutes());
    if (Boolean.TRUE.equals(req.clearEstimatedMinutes()))  t.setEstimatedMinutes(null);
    if (req.totalMinutes() != null)                        t.setTotalMinutes(req.totalMinutes());
    if (Boolean.TRUE.equals(req.clearTotalMinutes()))      t.setTotalMinutes(null);

    if (req.recurring() != null) {
      t.setRecurring(req.recurring());
      if (!req.recurring()) {
        t.setRecurrenceType(null);
        t.setRecurrenceInterval(null);
        t.setRecurrenceEndDate(null);
      }
    }
    if (req.recurrenceType() != null)     t.setRecurrenceType(req.recurrenceType());
    if (req.recurrenceInterval() != null) t.setRecurrenceInterval(req.recurrenceInterval());
    if (req.recurrenceEndDate() != null)  t.setRecurrenceEndDate(req.recurrenceEndDate());
    if (Boolean.TRUE.equals(req.clearRecurrenceEndDate())) t.setRecurrenceEndDate(null);

    t.setUpdatedAt(Instant.now());
    return toDto(taskRepository.save(t), LocalDate.now());
  }

  @Transactional
  public void softDelete(Long taskId, Long userId) {
    Task t = requireTask(taskId, userId);
    t.setDeletedAt(Instant.now());
    t.setUpdatedAt(Instant.now());
    taskRepository.save(t);
  }

  @Transactional
  public TaskDto duplicate(Long taskId, Long userId) {
    Task src = requireTask(taskId, userId);
    Instant now = Instant.now();

    Task copy = new Task();
    copy.setUser(src.getUser());
    copy.setTitle(src.getTitle() + " (còpia)");
    copy.setDescription(src.getDescription());
    copy.setStatus(requireStatus("BACKLOG"));
    copy.setDueDate(src.getDueDate());
    copy.setPlannedDate(null);
    copy.setPlannedTime(null);
    copy.setImportant(src.getImportant());
    copy.setUrgent(src.getUrgent());
    copy.setProject(src.getProject());
    copy.setCategory(src.getCategory());
    copy.setRecurring(false);
    copy.setEstimatedMinutes(src.getEstimatedMinutes());
    copy.setCreatedAt(now);
    copy.setUpdatedAt(now);

    return toDto(taskRepository.save(copy), LocalDate.now());
  }

  @Transactional
  public TaskDto complete(Long taskId, Long userId) {
    Task t = requireTask(taskId, userId);
    validateTransition(t.getStatus().getCode(), "COMPLETADA");
    Instant now = Instant.now();
    t.setStatus(requireStatus("COMPLETADA"));
    t.setCompletedAt(now);
    t.setUpdatedAt(now);
    return toDto(taskRepository.save(t), LocalDate.now());
  }

  @Transactional
  public TaskDto cancel(Long taskId, Long userId) {
    Task t = requireTask(taskId, userId);
    validateTransition(t.getStatus().getCode(), "CANCELADA");
    t.setStatus(requireStatus("CANCELADA"));
    t.setUpdatedAt(Instant.now());
    return toDto(taskRepository.save(t), LocalDate.now());
  }

  @Transactional
  public TaskDto start(Long taskId, Long userId) {
    Task t = requireTask(taskId, userId);
    validateTransition(t.getStatus().getCode(), "EN_PROGRESO");
    t.setStatus(requireStatus("EN_PROGRESO"));
    t.setUpdatedAt(Instant.now());
    return toDto(taskRepository.save(t), LocalDate.now());
  }

  @Transactional
  public TaskDto block(Long taskId, Long userId) {
    Task t = requireTask(taskId, userId);
    validateTransition(t.getStatus().getCode(), "BLOQUEADA");
    t.setStatus(requireStatus("BLOQUEADA"));
    t.setUpdatedAt(Instant.now());
    return toDto(taskRepository.save(t), LocalDate.now());
  }

  @Transactional
  public TaskDto reopen(Long taskId, Long userId) {
    Task t = requireTask(taskId, userId);
    String targetCode = t.getPlannedDate() != null ? "PLANIFICADA" : "PENDIENTE";
    validateTransition(t.getStatus().getCode(), targetCode);
    t.setStatus(requireStatus(targetCode));
    t.setCompletedAt(null);
    t.setUpdatedAt(Instant.now());
    return toDto(taskRepository.save(t), LocalDate.now());
  }

  @Transactional
  public TaskDto schedule(Long taskId, Long userId, LocalDate plannedDate, LocalTime plannedTime) {
    if (plannedTime != null && plannedDate == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "planned_time_requires_planned_date");
    }
    Task t = requireTask(taskId, userId);
    t.setPlannedDate(plannedDate);
    t.setPlannedTime(plannedTime);
    String currentCode = t.getStatus().getCode();
    if (plannedDate != null && "BACKLOG".equals(currentCode)) {
      t.setStatus(requireStatus("PLANIFICADA"));
    }
    if (plannedDate == null && "PLANIFICADA".equals(currentCode)) {
      t.setStatus(requireStatus("PENDIENTE"));
    }
    t.setUpdatedAt(Instant.now());
    return toDto(taskRepository.save(t), LocalDate.now());
  }

  @Transactional
  public TaskDto classify(Long taskId, Long userId, Boolean important, Boolean urgent) {
    Task t = requireTask(taskId, userId);
    t.setImportant(important);
    t.setUrgent(urgent);
    t.setUpdatedAt(Instant.now());
    return toDto(taskRepository.save(t), LocalDate.now());
  }

  // -----------------------------------------------------------------------
  // Request records
  // -----------------------------------------------------------------------

  public record CreateRequest(
      String title,
      String description,
      LocalDate dueDate,
      LocalDate plannedDate,
      LocalTime plannedTime,
      Boolean important,
      Boolean urgent,
      Long projectId,
      Long categoryId,
      boolean recurring,
      String recurrenceType,
      Integer recurrenceInterval,
      LocalDate recurrenceEndDate,
      Integer estimatedMinutes) {}

  public record UpdateRequest(
      String title,
      String description,
      LocalDate dueDate,
      LocalDate plannedDate,
      LocalTime plannedTime,
      Boolean important,
      Boolean urgent,
      Long projectId,
      Long categoryId,
      Boolean recurring,
      String recurrenceType,
      Integer recurrenceInterval,
      LocalDate recurrenceEndDate,
      Integer estimatedMinutes,
      Integer totalMinutes,
      Boolean clearPlannedDate,
      Boolean clearPlannedTime,
      Boolean clearDueDate,
      Boolean clearImportant,
      Boolean clearUrgent,
      Boolean clearProject,
      Boolean clearCategory,
      Boolean clearEstimatedMinutes,
      Boolean clearTotalMinutes,
      Boolean clearRecurrenceEndDate) {}

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private Task requireTask(Long taskId, Long userId) {
    return taskRepository.findByIdAndUserIdAndDeletedAtIsNull(taskId, userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "task_not_found"));
  }

  private TaskStatus requireStatus(String code) {
    return statusRepository.findByCode(code)
        .orElseThrow(() -> new IllegalStateException("task_status_missing:" + code));
  }

  private void validateTransition(String from, String to) {
    Set<String> allowed = ALLOWED_TRANSITIONS.getOrDefault(from, Set.of());
    if (!allowed.contains(to)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid_status_transition");
    }
  }

  private TaskProject resolveProject(Long projectId, Long userId) {
    if (projectId == null) return null;
    return projectRepository.findByIdAndUserId(projectId, userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "project_not_found"));
  }

  private TaskCategory resolveCategory(Long categoryId, Long userId) {
    if (categoryId == null) return null;
    return categoryRepository.findByIdAndUserId(categoryId, userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "category_not_found"));
  }

  private List<TaskDto> filter(List<Task> all, LocalDate today, Boolean imp, Boolean urg) {
    return all.stream()
        .filter(t -> imp.equals(t.getImportant()) && urg.equals(t.getUrgent()))
        .map(t -> toDto(t, today))
        .toList();
  }

  TaskDto toDto(Task t, LocalDate today) {
    String statusCode = t.getStatus().getCode();
    boolean overdue = t.getDueDate() != null
        && t.getDueDate().isBefore(today)
        && !FINAL_STATUSES.contains(statusCode);

    return new TaskDto(
        t.getId(),
        t.getTitle(),
        t.getDescription(),
        statusCode,
        t.getStatus().getLabel(),
        t.getDueDate(),
        t.getPlannedDate(),
        t.getPlannedTime(),
        t.getImportant(),
        t.getUrgent(),
        t.getProject() != null ? t.getProject().getId()    : null,
        t.getProject() != null ? t.getProject().getName()  : null,
        t.getProject() != null ? t.getProject().getColor() : null,
        t.getCategory() != null ? t.getCategory().getId()    : null,
        t.getCategory() != null ? t.getCategory().getName()  : null,
        t.getCategory() != null ? t.getCategory().getColor() : null,
        t.isRecurring(),
        t.getRecurrenceType(),
        t.getRecurrenceInterval(),
        t.getRecurrenceEndDate(),
        t.getEstimatedMinutes(),
        t.getTotalMinutes(),
        t.getCompletedAt(),
        t.getCreatedAt(),
        t.getUpdatedAt(),
        overdue);
  }

  private static String emptyToNull(String s) {
    return (s == null || s.isBlank()) ? null : s;
  }
}
