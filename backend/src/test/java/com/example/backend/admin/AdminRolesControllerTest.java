package com.example.backend.admin;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.rbac.Role;
import com.example.backend.rbac.RoleRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class AdminRolesControllerTest {

  @Mock RoleRepository roleRepository;

  MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders.standaloneSetup(new AdminRolesController(roleRepository)).build();
  }

  @Test
  void listReturnsSortedRoleNames() throws Exception {
    when(roleRepository.findAll()).thenReturn(List.of(role("USER"), role("ADMIN")));

    mockMvc
        .perform(get("/api/admin/roles").with(user("admin@example.com").roles("ADMIN")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0]").value("ADMIN"))
        .andExpect(jsonPath("$[1]").value("USER"));
  }

  private static Role role(String name) {
    Role role = new Role();
    role.setName(name);
    return role;
  }
}
