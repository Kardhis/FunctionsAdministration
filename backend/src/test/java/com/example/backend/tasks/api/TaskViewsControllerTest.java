package com.example.backend.tasks.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.support.ControllerTestSupport;
import com.example.backend.tasks.TaskService;
import com.example.backend.tasks.TaskService.EisenhowerResponse;
import com.example.backend.tasks.TaskService.PagedTasksResponse;
import com.example.backend.tasks.TaskService.TaskDto;
import com.example.backend.tasks.TaskService.TaskSummaryDto;
import com.example.backend.tasks.TaskService.TodayResponse;
import com.example.backend.tasks.TaskTestFixtures;
import com.example.backend.users.CurrentUserService;
import com.example.backend.users.User;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class TaskViewsControllerTest {

  @Mock TaskService taskService;
  @Mock CurrentUserService currentUserService;

  MockMvc mockMvc;
  User user;

  static final Long USER_ID = 1L;

  @BeforeEach
  void setUp() {
    user = ControllerTestSupport.userWithId(USER_ID, "user@example.com");
    when(currentUserService.requireUser(any(Principal.class))).thenReturn(user);

    mockMvc =
        MockMvcBuilders.standaloneSetup(new TaskViewsController(taskService, currentUserService))
            .build();
  }

  @Test
  void shouldReturnTodayViewWhenAuthenticated() throws Exception {
    TaskDto dto = sampleDto();
    when(taskService.findToday(eq(USER_ID), eq(null)))
        .thenReturn(new TodayResponse(List.of(dto), List.of(), List.of()));

    mockMvc
        .perform(get("/api/tasks/today").principal(() -> "user@example.com"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.plannedToday[0].title").value("Test task"));
  }

  @Test
  void shouldReturnEisenhowerViewWhenAuthenticated() throws Exception {
    TaskDto dto = sampleDto();
    when(taskService.findEisenhower(USER_ID))
        .thenReturn(new EisenhowerResponse(List.of(dto), List.of(), List.of(), List.of(), List.of()));

    mockMvc
        .perform(get("/api/tasks/eisenhower").principal(() -> "user@example.com"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.importantUrgent[0].title").value("Test task"));
  }

  @Test
  void shouldReturnCalendarViewWhenRangeProvided() throws Exception {
    when(taskService.findCalendar(USER_ID, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 30)))
        .thenReturn(List.of(sampleDto()));

    mockMvc
        .perform(
            get("/api/tasks/calendar")
                .param("from", "2026-06-01")
                .param("to", "2026-06-30")
                .principal(() -> "user@example.com"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].title").value("Test task"));
  }

  @Test
  void shouldReturnBacklogViewWhenAuthenticated() throws Exception {
    when(taskService.findBacklog(USER_ID, 0, 25))
        .thenReturn(new PagedTasksResponse(List.of(sampleDto()), 0, 25, 1, 1, true, true));

    mockMvc
        .perform(get("/api/tasks/backlog").principal(() -> "user@example.com"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].title").value("Test task"));
  }

  @Test
  void shouldReturnSearchResultsWhenQueryProvided() throws Exception {
    when(taskService.search(USER_ID, "test", 10))
        .thenReturn(List.of(new TaskSummaryDto(1L, "Test task", "PENDIENTE", null)));

    mockMvc
        .perform(
            get("/api/tasks/search")
                .param("q", "test")
                .principal(() -> "user@example.com"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].title").value("Test task"));
  }

  private static TaskDto sampleDto() {
    return TaskTestFixtures.sampleDto(1L, "Test task", "PENDIENTE");
  }
}
