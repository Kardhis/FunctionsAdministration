package com.example.backend.objectives.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.api.ApiExceptionHandler;
import com.example.backend.habits.Habit;
import com.example.backend.habits.HabitRepository;
import com.example.backend.objectives.Objective;
import com.example.backend.objectives.ObjectiveProgressService;
import com.example.backend.objectives.ObjectiveRepository;
import com.example.backend.objectives.ObjectiveStatus;
import com.example.backend.objectives.ObjectiveStatusRepository;
import com.example.backend.support.ControllerTestSupport;
import com.example.backend.users.CurrentUserService;
import com.example.backend.users.User;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class ObjectivesControllerTest {

  @Mock ObjectiveRepository objectiveRepository;
  @Mock ObjectiveStatusRepository statusRepository;
  @Mock HabitRepository habitRepository;
  @Mock CurrentUserService currentUserService;
  @Mock ObjectiveProgressService progressService;

  MockMvc mockMvc;
  User user;

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(
                new ObjectivesController(
                    objectiveRepository,
                    statusRepository,
                    habitRepository,
                    currentUserService,
                    progressService))
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
    user = ControllerTestSupport.userWithId(1L, "user@example.com");
  }

  @Test
  void listReturnsObjectivesWithProgress() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    ObjectiveStatus inProgress = objectiveStatus("IN_PROGRESS", "In progress");
    when(statusRepository.findAll()).thenReturn(List.of(inProgress));
    Objective objective = sampleObjective("obj-1");
    when(objectiveRepository.findAllForUserFiltered(1L, null, null, null))
        .thenReturn(List.of(objective));
    when(progressService.defaultZone()).thenReturn(java.time.ZoneId.of("UTC"));
    when(progressService.compute(objective, java.time.ZoneId.of("UTC")))
        .thenReturn(new ObjectiveProgressService.Progress(5L, "IN_PROGRESS"));

    mockMvc
        .perform(get("/api/objectives").principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value("obj-1"))
        .andExpect(jsonPath("$[0].progressValue").value(5))
        .andExpect(jsonPath("$[0].statusCode").value("IN_PROGRESS"));
  }

  @Test
  void createReturnsCreatedObjective() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    when(objectiveRepository.findByIdAndUserId("obj-1", 1L)).thenReturn(Optional.empty());
    when(habitRepository.findByIdAndUserId("habit-1", 1L)).thenReturn(Optional.of(sampleHabit()));
    ObjectiveStatus inProgress = objectiveStatus("IN_PROGRESS", "In progress");
    when(statusRepository.findByCode("IN_PROGRESS")).thenReturn(Optional.of(inProgress));
    when(progressService.now()).thenReturn(ControllerTestSupport.fixedInstant());
    when(progressService.defaultZone()).thenReturn(java.time.ZoneId.of("UTC"));
    when(objectiveRepository.save(any(Objective.class))).thenAnswer(inv -> inv.getArgument(0));
    when(progressService.compute(any(Objective.class), any()))
        .thenReturn(new ObjectiveProgressService.Progress(0L, "IN_PROGRESS"));
    when(statusRepository.findByCode("IN_PROGRESS")).thenReturn(Optional.of(inProgress));

    mockMvc
        .perform(
            post("/api/objectives")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "id":"obj-1",
                      "habitId":"habit-1",
                      "startDate":"2026-01-01",
                      "endDate":"2026-12-31",
                      "metricType":"REPETITIONS",
                      "targetValue":10
                    }
                    """)
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value("obj-1"))
        .andExpect(jsonPath("$.targetValue").value(10));
  }

  @Test
  void createRejectsStartDateAfterEndDate() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);

    mockMvc
        .perform(
            post("/api/objectives")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "id":"obj-1",
                      "habitId":"habit-1",
                      "startDate":"2026-12-31",
                      "endDate":"2026-01-01",
                      "metricType":"REPETITIONS",
                      "targetValue":10
                    }
                    """)
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("start_date_after_end_date"));
  }

  @Test
  void deleteReturnsNoContent() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    Objective existing = sampleObjective("obj-1");
    when(objectiveRepository.findByIdAndUserId("obj-1", 1L)).thenReturn(Optional.of(existing));

    mockMvc
        .perform(
            delete("/api/objectives/obj-1")
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isNoContent());

    verify(objectiveRepository).delete(existing);
  }

  @Test
  void updateReturnsUpdatedObjective() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    Objective existing = sampleObjective("obj-1");
    when(objectiveRepository.findByIdAndUserId("obj-1", 1L)).thenReturn(Optional.of(existing));
    when(progressService.now()).thenReturn(ControllerTestSupport.fixedInstant());
    when(progressService.defaultZone()).thenReturn(java.time.ZoneId.of("UTC"));
    when(objectiveRepository.save(any(Objective.class))).thenAnswer(inv -> inv.getArgument(0));
    ObjectiveStatus inProgress = objectiveStatus("IN_PROGRESS", "In progress");
    when(progressService.compute(any(Objective.class), any()))
        .thenReturn(new ObjectiveProgressService.Progress(7L, "IN_PROGRESS"));
    when(statusRepository.findByCode("IN_PROGRESS")).thenReturn(Optional.of(inProgress));

    mockMvc
        .perform(
            put("/api/objectives/obj-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"targetValue\":20,\"notes\":\"Stretch goal\"}")
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.targetValue").value(20))
        .andExpect(jsonPath("$.progressValue").value(7));
  }

  private static ObjectiveStatus objectiveStatus(String code, String label) {
    ObjectiveStatus status = new ObjectiveStatus();
    status.setCode(code);
    status.setLabel(label);
    return status;
  }

  private Habit sampleHabit() {
    Habit habit = new Habit();
    habit.setId("habit-1");
    habit.setName("Run");
    return habit;
  }

  private Objective sampleObjective(String id) {
    Instant now = ControllerTestSupport.fixedInstant();
    Objective objective = new Objective();
    objective.setId(id);
    objective.setUser(user);
    objective.setHabit(sampleHabit());
    objective.setStartDate(LocalDate.of(2026, 1, 1));
    objective.setEndDate(LocalDate.of(2026, 12, 31));
    objective.setMetricType(Objective.MetricType.REPETITIONS);
    objective.setTargetValue(10);
    objective.setStatus(objectiveStatus("IN_PROGRESS", "In progress"));
    objective.setCreatedAt(now);
    objective.setUpdatedAt(now);
    return objective;
  }
}
