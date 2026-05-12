package com.example.backend.auth;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.mockito.Mockito.mock;

import com.example.backend.users.User;
import com.example.backend.users.UserRepository;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.time.Instant;
import java.util.Optional;
import java.util.Properties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

  static final String PEPPER = "unit-test-pepper-32-chars-minimum!!";

  @Mock UserRepository userRepository;
  @Mock PasswordResetTokenRepository tokenRepository;
  @Mock PasswordEncoder passwordEncoder;
  @Mock ObjectProvider<JavaMailSender> mailSenderProvider;
  @Mock JavaMailSender javaMailSender;

  PasswordResetService service;

  @BeforeEach
  void setUp() {
    service =
        new PasswordResetService(
            userRepository,
            tokenRepository,
            passwordEncoder,
            mailSenderProvider,
            PEPPER,
            "http://localhost:5173",
            3600L,
            "",
            "",
            "Reset subject");
  }

  @Test
  void requestForgotCreatesTokenAndSendsMailWhenUserExists() throws Exception {
    when(mailSenderProvider.getIfAvailable()).thenReturn(javaMailSender);
    User user = mock(User.class);
    when(user.getId()).thenReturn(9L);
    when(user.getEmail()).thenReturn("u@example.com");
    when(userRepository.findByEmailIgnoreCase("u@example.com")).thenReturn(Optional.of(user));
    MimeMessage msg = new MimeMessage(Session.getDefaultInstance(new Properties()));
    when(javaMailSender.createMimeMessage()).thenReturn(msg);
    doNothing().when(javaMailSender).send(any(MimeMessage.class));

    service.requestForgotPassword("u@example.com");

    verify(tokenRepository).deleteUnusedByUserId(9L);
    ArgumentCaptor<PasswordResetToken> cap = ArgumentCaptor.forClass(PasswordResetToken.class);
    verify(tokenRepository).save(cap.capture());
    PasswordResetToken saved = cap.getValue();
    org.assertj.core.api.Assertions.assertThat(saved.getTokenHash()).hasSize(64);
    org.assertj.core.api.Assertions.assertThat(saved.getUser()).isSameAs(user);
    org.assertj.core.api.Assertions.assertThat(saved.getUsedAt()).isNull();
    org.assertj.core.api.Assertions.assertThat(saved.getExpiresAt()).isAfter(Instant.now());
    verify(javaMailSender).send(msg);
  }

  @Test
  void requestForgotDoesNothingWhenNoUser() {
    when(userRepository.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());

    service.requestForgotPassword("missing@example.com");

    verify(tokenRepository, never()).save(any());
  }

  @Test
  void resetPasswordUpdatesUserAndMarksTokenUsed() {
    User user = new User();
    user.setPasswordHash("OLD");
    String raw = "one-time-token";
    String hash = TokenHashing.sha256Hex(PEPPER, raw);
    PasswordResetToken row = new PasswordResetToken();
    row.setUser(user);
    row.setTokenHash(hash);
    row.setExpiresAt(Instant.now().plusSeconds(600));
    row.setUsedAt(null);
    when(tokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(row));
    when(passwordEncoder.encode("newsecret12")).thenReturn("NEW_HASH");

    service.resetPassword(raw, "newsecret12");

    org.assertj.core.api.Assertions.assertThat(user.getPasswordHash()).isEqualTo("NEW_HASH");
    org.assertj.core.api.Assertions.assertThat(row.getUsedAt()).isNotNull();
    verify(userRepository).save(user);
    verify(tokenRepository).save(row);
  }

  @Test
  void resetPasswordRejectsUnknownToken() {
    when(tokenRepository.findByTokenHash(any())).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.resetPassword("nope", "newsecret12"))
        .isInstanceOf(ResponseStatusException.class)
        .extracting(ex -> ((ResponseStatusException) ex).getStatusCode().value())
        .isEqualTo(HttpStatus.BAD_REQUEST.value());
  }
}
