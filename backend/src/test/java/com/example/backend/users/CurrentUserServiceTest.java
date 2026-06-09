package com.example.backend.users;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.example.backend.support.TestUserFactory;
import java.security.Principal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class CurrentUserServiceTest {

  @Mock UserRepository userRepository;

  CurrentUserService service;

  @BeforeEach
  void setUp() {
    service = new CurrentUserService(userRepository);
  }

  @Test
  void requireUserRejectsNullPrincipal() {
    assertThatThrownBy(() -> service.requireUser(null))
        .isInstanceOf(ResponseStatusException.class)
        .satisfies(
            ex ->
                assertThat(((ResponseStatusException) ex).getStatusCode().value())
                    .isEqualTo(HttpStatus.UNAUTHORIZED.value()));
  }

  @Test
  void requireUserRejectsBlankPrincipalName() {
    Principal principal = mock(Principal.class);
    when(principal.getName()).thenReturn("   ");

    assertThatThrownBy(() -> service.requireUser(principal))
        .isInstanceOf(ResponseStatusException.class)
        .satisfies(
            ex ->
                assertThat(((ResponseStatusException) ex).getStatusCode().value())
                    .isEqualTo(HttpStatus.UNAUTHORIZED.value()));
  }

  @Test
  void requireUserRejectsWhenUserNotFound() {
    Principal principal = mock(Principal.class);
    when(principal.getName()).thenReturn("missing@example.com");
    when(userRepository.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.requireUser(principal))
        .isInstanceOf(ResponseStatusException.class)
        .satisfies(
            ex ->
                assertThat(((ResponseStatusException) ex).getStatusCode().value())
                    .isEqualTo(HttpStatus.UNAUTHORIZED.value()));
  }

  @Test
  void requireUserRejectsInactiveUser() {
    Principal principal = mock(Principal.class);
    when(principal.getName()).thenReturn("inactive@example.com");
    User inactive = TestUserFactory.activeUser("inactive@example.com", "hash");
    inactive.setActive(false);
    when(userRepository.findByEmailIgnoreCase("inactive@example.com"))
        .thenReturn(Optional.of(inactive));

    assertThatThrownBy(() -> service.requireUser(principal))
        .isInstanceOf(ResponseStatusException.class)
        .satisfies(
            ex ->
                assertThat(((ResponseStatusException) ex).getStatusCode().value())
                    .isEqualTo(HttpStatus.UNAUTHORIZED.value()));
  }

  @Test
  void requireUserReturnsActiveUser() {
    Principal principal = mock(Principal.class);
    when(principal.getName()).thenReturn("active@example.com");
    User active = TestUserFactory.activeUser("active@example.com", "hash");
    when(userRepository.findByEmailIgnoreCase("active@example.com"))
        .thenReturn(Optional.of(active));

    User result = service.requireUser(principal);

    assertThat(result).isSameAs(active);
  }
}
