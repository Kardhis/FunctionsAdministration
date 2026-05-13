package com.example.backend.auth;

import java.time.Duration;
import java.security.Principal;
import java.util.Map;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import com.example.backend.users.UserRepository;
import com.example.backend.rbac.UserRoleRepository;
import jakarta.servlet.http.HttpServletRequest;

import com.example.backend.debug.AgentNdjsonLog;

@RestController
public class AuthController {

  private final JwtService jwtService;
  private final UserRepository userRepository;
  private final UserRoleRepository userRoleRepository;
  private final PasswordEncoder passwordEncoder;
  private final UserRegistrationService userRegistrationService;
  private final PasswordResetService passwordResetService;
  private final String cookieName;
  private final long expiresSeconds;
  private final boolean cookieSecure;
  private final String cookieSameSite;

  public AuthController(
      JwtService jwtService,
      UserRepository userRepository,
      UserRoleRepository userRoleRepository,
      PasswordEncoder passwordEncoder,
      UserRegistrationService userRegistrationService,
      PasswordResetService passwordResetService,
      @Value("${app.auth.cookie-name}") String cookieName,
      @Value("${app.jwt.expires-seconds}") long expiresSeconds,
      @Value("${app.auth.cookie-secure}") boolean cookieSecure,
      @Value("${app.auth.cookie-same-site}") String cookieSameSite) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
    this.passwordEncoder = passwordEncoder;
    this.userRegistrationService = userRegistrationService;
    this.passwordResetService = passwordResetService;
    this.cookieName = cookieName;
    this.expiresSeconds = expiresSeconds;
    this.cookieSecure = cookieSecure;
    this.cookieSameSite = cookieSameSite;
  }

  @PostMapping("/auth/register")
  public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
    userRegistrationService.register(req);
    return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "register_ok"));
  }

  @PostMapping("/auth/forgot-password")
  public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
    // #region agent log
    AgentNdjsonLog.append82787c(
        "pre-fix",
        "H3",
        "AuthController.forgotPassword:entry",
        "forgot-password reached controller",
        "{}");
    // #endregion agent log
    passwordResetService.requestForgotPassword(req.email());
    return ResponseEntity.ok(
        Map.of(
            "message",
            "Si el correo está registrado, recibirás un enlace para restablecer la contraseña."));
  }

  @PostMapping("/auth/reset-password")
  public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
    passwordResetService.resetPassword(req.token(), req.newPassword());
    return ResponseEntity.ok(Map.of("message", "password_reset_ok"));
  }

  @PostMapping("/auth/login")
  public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpServletRequest request) {
    // #region agent log
    AgentNdjsonLog.append82787c(
        "pre-fix",
        "H1",
        "AuthController.java:login:entry",
        "Login attempt (no secrets)",
        String.format(
            "{\"origin\":%s,\"host\":%s,\"scheme\":\"%s\",\"isSecure\":%s,\"cookieName\":\"%s\",\"cookieSecure\":%s,\"sameSite\":%s,\"expiresSeconds\":%d,\"emailDomain\":%s}",
            AgentNdjsonLog.jsonStringOrNull(request.getHeader("Origin")),
            AgentNdjsonLog.jsonStringOrNull(request.getHeader("Host")),
            AgentNdjsonLog.safe(request.getScheme()),
            request.isSecure(),
            AgentNdjsonLog.safe(cookieName),
            cookieSecure,
            AgentNdjsonLog.jsonStringOrNull(cookieSameSite),
            expiresSeconds,
            AgentNdjsonLog.jsonStringOrNull(extractDomain(req.email()))));
    // #endregion agent log

    String emailTrim = req.email().trim();
    var userOpt = userRepository.findByEmailIgnoreCase(emailTrim);
    if (userOpt.isEmpty()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "invalid_credentials"));
    }

    var user = userOpt.get();
    if (!user.isActive()) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("error", "account_inactive"));
    }

    if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "invalid_credentials"));
    }

    var roles = userRoleRepository.findRoleNamesByUserId(user.getId());
    String token = jwtService.createToken(user.getEmail().toLowerCase(), roles);

    boolean isHttps =
        request.isSecure()
            || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"))
            || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Protocol"));
    boolean secureFlag = cookieSecure && isHttps;

    ResponseCookie cookie =
        ResponseCookie.from(cookieName, token)
            .httpOnly(true)
            .secure(secureFlag)
            .path("/")
            .sameSite(cookieSameSite)
            .maxAge(Duration.ofSeconds(expiresSeconds))
            .build();

    // #region agent log
    AgentNdjsonLog.append82787c(
        "pre-fix",
        "H2",
        "AuthController.java:login:set_cookie",
        "Login OK, setting cookie",
        String.format(
            "{\"setCookieHasSecure\":%s,\"configuredCookieSecure\":%s,\"isHttps\":%s,\"sameSite\":%s,\"maxAgeSeconds\":%d,\"setCookieHeaderLength\":%d}",
            secureFlag,
            cookieSecure,
            isHttps,
            AgentNdjsonLog.jsonStringOrNull(cookieSameSite),
            expiresSeconds,
            cookie.toString().length()));
    // #endregion agent log

    return ResponseEntity.ok()
        .header("Set-Cookie", cookie.toString())
        .body(Map.of("message", "login_ok"));
  }

  @GetMapping("/auth/me")
  public Map<String, Object> me(Principal principal) {
    String email = principal.getName();
    var u = userRepository.findByEmailIgnoreCase(email).orElse(null);
    var roles = (u == null) ? java.util.List.of() : userRoleRepository.findRoleNamesByUserId(u.getId());
    return Map.of("user", email, "roles", roles);
  }

  @PostMapping("/auth/logout")
  public ResponseEntity<?> logout(HttpServletRequest request) {
    boolean isHttps =
        request.isSecure()
            || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"))
            || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Protocol"));
    boolean secureFlag = cookieSecure && isHttps;
    ResponseCookie cookie =
        ResponseCookie.from(cookieName, "")
            .httpOnly(true)
            .secure(secureFlag)
            .path("/")
            .sameSite(cookieSameSite)
            .maxAge(Duration.ZERO)
            .build();

    return ResponseEntity.ok()
        .header("Set-Cookie", cookie.toString())
        .body(Map.of("message", "logout_ok"));
  }

  private static String extractDomain(String email) {
    if (email == null) return null;
    String trimmed = email.trim();
    int at = trimmed.lastIndexOf('@');
    if (at < 0 || at == trimmed.length() - 1) return null;
    return trimmed.substring(at + 1).toLowerCase();
  }
}

