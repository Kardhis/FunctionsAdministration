package com.example.backend.auth;

import com.example.backend.users.User;
import com.example.backend.users.UserRepository;
import jakarta.mail.internet.MimeMessage;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PasswordResetService {

  private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

  private final UserRepository userRepository;
  private final PasswordResetTokenRepository tokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final ObjectProvider<JavaMailSender> mailSenderProvider;
  private final String tokenPepper;
  private final String frontendBaseUrl;
  private final long tokenValiditySeconds;
  private final String mailFrom;
  private final String mailSubject;

  private final SecureRandom secureRandom = new SecureRandom();

  public PasswordResetService(
      UserRepository userRepository,
      PasswordResetTokenRepository tokenRepository,
      PasswordEncoder passwordEncoder,
      ObjectProvider<JavaMailSender> mailSenderProvider,
      @Value("${app.jwt.secret}") String tokenPepper,
      @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl,
      @Value("${app.password-reset.token-validity-seconds:3600}") long tokenValiditySeconds,
      @Value("${spring.mail.username:}") String mailFromUsername,
      @Value("${app.password-reset.mail-from:}") String mailFromOverride,
      @Value("${app.password-reset.mail-subject:Recuperación de contraseña}") String mailSubject) {
    this.userRepository = userRepository;
    this.tokenRepository = tokenRepository;
    this.passwordEncoder = passwordEncoder;
    this.mailSenderProvider = mailSenderProvider;
    this.tokenPepper = tokenPepper;
    this.frontendBaseUrl = stripTrailingSlash(frontendBaseUrl);
    this.tokenValiditySeconds = tokenValiditySeconds;
    this.mailFrom =
        mailFromOverride != null && !mailFromOverride.isBlank()
            ? mailFromOverride.trim()
            : (mailFromUsername != null && !mailFromUsername.isBlank() ? mailFromUsername.trim() : "no-reply@localhost");
    this.mailSubject = mailSubject;
  }

  @Transactional
  public void requestForgotPassword(String emailRaw) {
    String email = emailRaw.trim().toLowerCase();
    Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
    if (userOpt.isEmpty()) {
      return;
    }
    JavaMailSender senderBean = mailSenderProvider.getIfAvailable();
    if (senderBean == null) {
      log.warn("Password reset skipped: JavaMailSender not configured (set spring.mail.host).");
      return;
    }

    User user = userOpt.get();
    tokenRepository.deleteUnusedByUserId(user.getId());

    byte[] raw = new byte[32];
    secureRandom.nextBytes(raw);
    String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
    String tokenHash = TokenHashing.sha256Hex(tokenPepper, rawToken);

    Instant now = Instant.now();
    PasswordResetToken entity = new PasswordResetToken();
    entity.setUser(user);
    entity.setTokenHash(tokenHash);
    entity.setExpiresAt(now.plusSeconds(tokenValiditySeconds));
    entity.setUsedAt(null);
    entity.setCreatedAt(now);
    tokenRepository.save(entity);

    String link = frontendBaseUrl + "/reset-password?token=" + encodeQueryParam(rawToken);
    sendEmail(user.getEmail(), link);
  }

  @Transactional
  public void resetPassword(String rawToken, String newPassword) {
    if (rawToken == null || rawToken.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid_reset_token");
    }
    String tokenHash = TokenHashing.sha256Hex(tokenPepper, rawToken.trim());
    PasswordResetToken row =
        tokenRepository
            .findByTokenHash(tokenHash)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid_reset_token"));

    if (row.getUsedAt() != null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid_reset_token");
    }
    if (row.getExpiresAt().isBefore(Instant.now())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "reset_token_expired");
    }

    User user = row.getUser();
    user.setPasswordHash(passwordEncoder.encode(newPassword));
    user.setUpdatedAt(Instant.now());
    userRepository.save(user);

    row.setUsedAt(Instant.now());
    tokenRepository.save(row);
  }

  private void sendEmail(String to, String resetLink) {
    try {
      JavaMailSender sender = mailSenderProvider.getIfAvailable();
      if (sender == null) {
        throw new IllegalStateException("JavaMailSender not available");
      }
      MimeMessage message = sender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
      helper.setFrom(mailFrom);
      helper.setTo(to);
      helper.setSubject(mailSubject);
      helper.setText(
          "Has solicitado restablecer tu contraseña.\n\n"
              + "Abre este enlace (válido por un tiempo limitado):\n"
              + resetLink
              + "\n\n"
              + "Si no fuiste tú, ignora este mensaje.\n",
          false);
      sender.send(message);
    } catch (Exception e) {
      log.error("Failed to send password reset email to {}", to, e);
      throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "mail_send_failed");
    }
  }

  private static String stripTrailingSlash(String url) {
    if (url == null || url.isBlank()) {
      return "http://localhost:5173";
    }
    String s = url.trim();
    while (s.endsWith("/")) {
      s = s.substring(0, s.length() - 1);
    }
    return s;
  }

  private static String encodeQueryParam(String rawToken) {
    return java.net.URLEncoder.encode(rawToken, java.nio.charset.StandardCharsets.UTF_8);
  }
}
