package com.example.backend.habits.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
import com.example.backend.habits.HabitEntry;
import com.example.backend.habits.HabitEntryRepository;
import com.example.backend.habits.HabitRepository;
import com.example.backend.support.ControllerTestSupport;
import com.example.backend.users.CurrentUserService;
import com.example.backend.users.User;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
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
class HabitEntriesControllerTest {

  @Mock HabitEntryRepository entryRepository;
  @Mock HabitRepository habitRepository;
  @Mock CurrentUserService currentUserService;

  MockMvc mockMvc;
  User user;

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(
                new HabitEntriesController(entryRepository, habitRepository, currentUserService))
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
    user = ControllerTestSupport.userWithId(1L, "user@example.com");
  }

  @Test
  void listReturnsEntriesForUser() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    HabitEntry entry = sampleEntry("entry-1");
    when(entryRepository.findAllByUserIdOrderByDateDesc(1L)).thenReturn(List.of(entry));

    mockMvc
        .perform(get("/api/habit-entries").principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value("entry-1"))
        .andExpect(jsonPath("$[0].durationMinutes").value(60));
  }

  @Test
  void listFiltersByDateRange() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    HabitEntry entry = sampleEntry("entry-1");
    when(entryRepository.findAllByUserIdAndDateBetweenOrderByDateAsc(
            eq(1L), eq(LocalDate.of(2026, 1, 1)), eq(LocalDate.of(2026, 1, 31))))
        .thenReturn(List.of(entry));

    mockMvc
        .perform(
            get("/api/habit-entries")
                .param("fromDate", "2026-01-01")
                .param("toDate", "2026-01-31")
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value("entry-1"));
  }

  @Test
  void createReturnsCreatedEntry() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    when(entryRepository.findByIdAndUserId("entry-1", 1L)).thenReturn(Optional.empty());
    when(habitRepository.findByIdAndUserId("habit-1", 1L)).thenReturn(Optional.of(sampleHabit("habit-1")));
    when(entryRepository.save(any(HabitEntry.class))).thenAnswer(inv -> inv.getArgument(0));

    mockMvc
        .perform(
            post("/api/habit-entries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "id":"entry-1",
                      "habitId":"habit-1",
                      "date":"2026-01-15",
                      "startTime":"09:00",
                      "endTime":"10:00",
                      "notes":"Morning session"
                    }
                    """)
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value("entry-1"))
        .andExpect(jsonPath("$.durationMinutes").value(60));
  }

  @Test
  void createRejectsEndBeforeStart() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    when(habitRepository.findByIdAndUserId("habit-1", 1L)).thenReturn(Optional.of(sampleHabit("habit-1")));

    mockMvc
        .perform(
            post("/api/habit-entries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "id":"entry-1",
                      "habitId":"habit-1",
                      "date":"2026-01-15",
                      "startTime":"11:00",
                      "endTime":"10:00"
                    }
                    """)
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("end_before_start"));
  }

  @Test
  void updateReturnsUpdatedEntry() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    HabitEntry existing = sampleEntry("entry-1");
    when(entryRepository.findByIdAndUserId("entry-1", 1L)).thenReturn(Optional.of(existing));
    when(entryRepository.save(any(HabitEntry.class))).thenAnswer(inv -> inv.getArgument(0));

    mockMvc
        .perform(
            put("/api/habit-entries/entry-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"notes\":\"Updated notes\"}")
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.notes").value("Updated notes"));
  }

  @Test
  void deleteReturnsNoContent() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    HabitEntry existing = sampleEntry("entry-1");
    when(entryRepository.findByIdAndUserId("entry-1", 1L)).thenReturn(Optional.of(existing));

    mockMvc
        .perform(
            delete("/api/habit-entries/entry-1")
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isNoContent());

    verify(entryRepository).delete(existing);
  }

  private static Habit sampleHabit(String id) {
    Habit habit = new Habit();
    habit.setId(id);
    habit.setName("Run");
    return habit;
  }

  private HabitEntry sampleEntry(String id) {
    Instant now = ControllerTestSupport.fixedInstant();
    HabitEntry entry = new HabitEntry();
    entry.setId(id);
    entry.setUser(user);
    entry.setHabit(sampleHabit("habit-1"));
    entry.setDate(LocalDate.of(2026, 1, 15));
    entry.setStartTime(LocalTime.of(9, 0));
    entry.setEndTime(LocalTime.of(10, 0));
    entry.setDurationMinutes(60);
    entry.setNotes("Notes");
    entry.setCreatedAt(now);
    entry.setUpdatedAt(now);
    return entry;
  }
}
