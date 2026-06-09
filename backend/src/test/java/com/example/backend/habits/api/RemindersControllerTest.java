package com.example.backend.habits.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.api.ApiExceptionHandler;
import com.example.backend.habits.Habit;
import com.example.backend.habits.HabitRepository;
import com.example.backend.habits.Reminder;
import com.example.backend.habits.ReminderRepository;
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
import tools.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class RemindersControllerTest {

  @Mock ReminderRepository reminderRepository;
  @Mock HabitRepository habitRepository;
  @Mock CurrentUserService currentUserService;

  MockMvc mockMvc;
  User user;
  ObjectMapper objectMapper = new ObjectMapper();

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(
                new RemindersController(
                    reminderRepository, habitRepository, currentUserService, objectMapper))
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
    user = ControllerTestSupport.userWithId(1L, "user@example.com");
  }

  @Test
  void listReturnsReminders() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    when(reminderRepository.findAllByUserIdOrderByCreatedAtDesc(1L))
        .thenReturn(List.of(sampleReminder("rem-1")));

    mockMvc
        .perform(get("/api/reminders").principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value("rem-1"))
        .andExpect(jsonPath("$[0].title").value("Morning run"));
  }

  @Test
  void createReturnsCreatedReminder() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    when(reminderRepository.findByIdAndUserId("rem-1", 1L)).thenReturn(Optional.empty());
    when(habitRepository.findByIdAndUserId("habit-1", 1L)).thenReturn(Optional.of(sampleHabit()));
    when(reminderRepository.save(any(Reminder.class))).thenAnswer(inv -> inv.getArgument(0));

    mockMvc
        .perform(
            post("/api/reminders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "id":"rem-1",
                      "habitId":"habit-1",
                      "title":"Morning run",
                      "schedule":{"days":["MON","WED"]},
                      "enabled":true
                    }
                    """)
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value("rem-1"))
        .andExpect(jsonPath("$.enabled").value(true));
  }

  @Test
  void createRejectsMissingSchedule() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);

    mockMvc
        .perform(
            post("/api/reminders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\":\"rem-1\",\"title\":\"Morning run\"}")
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("schedule_required"));
  }

  @Test
  void updateReturnsUpdatedReminder() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    Reminder existing = sampleReminder("rem-1");
    when(reminderRepository.findByIdAndUserId("rem-1", 1L)).thenReturn(Optional.of(existing));
    when(reminderRepository.save(any(Reminder.class))).thenAnswer(inv -> inv.getArgument(0));

    mockMvc
        .perform(
            put("/api/reminders/rem-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Evening run\",\"enabled\":false}")
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Evening run"))
        .andExpect(jsonPath("$.enabled").value(false));
  }

  private Habit sampleHabit() {
    Habit habit = new Habit();
    habit.setId("habit-1");
    habit.setName("Run");
    return habit;
  }

  private Reminder sampleReminder(String id) {
    Reminder reminder = new Reminder();
    reminder.setId(id);
    reminder.setUser(user);
    reminder.setHabit(sampleHabit());
    reminder.setTitle("Morning run");
    reminder.setScheduleJson("{\"days\":[\"MON\"]}");
    reminder.setEnabled(true);
    reminder.setCreatedAt(ControllerTestSupport.fixedInstant());
    return reminder;
  }
}
