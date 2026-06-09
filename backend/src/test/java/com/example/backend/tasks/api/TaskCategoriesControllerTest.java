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
import com.example.backend.tasks.TaskCategory;
import com.example.backend.tasks.TaskCategoryRepository;
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
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class TaskCategoriesControllerTest {

  @Mock TaskCategoryRepository categoryRepository;
  @Mock CurrentUserService currentUserService;

  MockMvc mockMvc;
  User user;

  static final Long USER_ID = 1L;
  static final Long CATEGORY_ID = 7L;

  @BeforeEach
  void setUp() {
    user = ControllerTestSupport.userWithId(USER_ID, "user@example.com");
    when(currentUserService.requireUser(any(Principal.class))).thenReturn(user);

    mockMvc =
        MockMvcBuilders.standaloneSetup(
                new TaskCategoriesController(categoryRepository, currentUserService))
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
  }

  @Test
  void shouldListCategoriesWhenAuthenticated() throws Exception {
    TaskCategory category = category("Personal", "#00ff00");
    when(categoryRepository.findAllByUserIdOrderByNameAsc(USER_ID)).thenReturn(List.of(category));

    mockMvc
        .perform(get("/api/task-categories").principal(() -> "user@example.com"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].name").value("Personal"));
  }

  @Test
  void shouldCreateCategoryWhenNameProvided() throws Exception {
    when(categoryRepository.save(any(TaskCategory.class)))
        .thenAnswer(inv -> {
          TaskCategory c = inv.getArgument(0);
          ReflectionTestUtils.setField(c, "id", CATEGORY_ID);
          return c;
        });

    mockMvc
        .perform(
            post("/api/task-categories")
                .principal(() -> "user@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Personal\",\"color\":\"#445566\"}"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.name").value("Personal"));
  }

  @Test
  void shouldRejectCreateCategoryWhenNameMissing() throws Exception {
    mockMvc
        .perform(
            post("/api/task-categories")
                .principal(() -> "user@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("name_required"));
  }

  @Test
  void shouldUpdateCategoryWhenOwnerMatches() throws Exception {
    TaskCategory category = category("Old", "#000000");
    ReflectionTestUtils.setField(category, "id", CATEGORY_ID);
    when(categoryRepository.findByIdAndUserId(CATEGORY_ID, USER_ID)).thenReturn(Optional.of(category));
    when(categoryRepository.save(category)).thenReturn(category);

    mockMvc
        .perform(
            put("/api/task-categories/{id}", CATEGORY_ID)
                .principal(() -> "user@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Updated\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Updated"));
  }

  @Test
  void shouldDeleteCategoryWhenOwnerMatches() throws Exception {
    TaskCategory category = category("Remove", "#000000");
    ReflectionTestUtils.setField(category, "id", CATEGORY_ID);
    when(categoryRepository.findByIdAndUserId(CATEGORY_ID, USER_ID)).thenReturn(Optional.of(category));

    mockMvc
        .perform(
            delete("/api/task-categories/{id}", CATEGORY_ID).principal(() -> "user@example.com"))
        .andExpect(status().isNoContent());

    verify(categoryRepository).delete(category);
  }

  private static TaskCategory category(String name, String color) {
    TaskCategory category = new TaskCategory();
    category.setName(name);
    category.setColor(color);
    Instant now = Instant.now();
    category.setCreatedAt(now);
    category.setUpdatedAt(now);
    return category;
  }
}
