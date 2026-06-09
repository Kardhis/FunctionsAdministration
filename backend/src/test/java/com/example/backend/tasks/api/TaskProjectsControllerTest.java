package com.example.backend.tasks.api;

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
import com.example.backend.support.ControllerTestSupport;
import com.example.backend.tasks.TaskProject;
import com.example.backend.tasks.TaskProjectRepository;
import com.example.backend.users.CurrentUserService;
import com.example.backend.users.User;
import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class TaskProjectsControllerTest {

  @Mock TaskProjectRepository projectRepository;
  @Mock CurrentUserService currentUserService;

  MockMvc mockMvc;
  User user;

  static final Long USER_ID = 1L;
  static final Long PROJECT_ID = 5L;

  @BeforeEach
  void setUp() {
    user = ControllerTestSupport.userWithId(USER_ID, "user@example.com");
    when(currentUserService.requireUser(any(Principal.class))).thenReturn(user);

    mockMvc =
        MockMvcBuilders.standaloneSetup(
                new TaskProjectsController(projectRepository, currentUserService))
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
  }

  @Test
  void shouldListProjectsWhenAuthenticated() throws Exception {
    TaskProject project = project("Work", "#ff0000");
    when(projectRepository.findAllByUserIdOrderByNameAsc(USER_ID)).thenReturn(List.of(project));

    mockMvc
        .perform(get("/api/task-projects").principal(() -> "user@example.com"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].name").value("Work"));
  }

  @Test
  void shouldCreateProjectWhenNameProvided() throws Exception {
    when(projectRepository.save(any(TaskProject.class)))
        .thenAnswer(inv -> {
          TaskProject p = inv.getArgument(0);
          ReflectionTestUtils.setField(p, "id", PROJECT_ID);
          return p;
        });

    mockMvc
        .perform(
            post("/api/task-projects")
                .principal(() -> "user@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Work\",\"color\":\"#112233\"}"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.name").value("Work"));
  }

  @Test
  void shouldRejectCreateProjectWhenNameMissing() throws Exception {
    mockMvc
        .perform(
            post("/api/task-projects")
                .principal(() -> "user@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"  \"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("name_required"));
  }

  @Test
  void shouldUpdateProjectWhenOwnerMatches() throws Exception {
    TaskProject project = project("Old", "#000000");
    ReflectionTestUtils.setField(project, "id", PROJECT_ID);
    when(projectRepository.findByIdAndUserId(PROJECT_ID, USER_ID)).thenReturn(Optional.of(project));
    when(projectRepository.save(project)).thenReturn(project);

    mockMvc
        .perform(
            put("/api/task-projects/{id}", PROJECT_ID)
                .principal(() -> "user@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Updated\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Updated"));
  }

  @Test
  void shouldDeleteProjectWhenOwnerMatches() throws Exception {
    TaskProject project = project("Remove", "#000000");
    ReflectionTestUtils.setField(project, "id", PROJECT_ID);
    when(projectRepository.findByIdAndUserId(PROJECT_ID, USER_ID)).thenReturn(Optional.of(project));

    mockMvc
        .perform(delete("/api/task-projects/{id}", PROJECT_ID).principal(() -> "user@example.com"))
        .andExpect(status().isNoContent());

    verify(projectRepository).delete(project);
  }

  private static TaskProject project(String name, String color) {
    TaskProject project = new TaskProject();
    project.setName(name);
    project.setColor(color);
    Instant now = Instant.now();
    project.setCreatedAt(now);
    project.setUpdatedAt(now);
    return project;
  }
}
