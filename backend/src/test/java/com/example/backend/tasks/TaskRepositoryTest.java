package com.example.backend.tasks;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.backend.support.AbstractJpaTest;
import com.example.backend.support.TestUserFactory;
import com.example.backend.users.User;
import com.example.backend.users.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

@ImportAutoConfiguration(FlywayAutoConfiguration.class)
class TaskRepositoryTest extends AbstractJpaTest {

  @Autowired UserRepository userRepository;
  @Autowired TaskRepository taskRepository;
  @Autowired TaskStatusRepository statusRepository;

  User owner;
  User otherUser;
  TaskStatus backlog;
  TaskStatus planned;
  TaskStatus completed;
  TaskStatus cancelled;

  @BeforeEach
  void seedData() {
    owner = userRepository.save(TestUserFactory.activeUser("owner@example.com", "hash"));
    otherUser = userRepository.save(TestUserFactory.activeUser("other@example.com", "hash"));

    backlog = statusRepository.findByCode("BACKLOG").orElseThrow();
    planned = statusRepository.findByCode("PLANIFICADA").orElseThrow();
    completed = statusRepository.findByCode("COMPLETADA").orElseThrow();
    cancelled = statusRepository.findByCode("CANCELADA").orElseThrow();
  }

  @Test
  void shouldFindByIdAndUserIdWhenTaskExistsAndNotDeleted() {
    Task saved = taskRepository.save(newTask(owner, backlog, "Visible", null, null));

    assertThat(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(saved.getId(), owner.getId()))
        .isPresent();
  }

  @Test
  void shouldExcludeSoftDeletedTasksWhenFindingByIdAndUserId() {
    Task deleted = newTask(owner, backlog, "Deleted", null, null);
    deleted.setDeletedAt(Instant.now());
    Task saved = taskRepository.save(deleted);

    assertThat(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(saved.getId(), owner.getId()))
        .isEmpty();
  }

  @Test
  void shouldNotFindTaskWhenUserIdDoesNotMatch() {
    Task saved = taskRepository.save(newTask(owner, backlog, "Owned", null, null));

    assertThat(taskRepository.findByIdAndUserIdAndDeletedAtIsNull(saved.getId(), otherUser.getId()))
        .isEmpty();
  }

  @Test
  void shouldFindFilteredByStatusWhenStatusMatches() {
    taskRepository.save(newTask(owner, backlog, "Backlog item", null, null));
    taskRepository.save(newTask(owner, planned, "Planned item", LocalDate.now(), null));

    Page<Task> page =
        taskRepository.findFilteredByStatus(
            owner.getId(), "BACKLOG", null, null, null, null, null, null, PageRequest.of(0, 10));

    assertThat(page.getContent()).extracting(Task::getTitle).containsExactly("Backlog item");
  }

  @Test
  void shouldFindFilteredAllWhenIncludeAllStatuses() {
    taskRepository.save(newTask(owner, backlog, "Active", null, null));
    taskRepository.save(newTask(owner, completed, "Done", null, null));

    Page<Task> page =
        taskRepository.findFilteredAll(
            owner.getId(), null, null, null, null, null, null, PageRequest.of(0, 10));

    assertThat(page.getContent()).hasSize(2);
  }

  @Test
  void shouldExcludeCompletedWhenFindingFilteredExcludingCompleted() {
    taskRepository.save(newTask(owner, backlog, "Active", null, null));
    taskRepository.save(newTask(owner, completed, "Done", null, null));

    Page<Task> page =
        taskRepository.findFilteredExcludingCompleted(
            owner.getId(), null, null, null, null, null, null, PageRequest.of(0, 10));

    assertThat(page.getContent()).extracting(Task::getTitle).containsExactly("Active");
  }

  @Test
  void shouldFindPlannedForDateWhenPlannedOnDate() {
    LocalDate today = LocalDate.of(2026, 6, 8);
    Task onDate = newTask(owner, planned, "Today", today, null);
    onDate.setPlannedTime(LocalTime.of(9, 0));
    taskRepository.save(onDate);
    taskRepository.save(newTask(owner, planned, "Tomorrow", today.plusDays(1), null));

    List<Task> result = taskRepository.findPlannedForDate(owner.getId(), today);

    assertThat(result).extracting(Task::getTitle).containsExactly("Today");
  }

  @Test
  void shouldFindOverdueWhenDueDateBeforeToday() {
    LocalDate today = LocalDate.of(2026, 6, 8);
    Task overdue = newTask(owner, backlog, "Late", null, today.minusDays(3));
    taskRepository.save(overdue);
    taskRepository.save(newTask(owner, backlog, "Future", null, today.plusDays(1)));

    List<Task> result = taskRepository.findOverdue(owner.getId(), today);

    assertThat(result).extracting(Task::getTitle).containsExactly("Late");
  }

  @Test
  void shouldFindImportantUnplannedWhenImportantWithoutPlannedDate() {
    Task match = newTask(owner, backlog, "Important backlog", null, null);
    match.setImportant(true);
    taskRepository.save(match);
    Task plannedImportant = newTask(owner, planned, "Planned", LocalDate.now(), null);
    plannedImportant.setImportant(true);
    taskRepository.save(plannedImportant);

    List<Task> result = taskRepository.findImportantUnplanned(owner.getId());

    assertThat(result).extracting(Task::getTitle).containsExactly("Important backlog");
  }

  @Test
  void shouldFindAllActiveForEisenhowerWhenNotFinished() {
    Task active = newTask(owner, backlog, "Active", null, null);
    active.setImportant(true);
    active.setUrgent(false);
    taskRepository.save(active);
    taskRepository.save(newTask(owner, completed, "Done", null, null));

    List<Task> result = taskRepository.findAllActiveForEisenhower(owner.getId());

    assertThat(result).extracting(Task::getTitle).containsExactly("Active");
  }

  @Test
  void shouldFindCalendarRangeWhenPlannedDateInRange() {
    LocalDate from = LocalDate.of(2026, 6, 1);
    LocalDate to = LocalDate.of(2026, 6, 30);
    taskRepository.save(newTask(owner, planned, "June task", LocalDate.of(2026, 6, 15), null));
    taskRepository.save(newTask(owner, planned, "July task", LocalDate.of(2026, 7, 1), null));

    List<Task> result = taskRepository.findCalendarRange(owner.getId(), from, to);

    assertThat(result).extracting(Task::getTitle).containsExactly("June task");
  }

  @Test
  void shouldExcludeCancelledFromCalendarRange() {
    LocalDate from = LocalDate.of(2026, 6, 1);
    LocalDate to = LocalDate.of(2026, 6, 30);
    taskRepository.save(newTask(owner, cancelled, "Cancelled", LocalDate.of(2026, 6, 10), null));

    List<Task> result = taskRepository.findCalendarRange(owner.getId(), from, to);

    assertThat(result).isEmpty();
  }

  @Test
  void shouldFindBacklogWhenNoPlannedDateAndActive() {
    taskRepository.save(newTask(owner, backlog, "Backlog A", null, null));
    taskRepository.save(newTask(owner, planned, "Planned", LocalDate.now(), null));

    Page<Task> page = taskRepository.findBacklog(owner.getId(), PageRequest.of(0, 10));

    assertThat(page.getContent()).extracting(Task::getTitle).containsExactly("Backlog A");
  }

  @Test
  void shouldSearchByTitleWhenQueryMatches() {
    taskRepository.save(newTask(owner, backlog, "Buy groceries", null, null));
    taskRepository.save(newTask(owner, backlog, "Walk dog", null, null));
    taskRepository.save(newTask(owner, completed, "Buy milk", null, null));

    List<Task> result =
        taskRepository.searchByTitle(owner.getId(), "%buy%", PageRequest.of(0, 10));

    assertThat(result).extracting(Task::getTitle).containsExactly("Buy groceries");
  }

  @Test
  void shouldFilterByTitleQueryWhenFindingFiltered() {
    taskRepository.save(newTask(owner, backlog, "Alpha task", null, null));
    taskRepository.save(newTask(owner, backlog, "Beta task", null, null));

    Page<Task> page =
        taskRepository.findFilteredExcludingCompleted(
            owner.getId(), null, null, null, null, null, "%alpha%", PageRequest.of(0, 10));

    assertThat(page.getContent()).extracting(Task::getTitle).containsExactly("Alpha task");
  }

  private static Task newTask(
      User user, TaskStatus status, String title, LocalDate plannedDate, LocalDate dueDate) {
    Instant now = Instant.now();
    Task task = new Task();
    task.setUser(user);
    task.setStatus(status);
    task.setTitle(title);
    task.setPlannedDate(plannedDate);
    task.setDueDate(dueDate);
    task.setRecurring(false);
    task.setCreatedAt(now);
    task.setUpdatedAt(now);
    return task;
  }
}
