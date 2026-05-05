package com.example.backend.auth;

import java.time.Duration;
import java.security.Principal;
import java.util.Map;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
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

@RestController
public class AuthController {

  private final JwtService jwtService;
  private final UserRepository userRepository;
  private final UserRoleRepository userRoleRepository;
  private final PasswordEncoder passwordEncoder;
  private final String cookieName;
  private final long expiresSeconds;
  private final boolean cookieSecure;
  private final String cookieSameSite;

  public AuthController(
      JwtService jwtService,
      UserRepository userRepository,
      UserRoleRepository userRoleRepository,
      PasswordEncoder passwordEncoder,
      @Value("${app.auth.cookie-name}") String cookieName,
      @Value("${app.jwt.expires-seconds}") long expiresSeconds,
      @Value("${app.auth.cookie-secure}") boolean cookieSecure,
      @Value("${app.auth.cookie-same-site}") String cookieSameSite) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
    this.passwordEncoder = passwordEncoder;
    this.cookieName = cookieName;
    this.expiresSeconds = expiresSeconds;
    this.cookieSecure = cookieSecure;
    this.cookieSameSite = cookieSameSite;
  }

  @PostMapping("/auth/login")
  public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpServletRequest request) {
    // #region agent log
    agentLog(
        "pre-fix",
        "H1",
        "AuthController.java:login:entry",
        "Login attempt (no secrets)",
        String.format(
            "{\"origin\":%s,\"host\":%s,\"scheme\":\"%s\",\"isSecure\":%s,\"cookieName\":\"%s\",\"cookieSecure\":%s,\"sameSite\":%s,\"expiresSeconds\":%d,\"emailDomain\":%s}",
            jsonStringOrNull(request.getHeader("Origin")),
            jsonStringOrNull(request.getHeader("Host")),
            safe(request.getScheme()),
            request.isSecure(),
            safe(cookieName),
            cookieSecure,
            jsonStringOrNull(cookieSameSite),
            expiresSeconds,
            jsonStringOrNull(extractDomain(req.email()))));
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

    ResponseCookie cookie =
        ResponseCookie.from(cookieName, token)
            .httpOnly(true)
            .secure(cookieSecure)
            .path("/")
            .sameSite(cookieSameSite)
            .maxAge(Duration.ofSeconds(expiresSeconds))
            .build();

    // #region agent log
    agentLog(
        "pre-fix",
        "H2",
        "AuthController.java:login:set_cookie",
        "Login OK, setting cookie",
        String.format(
            "{\"setCookieHasSecure\":%s,\"sameSite\":%s,\"maxAgeSeconds\":%d,\"setCookieHeaderLength\":%d}",
            cookieSecure,
            jsonStringOrNull(cookieSameSite),
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
  public ResponseEntity<?> logout() {
    ResponseCookie cookie =
        ResponseCookie.from(cookieName, "")
            .httpOnly(true)
            .secure(cookieSecure)
            .path("/")
            .sameSite(cookieSameSite)
            .maxAge(Duration.ZERO)
            .build();

    return ResponseEntity.ok()
        .header("Set-Cookie", cookie.toString())
        .body(Map.of("message", "logout_ok"));
  }

  private static void agentLog(
      String runId, String hypothesisId, String location, String message, String dataJsonObject) {
    try {
      String line =
          String.format(
              "{\"sessionId\":\"16e790\",\"runId\":%s,\"hypothesisId\":%s,\"location\":%s,\"message\":%s,\"data\":%s,\"timestamp\":%d}%n",
              jsonStringOrNull(runId),
              jsonStringOrNull(hypothesisId),
              jsonStringOrNull(location),
              jsonStringOrNull(message),
              (dataJsonObject == null || dataJsonObject.isBlank()) ? "{}" : dataJsonObject,
              System.currentTimeMillis());
      Files.writeString(
          Path.of("debug-16e790.log"),
          line,
          StandardOpenOption.CREATE,
          StandardOpenOption.WRITE,
          StandardOpenOption.APPEND);
    } catch (Exception ignored) {
      // swallow
    }
  }

  private static String safe(String s) {
    return s == null ? "" : s;
  }

  private static String jsonEscape(String s) {
    if (s == null) return "";
    return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
  }

  private static String jsonStringOrNull(String s) {
    if (s == null) return "null";
    return "\"" + jsonEscape(s) + "\"";
  }

  private static String extractDomain(String email) {
    if (email == null) return null;
    String trimmed = email.trim();
    int at = trimmed.lastIndexOf('@');
    if (at < 0 || at == trimmed.length() - 1) return null;
    return trimmed.substring(at + 1).toLowerCase();
  }
}

