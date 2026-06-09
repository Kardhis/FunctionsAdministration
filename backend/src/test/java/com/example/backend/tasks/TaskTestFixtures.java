package com.example.backend.tasks;

import com.example.backend.support.ControllerTestSupport;
import com.example.backend.users.User;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;
import java.util.Optional;
import java.lang.reflect.Field;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public final class TaskTestFixtures {

  static final Long USER_ID = 1L;
  static final Long OTHER_USER_ID = 99L;
  static final Long TASK_ID = 10L;

  private TaskTestFixtures() {}

  static User user() {
    return ControllerTestSupport.userWithId(USER_ID, "user@example.com");
  }

  static User otherUser() {
    return ControllerTestSupport.userWithId(OTHER_USER_ID, "other@example.com");
  }

  static Map<String, TaskStatus> allStatuses() {
    return Stream.of(
            status(1L, "BACKLOG", "Backlog"),
            status(2L, "PENDIENTE", "Pendent"),
            status(3L, "PLANIFICADA", "Planificada"),
            status(4L, "EN_PROGRESO", "En progrés"),
            status(5L, "BLOQUEADA", "Blocada"),
            status(6L, "COMPLETADA", "Completada"),
            status(7L, "CANCELADA", "Cancel·lada"))
        .collect(Collectors.toMap(TaskStatus::getCode, s -> s));
  }

  static TaskStatus status(String code) {
    return allStatuses().get(code);
  }

  static Task task(String statusCode) {
    return task(TASK_ID, USER_ID, statusCode, "Sample task", null, null);
  }

  static Task task(
      Long id,
      Long userId,
      String statusCode,
      String title,
      LocalDate plannedDate,
      LocalDate dueDate) {
    User owner = userId.equals(USER_ID) ? user() : otherUser();
    Task task = new Task();
    setField(task, "id", id);
    task.setUser(owner);
    task.setTitle(title);
    task.setStatus(status(statusCode));
    task.setPlannedDate(plannedDate);
    task.setDueDate(dueDate);
    task.setRecurring(false);
    Instant now = Instant.parse("2026-06-01T10:00:00Z");
    task.setCreatedAt(now);
    task.setUpdatedAt(now);
    return task;
  }

  static Task savedTask(Task task) {
    if (task.getId() == null) {
      setField(task, "id", TASK_ID);
    }
    return task;
  }

  static void stubStatuses(TaskStatusRepository statusRepository) {
    allStatuses()
        .values()
        .forEach(s -> org.mockito.Mockito.when(statusRepository.findByCode(s.getCode()))
            .thenReturn(Optional.of(s)));
  }

  private static TaskStatus status(Long id, String code, String label) {
    TaskStatus status = new TaskStatus();
    setField(status, "id", id);
    status.setCode(code);
    status.setLabel(label);
    return status;
  }

  static TaskService.CreateRequest createRequest(String title) {
    return new TaskService.CreateRequest(
        title, null, null, null, null, null, null, null, null,
        false, null, null, null, null);
  }

  static TaskService.CreateRequest plannedCreateRequest(String title, LocalDate plannedDate) {
    return new TaskService.CreateRequest(
        title, null, null, plannedDate, LocalTime.of(9, 0), null, null,
        null, null, false, null, null, null, null);
  }

  static TaskService.UpdateRequest updateTitle(String title) {
    return new TaskService.UpdateRequest(
        title, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null);
  }

  public static TaskService.TaskDto sampleDto(Long id, String title, String statusCode) {
    return new TaskService.TaskDto(
        id,
        title,
        null,
        statusCode,
        statusCode,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        false,
        null,
        null,
        null,
        null,
        null,
        null,
        ControllerTestSupport.fixedInstant(),
        ControllerTestSupport.fixedInstant(),
        false);
  }

  private static void setField(Object target, String fieldName, Object value) {
    try {
      Field field = target.getClass().getDeclaredField(fieldName);
      field.setAccessible(true);
      field.set(target, value);
    } catch (ReflectiveOperationException e) {
      throw new IllegalStateException("Failed to set field " + fieldName, e);
    }
  }
}
