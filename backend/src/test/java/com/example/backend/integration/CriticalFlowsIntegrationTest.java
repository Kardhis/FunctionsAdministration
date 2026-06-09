package com.example.backend.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.auth.JwtService;
import com.example.backend.rbac.RoleRepository;
import com.example.backend.rbac.UserRoleRepository;
import com.example.backend.support.AbstractIntegrationTest;
import com.example.backend.support.IntegrationAuthSupport;
import com.example.backend.users.UserRepository;
import jakarta.servlet.http.Cookie;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@AutoConfigureMockMvc
class CriticalFlowsIntegrationTest extends AbstractIntegrationTest {

  private static final String PASSWORD = "password12";

  @Autowired MockMvc mockMvc;
  @Autowired UserRepository userRepository;
  @Autowired RoleRepository roleRepository;
  @Autowired UserRoleRepository userRoleRepository;
  @Autowired JwtService jwtService;

  @Value("${app.auth.cookie-name}")
  String cookieName;

  @Test
  void registerThenLoginSetsAuthCookie() throws Exception {
    String email = IntegrationAuthSupport.uniqueEmail("cp14-register");

    mockMvc
        .perform(
            post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"email\":\""
                        + email
                        + "\",\"password\":\""
                        + PASSWORD
                        + "\",\"displayName\":\"CP14 User\"}"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.message").value("register_ok"));

    mockMvc
        .perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("login_ok"))
        .andExpect(header().exists("Set-Cookie"));
  }

  @Test
  void createHabitAndEntryWhenAuthenticated() throws Exception {
    Cookie authCookie =
        IntegrationAuthSupport.registerAndLogin(mockMvc, cookieName, "cp14-habits", PASSWORD);
    String habitId = "habit-" + UUID.randomUUID();
    String entryId = "entry-" + UUID.randomUUID();

    mockMvc
        .perform(
            post("/api/habits")
                .cookie(authCookie)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "id":"%s",
                      "name":"Morning run",
                      "color":"#ff0000",
                      "active":true
                    }
                    """
                        .formatted(habitId)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(habitId))
        .andExpect(jsonPath("$.name").value("Morning run"));

    mockMvc
        .perform(
            post("/api/habit-entries")
                .cookie(authCookie)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "id":"%s",
                      "habitId":"%s",
                      "date":"2026-06-08",
                      "startTime":"09:00",
                      "endTime":"10:00",
                      "notes":"CP14 session"
                    }
                    """
                        .formatted(entryId, habitId)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(entryId))
        .andExpect(jsonPath("$.habitId").value(habitId))
        .andExpect(jsonPath("$.durationMinutes").value(60));
  }

  @Test
  void createTaskAndCompleteWhenAuthenticated() throws Exception {
    Cookie authCookie =
        IntegrationAuthSupport.registerAndLogin(mockMvc, cookieName, "cp14-tasks", PASSWORD);

    MvcResult createResult =
        mockMvc
            .perform(
                post("/api/tasks")
                    .cookie(authCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {"title":"CP14 task","plannedDate":"2026-06-15","recurring":false}
                        """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("PLANIFICADA"))
            .andReturn();

    String taskId =
        IntegrationAuthSupport.extractJsonNumber(
            createResult.getResponse().getContentAsString(), "\"id\":");

    mockMvc
        .perform(post("/api/tasks/" + taskId + "/complete").cookie(authCookie))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("COMPLETADA"))
        .andExpect(jsonPath("$.completedAt").exists());
  }

  @Test
  void createObjectiveWhenAuthenticated() throws Exception {
    Cookie authCookie =
        IntegrationAuthSupport.registerAndLogin(mockMvc, cookieName, "cp14-objectives", PASSWORD);
    String habitId = "habit-" + UUID.randomUUID();
    String objectiveId = "obj-" + UUID.randomUUID();

    mockMvc
        .perform(
            post("/api/habits")
                .cookie(authCookie)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "id":"%s",
                      "name":"Study",
                      "color":"#00ff00",
                      "active":true
                    }
                    """
                        .formatted(habitId)))
        .andExpect(status().isCreated());

    mockMvc
        .perform(
            post("/api/objectives")
                .cookie(authCookie)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "id":"%s",
                      "habitId":"%s",
                      "startDate":"2026-01-01",
                      "endDate":"2026-12-31",
                      "metricType":"REPETITIONS",
                      "targetValue":10
                    }
                    """
                        .formatted(objectiveId, habitId)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(objectiveId))
        .andExpect(jsonPath("$.targetValue").value(10));
  }

  @Test
  void adminCreatesUserWhenAuthenticatedAsAdmin() throws Exception {
    Cookie adminCookie =
        IntegrationAuthSupport.adminCookie(
            userRepository, roleRepository, userRoleRepository, jwtService, cookieName);
    String newEmail = IntegrationAuthSupport.uniqueEmail("cp14-admin-created");

    mockMvc
        .perform(
            post("/api/admin/users")
                .cookie(adminCookie)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "email":"%s",
                      "password":"secret123",
                      "displayName":"Admin Created",
                      "active":true
                    }
                    """
                        .formatted(newEmail)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.email").value(newEmail))
        .andExpect(jsonPath("$.roles[0]").value("USER"));
  }

  @Test
  void habitsWithoutAuthReturns401() throws Exception {
    mockMvc.perform(get("/api/habits")).andExpect(status().isUnauthorized());
  }
}
