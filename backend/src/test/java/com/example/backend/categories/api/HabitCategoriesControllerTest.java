package com.example.backend.categories.api;

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
import com.example.backend.categories.HabitCategory;
import com.example.backend.categories.HabitCategoryLinkRepository;
import com.example.backend.categories.HabitCategoryRepository;
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
class HabitCategoriesControllerTest {

  @Mock HabitCategoryRepository categoryRepository;
  @Mock HabitCategoryLinkRepository linkRepository;
  @Mock CurrentUserService currentUserService;

  MockMvc mockMvc;
  User user;

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(
                new HabitCategoriesController(categoryRepository, linkRepository, currentUserService))
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
    user = ControllerTestSupport.userWithId(1L, "user@example.com");
  }

  @Test
  void listReturnsCategoriesWithHabitCounts() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    HabitCategory category = sampleCategory("cat-1", "Health");
    when(linkRepository.countDistinctHabitsByCategoryIdForUser(1L))
        .thenReturn(List.<Object[]>of(new Object[] {"cat-1", 2L}));
    when(categoryRepository.findAllByUserIdOrderByNameAsc(1L)).thenReturn(List.of(category));

    mockMvc
        .perform(
            get("/api/habit-categories")
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value("cat-1"))
        .andExpect(jsonPath("$[0].habitCount").value(2));
  }

  @Test
  void createReturnsCreatedCategory() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    when(categoryRepository.existsByUserIdAndNameIgnoreCase(1L, "Health")).thenReturn(false);
    when(categoryRepository.save(any(HabitCategory.class))).thenAnswer(inv -> inv.getArgument(0));

    mockMvc
        .perform(
            post("/api/habit-categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\":\"cat-1\",\"name\":\"Health\",\"active\":true}")
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.name").value("Health"))
        .andExpect(jsonPath("$.habitCount").value(0));
  }

  @Test
  void createRejectsDuplicateName() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    when(categoryRepository.existsByUserIdAndNameIgnoreCase(1L, "Health")).thenReturn(true);

    mockMvc
        .perform(
            post("/api/habit-categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\":\"cat-1\",\"name\":\"Health\"}")
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.error").value("category_name_exists"));
  }

  @Test
  void updateReturnsUpdatedCategory() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    HabitCategory existing = sampleCategory("cat-1", "Health");
    when(categoryRepository.findByIdAndUserId("cat-1", 1L)).thenReturn(Optional.of(existing));
    when(categoryRepository.save(any(HabitCategory.class))).thenAnswer(inv -> inv.getArgument(0));
    when(linkRepository.countDistinctHabitsByCategoryIdForUser(1L)).thenReturn(List.of());

    mockMvc
        .perform(
            put("/api/habit-categories/cat-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Fitness\",\"active\":false}")
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Fitness"))
        .andExpect(jsonPath("$.active").value(false));
  }

  @Test
  void deleteReturnsNoContent() throws Exception {
    when(currentUserService.requireUser(any())).thenReturn(user);
    HabitCategory existing = sampleCategory("cat-1", "Health");
    when(categoryRepository.findByIdAndUserId("cat-1", 1L)).thenReturn(Optional.of(existing));

    mockMvc
        .perform(
            delete("/api/habit-categories/cat-1")
                .principal(ControllerTestSupport.principal("user@example.com")))
        .andExpect(status().isNoContent());

    verify(categoryRepository).delete(existing);
  }

  private HabitCategory sampleCategory(String id, String name) {
    Instant now = ControllerTestSupport.fixedInstant();
    HabitCategory category = new HabitCategory();
    category.setId(id);
    category.setUser(user);
    category.setName(name);
    category.setActive(true);
    category.setCreatedAt(now);
    category.setUpdatedAt(now);
    return category;
  }
}
