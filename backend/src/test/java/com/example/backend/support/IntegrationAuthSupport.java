package com.example.backend.support;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.auth.JwtService;
import com.example.backend.rbac.Role;
import com.example.backend.rbac.RoleRepository;
import com.example.backend.rbac.UserRole;
import com.example.backend.rbac.UserRoleKey;
import com.example.backend.rbac.UserRoleRepository;
import com.example.backend.users.User;
import com.example.backend.users.UserRepository;
import jakarta.servlet.http.Cookie;
import java.util.List;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

public final class IntegrationAuthSupport {

  private IntegrationAuthSupport() {}

  public static String uniqueEmail(String prefix) {
    return prefix + "-" + UUID.randomUUID() + "@example.com";
  }

  public static void register(MockMvc mockMvc, String email, String password, String displayName)
      throws Exception {
    mockMvc
        .perform(
            post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"email\":\""
                        + email
                        + "\",\"password\":\""
                        + password
                        + "\",\"displayName\":\""
                        + displayName
                        + "\"}"))
        .andExpect(status().isCreated());
  }

  public static Cookie login(MockMvc mockMvc, String cookieName, String email, String password)
      throws Exception {
    MvcResult result =
        mockMvc
            .perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
            .andExpect(status().isOk())
            .andReturn();

    Cookie cookie = result.getResponse().getCookie(cookieName);
    if (cookie == null) {
      throw new IllegalStateException("Auth cookie not set: " + cookieName);
    }
    return cookie;
  }

  public static Cookie registerAndLogin(
      MockMvc mockMvc, String cookieName, String emailPrefix, String password) throws Exception {
    String email = uniqueEmail(emailPrefix);
    register(mockMvc, email, password, "Integration User");
    return login(mockMvc, cookieName, email, password);
  }

  public static Cookie adminCookie(
      UserRepository userRepository,
      RoleRepository roleRepository,
      UserRoleRepository userRoleRepository,
      JwtService jwtService,
      String cookieName) {
    String email = uniqueEmail("admin-it");
    User admin = userRepository.save(TestUserFactory.activeUser(email, "unused-hash"));
    Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
    UserRole userRole = new UserRole();
    userRole.setUser(admin);
    userRole.setRole(adminRole);
    userRole.setId(new UserRoleKey(admin.getId(), adminRole.getId()));
    userRoleRepository.save(userRole);

    String token = jwtService.createToken(admin.getEmail(), List.of("ADMIN"));
    return new Cookie(cookieName, token);
  }

  public static String extractJsonNumber(String json, String fieldPrefix) {
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
