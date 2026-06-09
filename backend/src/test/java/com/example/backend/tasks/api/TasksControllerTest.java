package com.example.backend.tasks.api;

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
import com.example.backend.support.ControllerTestSupport;
import com.example.backend.tasks.TaskService;
import com.example.backend.tasks.TaskService.PagedTasksResponse;
import com.example.backend.tasks.TaskService.TaskDto;
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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class TasksControllerTest {

  @Mock TaskService taskService;
  @Mock CurrentUserService currentUserService;
  User user;

  MockMvc mockMvc;

  static final Long USER_ID = 1L;
  static final Long TASK_ID = 42L;

  @BeforeEach
  void setUp() {
    user = ControllerTestSupport.userWithId(USER_ID, "user@example.com");
    when(currentUserService.requireUser(any(Principal.class))).thenReturn(user);

    mockMvc =
        MockMvcBuilders.standaloneSetup(new TasksController(taskService, currentUserService))
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
  }

  @Test
  void shouldListTasksWhenAuthenticated() throws Exception {
    TaskDto dto = sampleDto();
    when(taskService.findFiltered(
            eq(USER_ID), eq(null), eq(false), eq(null), eq(null),
            eq(null), eq(null), eq(null), eq(null), eq(0), eq(25)))
        .thenReturn(new PagedTasksResponse(List.of(dto), 0, 25, 1, 1, true, true));

    mockMvc
        .perform(get("/api/tasks").principal(() -> "user@example.com"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].title").value("Test task"));
  }

  @Test
  void shouldCreateTaskWhenRequestValid() throws Exception {
    when(taskService.create(eq(user), any(TaskService.CreateRequest.class)))
        .thenReturn(sampleDto());

    mockMvc
        .perform(
            post("/api/tasks")
                .principal(() -> "user@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Test task\",\"recurring\":false}"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.title").value("Test task"));
  }

  @Test
  void shouldGetTaskByIdWhenExists() throws Exception {
    when(taskService.findById(TASK_ID, USER_ID)).thenReturn(sampleDto());

    mockMvc
        .perform(get("/api/tasks/{id}", TASK_ID).principal(() -> "user@example.com"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(TASK_ID));
  }

  @Test
  void shouldUpdateTaskWhenRequestValid() throws Exception {
    when(taskService.update(eq(TASK_ID), eq(user), any(TaskService.UpdateRequest.class)))
        .thenReturn(sampleDto());

    mockMvc
        .perform(
            put("/api/tasks/{id}", TASK_ID)
                .principal(() -> "user@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Updated\"}"))
        .andExpect(status().isOk());
  }

  @Test
  void shouldDeleteTaskWhenOwnerMatches() throws Exception {
    mockMvc
        .perform(delete("/api/tasks/{id}", TASK_ID).principal(() -> "user@example.com"))
        .andExpect(status().isNoContent());

    verify(taskService).softDelete(TASK_ID, USER_ID);
  }

  @Test
  void shouldDuplicateTaskWhenOwnerMatches() throws Exception {
    when(taskService.duplicate(TASK_ID, USER_ID)).thenReturn(sampleDto());

    mockMvc
        .perform(post("/api/tasks/{id}/duplicate", TASK_ID).principal(() -> "user@example.com"))
        .andExpect(status().isCreated());
  }

  @Test
  void shouldCompleteTaskWhenTransitionAllowed() throws Exception {
    TaskDto completed = TaskTestFixtures.sampleDto(TASK_ID, "Test task", "COMPLETADA");
    when(taskService.complete(TASK_ID, USER_ID)).thenReturn(completed);

    mockMvc
        .perform(post("/api/tasks/{id}/complete", TASK_ID).principal(() -> "user@example.com"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("COMPLETADA"));
  }

  @Test
  void shouldCancelTaskWhenTransitionAllowed() throws Exception {
    when(taskService.cancel(TASK_ID, USER_ID)).thenReturn(sampleDto());

    mockMvc
        .perform(post("/api/tasks/{id}/cancel", TASK_ID).principal(() -> "user@example.com"))
        .andExpect(status().isOk());
  }

  @Test
  void shouldStartTaskWhenTransitionAllowed() throws Exception {
    when(taskService.start(TASK_ID, USER_ID)).thenReturn(sampleDto());

    mockMvc
        .perform(post("/api/tasks/{id}/start", TASK_ID).principal(() -> "user@example.com"))
        .andExpect(status().isOk());
  }

  @Test
  void shouldBlockTaskWhenTransitionAllowed() throws Exception {
    when(taskService.block(TASK_ID, USER_ID)).thenReturn(sampleDto());

    mockMvc
        .perform(post("/api/tasks/{id}/block", TASK_ID).principal(() -> "user@example.com"))
        .andExpect(status().isOk());
  }

  @Test
  void shouldReopenTaskWhenTransitionAllowed() throws Exception {
    when(taskService.reopen(TASK_ID, USER_ID)).thenReturn(sampleDto());

    mockMvc
        .perform(post("/api/tasks/{id}/reopen", TASK_ID).principal(() -> "user@example.com"))
        .andExpect(status().isOk());
  }

  @Test
  void shouldScheduleTaskWhenPayloadValid() throws Exception {
    when(taskService.schedule(eq(TASK_ID), eq(USER_ID), any(LocalDate.class), eq(null)))
        .thenReturn(sampleDto());

    mockMvc
        .perform(
            post("/api/tasks/{id}/schedule", TASK_ID)
                .principal(() -> "user@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"plannedDate\":\"2026-06-15\"}"))
        .andExpect(status().isOk());
  }

  @Test
  void shouldClassifyTaskWhenPayloadValid() throws Exception {
    when(taskService.classify(TASK_ID, USER_ID, true, false)).thenReturn(sampleDto());

    mockMvc
        .perform(
            post("/api/tasks/{id}/classify", TASK_ID)
                .principal(() -> "user@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"important\":true,\"urgent\":false}"))
        .andExpect(status().isOk());
  }

  private static TaskDto sampleDto() {
    return TaskTestFixtures.sampleDto(TASK_ID, "Test task", "PENDIENTE");
  }
}
