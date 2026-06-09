package com.example.backend.habits.api;

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
import com.example.backend.categories.HabitCategoryLinkRepository;
import com.example.backend.categories.HabitCategoryRepository;
import com.example.backend.habits.Habit;
import com.example.backend.habits.HabitRepository;
import com.example.backend.support.ControllerTestSupport;
import com.example.backend.users.CurrentUserService;
import com.example.backend.users.User;
import java.time.Instant;
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
class HabitsControllerTest {

  @Mock HabitRepository habitRepository;
  @Mock HabitCategoryRepository habitCategoryRepository;
  @Mock HabitCategoryLinkRepository habitCategoryLinkRepository;
  @Mock CurrentUserService currentUserService;

  MockMvc mockMvc;
  User user;

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(
                new HabitsController(
                    habitRepository,
                    habitCategoryRepository,
                    habitCategoryLinkRepository,
                    currentUserService))
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
    user = ControllerTestSupport.userWithId(1L, "user@example.com");
  }

  @Test
  void listReturnsUserHabits() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    Habit habit = sampleHabit("habit-1");
    when(habitRepository.findAllByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(habit));
    when(habitCategoryLinkRepository.findCategoryIdsByHabitId("habit-1")).thenReturn(List.of("cat-1"));

    mockMvc
        .perform(get("/api/habits").principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value("habit-1"))
        .andExpect(jsonPath("$[0].categoryIds[0]").value("cat-1"));
  }

  @Test
  void createReturnsCreatedHabit() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    when(habitRepository.findByIdAndUserId("habit-1", 1L)).thenReturn(Optional.empty());
    when(habitRepository.save(any(Habit.class))).thenAnswer(inv -> inv.getArgument(0));
    when(habitCategoryLinkRepository.findCategoryIdsByHabitId("habit-1")).thenReturn(List.of());

    mockMvc
        .perform(
            post("/api/habits")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "id":"habit-1",
                      "name":"Run",
                      "color":"#ff0000",
                      "active":true
                    }
                    """)
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.name").value("Run"))
        .andExpect(jsonPath("$.active").value(true));
  }

  @Test
  void createRejectsMissingName() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);

    mockMvc
        .perform(
            post("/api/habits")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\":\"habit-1\",\"color\":\"#ff0000\"}")
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("name_required"));
  }

  @Test
  void updateReturnsUpdatedHabit() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    Habit existing = sampleHabit("habit-1");
    when(habitRepository.findByIdAndUserId("habit-1", 1L)).thenReturn(Optional.of(existing));
    when(habitRepository.save(any(Habit.class))).thenAnswer(inv -> inv.getArgument(0));
    when(habitCategoryLinkRepository.findCategoryIdsByHabitId("habit-1")).thenReturn(List.of());

    mockMvc
        .perform(
            put("/api/habits/habit-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Jog\"}")
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Jog"));
  }

  @Test
  void deleteReturnsNoContent() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    Habit existing = sampleHabit("habit-1");
    when(habitRepository.findByIdAndUserId("habit-1", 1L)).thenReturn(Optional.of(existing));

    mockMvc
        .perform(
            delete("/api/habits/habit-1").principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isNoContent());

    verify(habitRepository).delete(existing);
  }

  private Habit sampleHabit(String id) {
    Instant now = ControllerTestSupport.fixedInstant();
    Habit habit = new Habit();
    habit.setId(id);
    habit.setUser(user);
    habit.setName("Run");
    habit.setColor("#ff0000");
    habit.setActive(true);
    habit.setCreatedAt(now);
    habit.setUpdatedAt(now);
    return habit;
  }
}
