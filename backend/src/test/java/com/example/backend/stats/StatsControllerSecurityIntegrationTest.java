package com.example.backend.stats;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class StatsControllerSecurityIntegrationTest extends AbstractIntegrationTest {

  @Autowired MockMvc mockMvc;
  @Autowired JwtService jwtService;
  @Autowired UserRepository userRepository;
  @Autowired RoleRepository roleRepository;
  @Autowired UserRoleRepository userRoleRepository;

  @Value("${app.auth.cookie-name}")
  String cookieName;

  User adminUser;
  User regularUser;

  @BeforeEach
  void setUpUsers() {
    adminUser = userRepository.save(TestUserFactory.activeUser("stats-admin@example.com", "hash"));
    regularUser = userRepository.save(TestUserFactory.activeUser("stats-user@example.com", "hash"));
    assignRole(adminUser, "ADMIN");
    assignRole(regularUser, "USER");
  }

  @Test
  void statsRequiresAdminRole() throws Exception {
    mockMvc
        .perform(
            get("/api/stats")
                .param("fromDate", "2026-01-01")
                .param("toDate", "2026-01-31")
                .cookie(userCookie(regularUser, List.of("USER"))))
        .andExpect(status().isForbidden());
  }

  @Test
  void statsAllowsAdminRole() throws Exception {
    mockMvc
        .perform(
            get("/api/stats")
                .param("fromDate", "2026-01-01")
                .param("toDate", "2026-01-31")
                .cookie(userCookie(adminUser, List.of("ADMIN"))))
        .andExpect(status().isOk());
  }

  private void assignRole(User user, String roleName) {
    Role role =
        roleRepository
            .findByName(roleName)
            .orElseThrow(() -> new IllegalStateException("Missing role: " + roleName));
    UserRole userRole = new UserRole();
    userRole.setUser(user);
    userRole.setRole(role);
    userRole.setId(new UserRoleKey(user.getId(), role.getId()));
    userRoleRepository.save(userRole);
  }

  private Cookie userCookie(User user, List<String> roles) {
    String token = jwtService.createToken(user.getEmail(), roles);
    return new Cookie(cookieName, token);
  }
}
