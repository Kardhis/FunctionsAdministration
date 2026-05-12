package com.example.backend.auth;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.backend.rbac.Role;
import com.example.backend.rbac.RoleRepository;
import com.example.backend.rbac.UserRoleRepository;
import com.example.backend.users.User;
import com.example.backend.users.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class UserRegistrationServiceTest {

  @Mock UserRepository userRepository;
  @Mock RoleRepository roleRepository;
  @Mock UserRoleRepository userRoleRepository;
  @Mock PasswordEncoder passwordEncoder;

  UserRegistrationService service;

  @BeforeEach
  void setUp() {
    service = new UserRegistrationService(userRepository, roleRepository, userRoleRepository, passwordEncoder);
  }

  @Test
  void registerConflictWhenEmailExists() {
    when(userRepository.findByEmailIgnoreCase("x@y.com")).thenReturn(Optional.of(new User()));

    assertThatThrownBy(() -> service.register(new RegisterRequest("x@y.com", "password12", null)))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getStatusCode().value())
        .isEqualTo(HttpStatus.CONFLICT.value());
  }

  @Test
  void registerSavesUserAndRole() {
    when(userRepository.findByEmailIgnoreCase("new@y.com")).thenReturn(Optional.empty());
    when(passwordEncoder.encode("password12")).thenReturn("ENC");
    Role userRole = org.mockito.Mockito.mock(Role.class);
    when(userRole.getId()).thenReturn(2L);
    when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));
    when(userRepository.save(any(User.class)))
        .thenAnswer(
            inv -> {
              User saved = org.mockito.Mockito.mock(User.class);
              when(saved.getId()).thenReturn(42L);
              return saved;
            });

    service.register(new RegisterRequest("new@y.com", "password12", "Nick"));

    ArgumentCaptor<User> userCap = ArgumentCaptor.forClass(User.class);
    verify(userRepository).save(userCap.capture());
    User saved = userCap.getValue();
    org.assertj.core.api.Assertions.assertThat(saved.getEmail()).isEqualTo("new@y.com");
    org.assertj.core.api.Assertions.assertThat(saved.getPasswordHash()).isEqualTo("ENC");
    org.assertj.core.api.Assertions.assertThat(saved.isActive()).isTrue();
    org.assertj.core.api.Assertions.assertThat(saved.getDisplayName()).isEqualTo("Nick");

    verify(userRoleRepository).save(any());
  }
}
