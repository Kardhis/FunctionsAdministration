package com.example.backend.tasks;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.auth.JwtService;
import com.example.backend.rbac.Role;
import com.example.backend.rbac.RoleRepository;
import com.example.backend.rbac.UserRole;
import com.example.backend.rbac.UserRoleKey;
import com.example.backend.rbac.UserRoleRepository;
import com.example.backend.support.AbstractIntegrationTest;
import com.example.backend.support.TestUserFactory;
import com.example.backend.users.User;
import com.example.backend.users.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@AutoConfigureMockMvc
class TaskIntegrationTest extends AbstractIntegrationTest {

  @Autowired MockMvc mockMvc;
  @Autowired UserRepository userRepository;
  @Autowired RoleRepository roleRepository;
  @Autowired UserRoleRepository userRoleRepository;
  @Autowired JwtService jwtService;

  @Value("${app.auth.cookie-name}")
  String cookieName;

  User user;
  Cookie authCookie;

  @BeforeEach
  void setUpUser() {
    user = userRepository.save(TestUserFactory.activeUser("tasks-int@example.com", "hash"));
    Role userRole = roleRepository.findByName("USER").orElseThrow();
    UserRole ur = new UserRole();
    ur.setUser(user);
    ur.setRole(userRole);
    ur.setId(new UserRoleKey(user.getId(), userRole.getId()));
    userRoleRepository.save(ur);

    String token = jwtService.createToken(user.getEmail(), java.util.List.of("USER"));
    authCookie = new Cookie(cookieName, token);
  }

  @Test
  void shouldCreateAndCompleteTaskWhenAuthenticated() throws Exception {
    MvcResult createResult =
        mockMvc
            .perform(
                post("/api/tasks")
                    .cookie(authCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {"title":"Integration task","plannedDate":"2026-06-15","recurring":false}
                        """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("PLANIFICADA"))
            .andReturn();

    String body = createResult.getResponse().getContentAsString();
    String taskId = extractJsonNumber(body, "\"id\":");

    mockMvc
        .perform(post("/api/tasks/" + taskId + "/complete").cookie(authCookie))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("COMPLETADA"))
        .andExpect(jsonPath("$.completedAt").exists());
  }

  private static String extractJsonNumber(String json, String fieldPrefix) {
    int start = json.indexOf(fieldPrefix);
    if (start < 0) {
      throw new IllegalStateException("Field not found: " + fieldPrefix);
    }
    start += fieldPrefix.length();
    int end = start;
    while (end < json.length() && Character.isDigit(json.charAt(end))) {
      end++;
    }
    return json.substring(start, end);
  }
}
