package com.example.backend.tasks;

import static com.example.backend.tasks.TaskTestFixtures.OTHER_USER_ID;
import static com.example.backend.tasks.TaskTestFixtures.TASK_ID;
import static com.example.backend.tasks.TaskTestFixtures.USER_ID;
import static com.example.backend.tasks.TaskTestFixtures.createRequest;
import static com.example.backend.tasks.TaskTestFixtures.plannedCreateRequest;
import static com.example.backend.tasks.TaskTestFixtures.savedTask;
import static com.example.backend.tasks.TaskTestFixtures.stubStatuses;
import static com.example.backend.tasks.TaskTestFixtures.task;
import static com.example.backend.tasks.TaskTestFixtures.updateTitle;
import static com.example.backend.tasks.TaskTestFixtures.user;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.backend.users.User;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TaskServiceTest {

  @Mock TaskRepository taskRepository;
  @Mock TaskStatusRepository statusRepository;
  @Mock TaskProjectRepository projectRepository;
  @Mock TaskCategoryRepository categoryRepository;

  TaskService service;

  @BeforeEach
  void setUp() {
    service =
        new TaskService(taskRepository, statusRepository, projectRepository, categoryRepository);
    stubStatuses(statusRepository);
  }

  // -----------------------------------------------------------------------
  // create
  // -----------------------------------------------------------------------

  @Test
  void shouldCreateTaskWithBacklogStatusWhenNoPlannedDate() {
    User owner = user();
    when(taskRepository.save(any(Task.class))).thenAnswer(inv -> savedTask(inv.getArgument(0)));

    TaskService.TaskDto result =
        service.create(owner, createRequest("  New task  "));

    assertThat(result.title()).isEqualTo("New task");
    assertThat(result.status()).isEqualTo("BACKLOG");
    verify(taskRepository).save(any(Task.class));
  }

  @Test
  void shouldCreateTaskWithPlannedStatusWhenPlannedDateProvided() {
    User owner = user();
    LocalDate planned = LocalDate.of(2026, 6, 10);
    when(taskRepository.save(any(Task.class))).thenAnswer(inv -> savedTask(inv.getArgument(0)));

    TaskService.TaskDto result =
        service.create(owner, plannedCreateRequest("Planned task", planned));

    assertThat(result.status()).isEqualTo("PLANIFICADA");
    assertThat(result.plannedDate()).isEqualTo(planned);
  }

  @Test
  void shouldRejectCreateWhenTitleMissing() {
    assertThatThrownBy(() -> service.create(user(), createRequest("  ")))
        .isInstanceOf(ResponseStatusException.class)
        .satisfies(ex -> {
          ResponseStatusException rse = (ResponseStatusException) ex;
          assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
          assertThat(rse.getReason()).isEqualTo("title_required");
        });
  }

  @Test
  void shouldRejectCreateWhenPlannedTimeWithoutPlannedDate() {
    TaskService.CreateRequest req =
        new TaskService.CreateRequest(
            "Task", null, null, null, LocalTime.of(10, 0), null, null,
            null, null, false, null, null, null, null);

    assertThatThrownBy(() -> service.create(user(), req))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getReason())
        .isEqualTo("planned_time_requires_planned_date");
  }

  @Test
  void shouldRejectCreateWhenRecurringWithoutType() {
    TaskService.CreateRequest req =
        new TaskService.CreateRequest(
            "Task", null, null, null, null, null, null, null, null,
            true, null, 1, null, null);

    assertThatThrownBy(() -> service.create(user(), req))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getReason())
        .isEqualTo("recurrence_type_required");
  }

  // -----------------------------------------------------------------------
  // update
  // -----------------------------------------------------------------------

  @Test
  void shouldUpdateTaskWhenOwnerMatches() {
    Task existing = task("PENDIENTE");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));
    when(taskRepository.save(existing)).thenReturn(existing);

    TaskService.TaskDto result =
        service.update(TASK_ID, user(), updateTitle("Updated title"));

    assertThat(result.title()).isEqualTo("Updated title");
  }

  @Test
  void shouldRejectUpdateWhenTitleBlank() {
    Task existing = task("PENDIENTE");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));

    assertThatThrownBy(() -> service.update(TASK_ID, user(), updateTitle(" ")))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getReason())
        .isEqualTo("title_required");
  }

  @Test
  void shouldRejectUpdateWhenWrongUser() {
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.update(TASK_ID, user(), updateTitle("X")))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getStatusCode().value())
        .isEqualTo(HttpStatus.NOT_FOUND.value());
  }

  @Test
  void shouldTransitionToPlannedWhenPlannedDateAddedOnUpdate() {
    Task existing = task("BACKLOG");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));
    when(taskRepository.save(existing)).thenReturn(existing);

    TaskService.UpdateRequest req =
        new TaskService.UpdateRequest(
            null, null, null, LocalDate.of(2026, 6, 15), null, null, null, null, null,
            null, null, null, null, null, null,
            null, null, null, null, null, null, null, null, null, null);

    TaskService.TaskDto result = service.update(TASK_ID, user(), req);

    assertThat(result.status()).isEqualTo("PLANIFICADA");
  }

  // -----------------------------------------------------------------------
  // softDelete
  // -----------------------------------------------------------------------

  @Test
  void shouldSoftDeleteWhenOwnerMatches() {
    Task existing = task("PENDIENTE");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));
    when(taskRepository.save(existing)).thenReturn(existing);

    service.softDelete(TASK_ID, USER_ID);

    assertThat(existing.getDeletedAt()).isNotNull();
    verify(taskRepository).save(existing);
  }

  @Test
  void shouldRejectSoftDeleteWhenWrongUser() {
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, OTHER_USER_ID))
        .thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.softDelete(TASK_ID, OTHER_USER_ID))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getReason())
        .isEqualTo("task_not_found");
  }

  // -----------------------------------------------------------------------
  // duplicate
  // -----------------------------------------------------------------------

  @Test
  void shouldDuplicateTaskWhenOwnerMatches() {
    Task existing = task("PLANIFICADA");
    existing.setDescription("Desc");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));
    when(taskRepository.save(any(Task.class))).thenAnswer(inv -> {
      Task copy = inv.getArgument(0);
      org.springframework.test.util.ReflectionTestUtils.setField(copy, "id", 11L);
      return copy;
    });

    TaskService.TaskDto result = service.duplicate(TASK_ID, USER_ID);

    assertThat(result.title()).endsWith("(còpia)");
    assertThat(result.status()).isEqualTo("BACKLOG");
    assertThat(result.plannedDate()).isNull();
  }

  @Test
  void shouldRejectDuplicateWhenWrongUser() {
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, OTHER_USER_ID))
        .thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.duplicate(TASK_ID, OTHER_USER_ID))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getStatusCode().value())
        .isEqualTo(HttpStatus.NOT_FOUND.value());
  }

  // -----------------------------------------------------------------------
  // status transitions
  // -----------------------------------------------------------------------

  @Test
  void shouldCompleteTaskWhenTransitionAllowed() {
    Task existing = task("EN_PROGRESO");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));
    when(taskRepository.save(existing)).thenReturn(existing);

    TaskService.TaskDto result = service.complete(TASK_ID, USER_ID);

    assertThat(result.status()).isEqualTo("COMPLETADA");
    assertThat(existing.getCompletedAt()).isNotNull();
  }

  @Test
  void shouldRejectCompleteWhenTransitionInvalid() {
    Task existing = task("BACKLOG");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));

    assertThatThrownBy(() -> service.complete(TASK_ID, USER_ID))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getReason())
        .isEqualTo("invalid_status_transition");
  }

  @Test
  void shouldCancelTaskWhenTransitionAllowed() {
    Task existing = task("PENDIENTE");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));
    when(taskRepository.save(existing)).thenReturn(existing);

    TaskService.TaskDto result = service.cancel(TASK_ID, USER_ID);

    assertThat(result.status()).isEqualTo("CANCELADA");
  }

  @Test
  void shouldRejectCancelWhenTransitionInvalid() {
    Task existing = task("COMPLETADA");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));

    assertThatThrownBy(() -> service.cancel(TASK_ID, USER_ID))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getReason())
        .isEqualTo("invalid_status_transition");
  }

  @Test
  void shouldStartTaskWhenTransitionAllowed() {
    Task existing = task("PLANIFICADA");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));
    when(taskRepository.save(existing)).thenReturn(existing);

    TaskService.TaskDto result = service.start(TASK_ID, USER_ID);

    assertThat(result.status()).isEqualTo("EN_PROGRESO");
  }

  @Test
  void shouldRejectStartWhenTransitionInvalid() {
    Task existing = task("BACKLOG");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));

    assertThatThrownBy(() -> service.start(TASK_ID, USER_ID))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getReason())
        .isEqualTo("invalid_status_transition");
  }

  @Test
  void shouldBlockTaskWhenTransitionAllowed() {
    Task existing = task("EN_PROGRESO");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));
    when(taskRepository.save(existing)).thenReturn(existing);

    TaskService.TaskDto result = service.block(TASK_ID, USER_ID);

    assertThat(result.status()).isEqualTo("BLOQUEADA");
  }

  @Test
  void shouldRejectBlockWhenTransitionInvalid() {
    Task existing = task("BACKLOG");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));

    assertThatThrownBy(() -> service.block(TASK_ID, USER_ID))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getReason())
        .isEqualTo("invalid_status_transition");
  }

  @Test
  void shouldReopenCompletedTaskToPlannedWhenPlannedDateExists() {
    Task existing = task("COMPLETADA");
    existing.setPlannedDate(LocalDate.of(2026, 6, 12));
    existing.setCompletedAt(java.time.Instant.now());
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));
    when(taskRepository.save(existing)).thenReturn(existing);

    TaskService.TaskDto result = service.reopen(TASK_ID, USER_ID);

    assertThat(result.status()).isEqualTo("PLANIFICADA");
    assertThat(existing.getCompletedAt()).isNull();
  }

  @Test
  void shouldReopenCompletedTaskToPendingWhenNoPlannedDate() {
    Task existing = task("COMPLETADA");
    existing.setCompletedAt(java.time.Instant.now());
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));
    when(taskRepository.save(existing)).thenReturn(existing);

    TaskService.TaskDto result = service.reopen(TASK_ID, USER_ID);

    assertThat(result.status()).isEqualTo("PENDIENTE");
  }

  @Test
  void shouldRejectReopenWhenTransitionInvalid() {
    Task existing = task("EN_PROGRESO");
    existing.setPlannedDate(LocalDate.of(2026, 6, 12));
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));

    assertThatThrownBy(() -> service.reopen(TASK_ID, USER_ID))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getReason())
        .isEqualTo("invalid_status_transition");
  }

  // -----------------------------------------------------------------------
  // schedule / classify
  // -----------------------------------------------------------------------

  @Test
  void shouldScheduleTaskWhenValid() {
    Task existing = task("BACKLOG");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));
    when(taskRepository.save(existing)).thenReturn(existing);

    LocalDate date = LocalDate.of(2026, 6, 20);
    TaskService.TaskDto result =
        service.schedule(TASK_ID, USER_ID, date, LocalTime.of(14, 30));

    assertThat(result.plannedDate()).isEqualTo(date);
    assertThat(result.status()).isEqualTo("PLANIFICADA");
  }

  @Test
  void shouldRejectScheduleWhenPlannedTimeWithoutDate() {
    Task existing = task("BACKLOG");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));

    assertThatThrownBy(
            () -> service.schedule(TASK_ID, USER_ID, null, LocalTime.of(9, 0)))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getReason())
        .isEqualTo("planned_time_requires_planned_date");
  }

  @Test
  void shouldClassifyTaskWhenOwnerMatches() {
    Task existing = task("PENDIENTE");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));
    when(taskRepository.save(existing)).thenReturn(existing);

    TaskService.TaskDto result = service.classify(TASK_ID, USER_ID, true, false);

    assertThat(result.important()).isTrue();
    assertThat(result.urgent()).isFalse();
  }

  // -----------------------------------------------------------------------
  // reads
  // -----------------------------------------------------------------------

  @Test
  void shouldFindFilteredByStatusWhenStatusProvided() {
    Task t = task("PENDIENTE");
    Page<Task> page = new PageImpl<>(List.of(t));
    when(taskRepository.findFilteredByStatus(
            eq(USER_ID), eq("PENDIENTE"), isNull(), isNull(),
            isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
        .thenReturn(page);

    TaskService.PagedTasksResponse result =
        service.findFiltered(USER_ID, "PENDIENTE", false, null, null,
            null, null, null, null, 0, 25);

    assertThat(result.content()).hasSize(1);
    assertThat(result.content().get(0).status()).isEqualTo("PENDIENTE");
  }

  @Test
  void shouldFindFilteredAllWhenIncludeAllTrue() {
    Page<Task> page = new PageImpl<>(List.of(task("COMPLETADA")));
    when(taskRepository.findFilteredAll(
            eq(USER_ID), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
            any(Pageable.class)))
        .thenReturn(page);

    TaskService.PagedTasksResponse result =
        service.findFiltered(USER_ID, null, true, null, null,
            null, null, null, null, 0, 25);

    assertThat(result.content()).hasSize(1);
    verify(taskRepository).findFilteredAll(
        eq(USER_ID), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
        any(Pageable.class));
  }

  @Test
  void shouldFindFilteredExcludingCompletedByDefault() {
    Page<Task> page = new PageImpl<>(List.of(task("PENDIENTE")));
    when(taskRepository.findFilteredExcludingCompleted(
            eq(USER_ID), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
            any(Pageable.class)))
        .thenReturn(page);

    TaskService.PagedTasksResponse result =
        service.findFiltered(USER_ID, null, false, null, null,
            null, null, null, null, 0, 25);

    assertThat(result.content()).hasSize(1);
    verify(taskRepository).findFilteredExcludingCompleted(
        eq(USER_ID), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
        any(Pageable.class));
  }

  @Test
  void shouldFindByIdWhenOwnerMatches() {
    Task existing = task("PENDIENTE");
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, USER_ID))
        .thenReturn(Optional.of(existing));

    TaskService.TaskDto result = service.findById(TASK_ID, USER_ID);

    assertThat(result.id()).isEqualTo(TASK_ID);
  }

  @Test
  void shouldRejectFindByIdWhenWrongUser() {
    when(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(TASK_ID, OTHER_USER_ID))
        .thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.findById(TASK_ID, OTHER_USER_ID))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getReason())
        .isEqualTo("task_not_found");
  }

  @Test
  void shouldFindTodayWhenDateProvided() {
    LocalDate today = LocalDate.of(2026, 6, 8);
    Task planned = task("PLANIFICADA");
    planned.setPlannedDate(today);
    Task overdue = task("PENDIENTE");
    overdue.setDueDate(today.minusDays(2));
    Task important = task("BACKLOG");
    important.setImportant(true);

    when(taskRepository.findPlannedForDate(USER_ID, today)).thenReturn(List.of(planned));
    when(taskRepository.findOverdue(USER_ID, today)).thenReturn(List.of(overdue));
    when(taskRepository.findImportantUnplanned(USER_ID)).thenReturn(List.of(important));

    TaskService.TodayResponse result = service.findToday(USER_ID, today);

    assertThat(result.plannedToday()).hasSize(1);
    assertThat(result.overdue()).hasSize(1);
    assertThat(result.importantUnplanned()).hasSize(1);
  }

  @Test
  void shouldFindEisenhowerQuadrants() {
    Task q1 = task("PENDIENTE");
    q1.setImportant(true);
    q1.setUrgent(true);
    Task unclassified = task("PENDIENTE");

    when(taskRepository.findAllActiveForEisenhower(USER_ID))
        .thenReturn(List.of(q1, unclassified));

    TaskService.EisenhowerResponse result = service.findEisenhower(USER_ID);

    assertThat(result.importantUrgent()).hasSize(1);
    assertThat(result.unclassified()).hasSize(1);
  }

  @Test
  void shouldFindCalendarWhenRangeValid() {
    LocalDate from = LocalDate.of(2026, 6, 1);
    LocalDate to = LocalDate.of(2026, 6, 30);
    Task t = task("PLANIFICADA");
    when(taskRepository.findCalendarRange(USER_ID, from, to)).thenReturn(List.of(t));

    List<TaskService.TaskDto> result = service.findCalendar(USER_ID, from, to);

    assertThat(result).hasSize(1);
  }

  @Test
  void shouldRejectCalendarWhenFromAfterTo() {
    LocalDate from = LocalDate.of(2026, 6, 30);
    LocalDate to = LocalDate.of(2026, 6, 1);

    assertThatThrownBy(() -> service.findCalendar(USER_ID, from, to))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getReason())
        .isEqualTo("from_after_to");
  }

  @Test
  void shouldRejectCalendarWhenDatesMissing() {
    assertThatThrownBy(() -> service.findCalendar(USER_ID, null, LocalDate.now()))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getReason())
        .isEqualTo("from_and_to_required");
  }

  @Test
  void shouldFindBacklogWhenTasksExist() {
    Page<Task> page = new PageImpl<>(List.of(task("BACKLOG")));
    when(taskRepository.findBacklog(eq(USER_ID), any(Pageable.class))).thenReturn(page);

    TaskService.PagedTasksResponse result = service.findBacklog(USER_ID, 0, 25);

    assertThat(result.content()).hasSize(1);
    assertThat(result.content().get(0).status()).isEqualTo("BACKLOG");
  }

  @Test
  void shouldReturnEmptySearchWhenQueryBlank() {
    List<TaskService.TaskSummaryDto> result = service.search(USER_ID, "  ", 10);

    assertThat(result).isEmpty();
  }

  @Test
  void shouldSearchByTitleWhenQueryProvided() {
    Task t = task("PENDIENTE");
    when(taskRepository.searchByTitle(eq(USER_ID), eq("%buy%"), any(Pageable.class)))
        .thenReturn(List.of(t));

    List<TaskService.TaskSummaryDto> result = service.search(USER_ID, "Buy", 5);

    assertThat(result).hasSize(1);
    assertThat(result.get(0).title()).isEqualTo("Sample task");
  }

  @Test
  void shouldCapPageSizeAt100WhenFindingFiltered() {
    Page<Task> page = new PageImpl<>(List.of());
    when(taskRepository.findFilteredExcludingCompleted(
            eq(USER_ID), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
            any(Pageable.class)))
        .thenReturn(page);

    service.findFiltered(USER_ID, null, false, null, null, null, null, null, null, 0, 500);

    ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
    verify(taskRepository).findFilteredExcludingCompleted(
        eq(USER_ID), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
        captor.capture());
    assertThat(captor.getValue().getPageSize()).isEqualTo(100);
  }
}
