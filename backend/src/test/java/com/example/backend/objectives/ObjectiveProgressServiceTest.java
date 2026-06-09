package com.example.backend.objectives;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.example.backend.habits.Habit;
import com.example.backend.habits.HabitEntryRepository;
import com.example.backend.support.ControllerTestSupport;
import com.example.backend.users.User;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ObjectiveProgressServiceTest {

  @Mock HabitEntryRepository habitEntryRepository;

  ObjectiveProgressService service;
  User user;
  Habit habit;
  ZoneId zone = ZoneId.of("UTC");

  @BeforeEach
  void setUp() {
    service = new ObjectiveProgressService(habitEntryRepository);
    user = ControllerTestSupport.userWithId(1L, "user@example.com");
    habit = new Habit();
    habit.setId("habit-1");
  }

  @Test
  void computeMinutesReturnsDoneWhenTargetReached() {
    Objective objective =
        sampleObjective(Objective.MetricType.MINUTES, 100, LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31));
    when(habitEntryRepository.sumDurationMinutesForHabitBetween(
            eq(1L), eq("habit-1"), eq(objective.getStartDate()), eq(objective.getEndDate())))
        .thenReturn(120L);

    ObjectiveProgressService.Progress progress = service.compute(objective, zone);

    assertThat(progress.progressValue()).isEqualTo(120L);
    assertThat(progress.statusCode()).isEqualTo("DONE");
  }

  @Test
  void computeRepetitionsReturnsInProgressBeforeEndDate() {
    LocalDate end = LocalDate.now(zone).plusDays(7);
    Objective objective = sampleObjective(Objective.MetricType.REPETITIONS, 10, LocalDate.now(zone).minusDays(1), end);
    when(habitEntryRepository.countEntriesForHabitBetween(
            eq(1L), eq("habit-1"), eq(objective.getStartDate()), eq(objective.getEndDate())))
        .thenReturn(3L);

    ObjectiveProgressService.Progress progress = service.compute(objective, zone);

    assertThat(progress.progressValue()).isEqualTo(3L);
    assertThat(progress.statusCode()).isEqualTo("IN_PROGRESS");
  }

  @Test
  void computeRepetitionsReturnsNotDoneAfterEndDate() {
    Objective objective =
        sampleObjective(
            Objective.MetricType.REPETITIONS, 10, LocalDate.of(2020, 1, 1), LocalDate.of(2020, 1, 31));
    when(habitEntryRepository.countEntriesForHabitBetween(
            eq(1L), eq("habit-1"), eq(objective.getStartDate()), eq(objective.getEndDate())))
        .thenReturn(2L);

    ObjectiveProgressService.Progress progress = service.compute(objective, zone);

    assertThat(progress.progressValue()).isEqualTo(2L);
    assertThat(progress.statusCode()).isEqualTo("NOT_DONE");
  }

  @Test
  void requireStatusReturnsMatchingStatus() {
    ObjectiveStatus status = new ObjectiveStatus();
    status.setCode("DONE");
    status.setLabel("Done");

    ObjectiveStatus resolved = service.requireStatus(Map.of("DONE", status), "DONE");

    assertThat(resolved.getLabel()).isEqualTo("Done");
  }

  private Objective sampleObjective(
      Objective.MetricType metricType, int target, LocalDate start, LocalDate end) {
    Objective objective = new Objective();
    objective.setUser(user);
    objective.setHabit(habit);
    objective.setMetricType(metricType);
    objective.setTargetValue(target);
    objective.setStartDate(start);
    objective.setEndDate(end);
    objective.setCreatedAt(ControllerTestSupport.fixedInstant());
    return objective;
  }
}
