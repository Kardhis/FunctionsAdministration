package com.example.backend.admin;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.api.ApiExceptionHandler;
import com.example.backend.rbac.Role;
import com.example.backend.rbac.RoleRepository;
import com.example.backend.rbac.UserRoleRepository;
import com.example.backend.support.ControllerTestSupport;
import com.example.backend.users.User;
import com.example.backend.users.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class AdminUsersControllerTest {

  @Mock UserRepository userRepository;
  @Mock RoleRepository roleRepository;
  @Mock UserRoleRepository userRoleRepository;
  @Mock PasswordEncoder passwordEncoder;

  MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(
                new AdminUsersController(
                    userRepository, roleRepository, userRoleRepository, passwordEncoder))
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
  }

  @Test
  void listReturnsUsersWithRoles() throws Exception {
    User user = sampleUser(1L, "admin@example.com");
    when(userRepository.findAll()).thenReturn(List.of(user));
    when(userRoleRepository.findRoleNamesByUserId(1L)).thenReturn(List.of("ADMIN"));

    mockMvc
        .perform(get("/api/admin/users").with(user("admin@example.com").roles("ADMIN")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].email").value("admin@example.com"))
        .andExpect(jsonPath("$[0].roles[0]").value("ADMIN"));
  }

  @Test
  void createReturnsCreatedUser() throws Exception {
    when(userRepository.findByEmailIgnoreCase("new@example.com")).thenReturn(Optional.empty());
    when(passwordEncoder.encode("secret123")).thenReturn("ENC");
    Role userRole = org.mockito.Mockito.mock(Role.class);
    when(userRole.getId()).thenReturn(2L);
    when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));
    when(userRepository.save(any(User.class))).thenAnswer(inv -> {
      User saved = inv.getArgument(0);
      return sampleUser(42L, saved.getEmail());
    });
    when(userRoleRepository.findRoleNamesByUserId(42L)).thenReturn(List.of("USER"));

    mockMvc
        .perform(
            post("/api/admin/users")
                .with(user("admin@example.com").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "email":"new@example.com",
                      "password":"secret123",
                      "displayName":"New User",
                      "active":true
                    }
                    """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.email").value("new@example.com"))
        .andExpect(jsonPath("$.roles[0]").value("USER"));
  }

  @Test
  void createRejectsDuplicateEmail() throws Exception {
    when(userRepository.findByEmailIgnoreCase("exists@example.com"))
        .thenReturn(Optional.of(sampleUser(1L, "exists@example.com")));

    mockMvc
        .perform(
            post("/api/admin/users")
                .with(user("admin@example.com").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"exists@example.com\",\"password\":\"secret123\"}"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.error").value("email_exists"));
  }

  @Test
  void updateStatusRequiresActiveFlag() throws Exception {
    mockMvc
        .perform(
            put("/api/admin/users/1/status")
                .with(user("admin@example.com").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("active_required"));
  }

  @Test
  void deleteReturnsNoContent() throws Exception {
    User existing = sampleUser(1L, "delete@example.com");
    when(userRepository.findById(1L)).thenReturn(Optional.of(existing));

    mockMvc
        .perform(delete("/api/admin/users/1").with(user("admin@example.com").roles("ADMIN")))
        .andExpect(status().isNoContent());

    verify(userRepository).delete(existing);
  }

  private static User sampleUser(long id, String email) {
    User user = ControllerTestSupport.userWithId(id, email);
    user.setDisplayName("Display");
    user.setCreatedAt(ControllerTestSupport.fixedInstant());
    user.setUpdatedAt(ControllerTestSupport.fixedInstant());
    return user;
  }
}
