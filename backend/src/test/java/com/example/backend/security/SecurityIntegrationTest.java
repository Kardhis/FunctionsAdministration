package com.example.backend.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.auth.JwtService;
import com.example.backend.support.AbstractIntegrationTest;
import jakarta.servlet.http.Cookie;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class SecurityIntegrationTest extends AbstractIntegrationTest {

  @Autowired MockMvc mockMvc;
  @Autowired JwtService jwtService;

  @Test
  void habitsWithoutAuthReturns401() throws Exception {
    mockMvc.perform(get("/api/habits")).andExpect(status().isUnauthorized());
  }

  @Test
  void adminUsersWithUserRoleReturns403() throws Exception {
    String token = jwtService.createToken("user-only@example.com", List.of("USER"));

    mockMvc
        .perform(
            get("/api/admin/users").cookie(new Cookie("access_token", token)))
        .andExpect(status().isForbidden());
  }
}
