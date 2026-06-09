package com.example.backend.stats;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.habits.Habit;
import com.example.backend.habits.HabitEntry;
import com.example.backend.habits.HabitEntryRepository;
import com.example.backend.support.ControllerTestSupport;
import com.example.backend.users.CurrentUserService;
import com.example.backend.users.User;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class StatsControllerTest {

  @Mock HabitEntryRepository entryRepository;
  @Mock CurrentUserService currentUserService;

  MockMvc mockMvc;
  User user;

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(new StatsController(entryRepository, currentUserService))
            .build();
    user = ControllerTestSupport.userWithId(1L, "admin@example.com");
  }

  @Test
  void statsAggregatesSessionsAndMinutesByHabit() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    when(entryRepository.findAllByUserIdAndDateBetweenOrderByDateAsc(
            eq(1L), eq(LocalDate.of(2026, 1, 1)), eq(LocalDate.of(2026, 1, 31))))
        .thenReturn(List.of(entry("entry-1", "habit-a", 30), entry("entry-2", "habit-a", 45), entry("entry-3", "habit-b", 60)));

    mockMvc
        .perform(
            get("/api/stats")
                .param("fromDate", "2026-01-01")
                .param("toDate", "2026-01-31")
                .principal(ControllerTestSupport.principal("admin@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalSessions").value(3))
        .andExpect(jsonPath("$.totalMinutes").value(135))
        .andExpect(jsonPath("$.byHabit.length()").value(2))
        .andExpect(jsonPath("$.fromDate").value("2026-01-01"))
        .andExpect(jsonPath("$.toDate").value("2026-01-31"));
  }

  private HabitEntry entry(String id, String habitId, int minutes) {
    Instant now = ControllerTestSupport.fixedInstant();
    Habit habit = new Habit();
    habit.setId(habitId);
    HabitEntry entry = new HabitEntry();
    entry.setId(id);
    entry.setUser(user);
    entry.setHabit(habit);
    entry.setDate(LocalDate.of(2026, 1, 10));
    entry.setStartTime(LocalTime.of(9, 0));
    entry.setEndTime(LocalTime.of(9, 0).plusMinutes(minutes));
    entry.setDurationMinutes(minutes);
    entry.setCreatedAt(now);
    entry.setUpdatedAt(now);
    return entry;
  }
}
