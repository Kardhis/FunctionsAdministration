package com.example.backend.auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.api.ApiExceptionHandler;
import com.example.backend.rbac.UserRoleRepository;
import com.example.backend.users.UserRepository;
import com.example.backend.users.User;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class AuthControllerAuthEndpointsTest {

  @Mock JwtService jwtService;
  @Mock UserRepository userRepository;
  @Mock UserRoleRepository userRoleRepository;
  @Mock PasswordEncoder passwordEncoder;
  @Mock UserRegistrationService userRegistrationService;
  @Mock PasswordResetService passwordResetService;

  MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    AuthController controller =
        new AuthController(
            jwtService,
            userRepository,
            userRoleRepository,
            passwordEncoder,
            userRegistrationService,
            passwordResetService,
            "access_token",
            3600L,
            false,
            "Lax");
    mockMvc =
        MockMvcBuilders.standaloneSetup(controller)
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
  }

  @Test
  void registerReturnsCreated() throws Exception {
    doNothing().when(userRegistrationService).register(any(RegisterRequest.class));

    mockMvc
        .perform(
            post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"new@example.com\",\"password\":\"secret123\"}"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.message").value("register_ok"));

    verify(userRegistrationService).register(any(RegisterRequest.class));
  }

  @Test
  void forgotPasswordAlwaysOk() throws Exception {
    mockMvc
        .perform(
            post("/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"any@example.com\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").exists());

    verify(passwordResetService).requestForgotPassword("any@example.com");
  }

  @Test
  void resetPasswordDelegates() throws Exception {
    doNothing().when(passwordResetService).resetPassword(anyString(), anyString());

    mockMvc
        .perform(
            post("/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"raw-token\",\"newPassword\":\"newsecret12\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("password_reset_ok"));

    verify(passwordResetService).resetPassword("raw-token", "newsecret12");
  }

  @Test
  void loginStillWorksWhenUserValid() throws Exception {
    User u = mock(User.class);
    when(u.getId()).thenReturn(1L);
    when(u.getEmail()).thenReturn("a@b.com");
    when(u.getPasswordHash()).thenReturn("hash");
    when(u.isActive()).thenReturn(true);
    when(userRepository.findByEmailIgnoreCase("a@b.com")).thenReturn(Optional.of(u));
    when(passwordEncoder.matches("pw", "hash")).thenReturn(true);
    when(userRoleRepository.findRoleNamesByUserId(1L)).thenReturn(java.util.List.of("USER"));
    when(jwtService.createToken(anyString(), any())).thenReturn("jwt");

    mockMvc
        .perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"a@b.com\",\"password\":\"pw\"}"))
        .andExpect(status().isOk());

    verify(userRegistrationService, never()).register(any());
  }

  @Test
  void loginRejectsUnknownUser() throws Exception {
    when(userRepository.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());

    mockMvc
        .perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"missing@example.com\",\"password\":\"password12\"}"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.error").value("invalid_credentials"));

    verify(passwordEncoder, never()).matches(anyString(), anyString());
  }

  @Test
  void loginRejectsWrongPassword() throws Exception {
    User u = mock(User.class);
    when(u.isActive()).thenReturn(true);
    when(u.getPasswordHash()).thenReturn("hash");
    when(userRepository.findByEmailIgnoreCase("a@b.com")).thenReturn(Optional.of(u));
    when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

    mockMvc
        .perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"a@b.com\",\"password\":\"wrong\"}"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.error").value("invalid_credentials"));

    verify(jwtService, never()).createToken(anyString(), any());
  }

  @Test
  void loginRejectsInactiveUser() throws Exception {
    User u = mock(User.class);
    when(userRepository.findByEmailIgnoreCase("inactive@example.com")).thenReturn(Optional.of(u));

    mockMvc
        .perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"inactive@example.com\",\"password\":\"password12\"}"))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.error").value("account_inactive"));

    verify(jwtService, never()).createToken(anyString(), any());
  }

  @Test
  void meReturnsUserAndRefreshesCookie() throws Exception {
    User u = mock(User.class);
    when(u.getId()).thenReturn(1L);
    when(u.getEmail()).thenReturn("a@b.com");
    when(u.isActive()).thenReturn(true);
    when(userRepository.findByEmailIgnoreCase("a@b.com")).thenReturn(Optional.of(u));
    when(userRoleRepository.findRoleNamesByUserId(1L)).thenReturn(java.util.List.of("USER"));
    when(jwtService.createToken("a@b.com", java.util.List.of("USER"))).thenReturn("fresh-jwt");

    mockMvc
        .perform(
            get("/auth/me")
                .principal(new UsernamePasswordAuthenticationToken("a@b.com", null)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user").value("a@b.com"))
        .andExpect(jsonPath("$.roles[0]").value("USER"))
        .andExpect(header().string("Set-Cookie", containsString("access_token=fresh-jwt")));
  }

  @Test
  void logoutClearsCookie() throws Exception {
    mockMvc
        .perform(post("/auth/logout"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("logout_ok"))
        .andExpect(header().string("Set-Cookie", containsString("access_token=")))
        .andExpect(header().string("Set-Cookie", containsString("Max-Age=0")));
  }
}
