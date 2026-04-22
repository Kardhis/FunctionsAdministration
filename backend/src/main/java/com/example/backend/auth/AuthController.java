package com.example.backend.auth;

import java.time.Duration;
import java.security.Principal;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

  private final JwtService jwtService;
  private final String cookieName;
  private final long expiresSeconds;
  private final boolean cookieSecure;
  private final String cookieSameSite;

  public AuthController(
      JwtService jwtService,
      @Value("${app.auth.cookie-name}") String cookieName,
      @Value("${app.jwt.expires-seconds}") long expiresSeconds,
      @Value("${app.auth.cookie-secure}") boolean cookieSecure,
      @Value("${app.auth.cookie-same-site}") String cookieSameSite) {
    this.jwtService = jwtService;
    this.cookieName = cookieName;
    this.expiresSeconds = expiresSeconds;
    this.cookieSecure = cookieSecure;
    this.cookieSameSite = cookieSameSite;
  }

  @PostMapping("/auth/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    if (req == null || req.email() == null || req.password() == null) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", "email_and_password_required"));
    }

    // Phase 1: simple hardcoded credentials (didactic)
    boolean ok =
        "demo@example.com".equalsIgnoreCase(req.email()) && "password".equals(req.password());

    if (!ok) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "invalid_credentials"));
    }

    String token = jwtService.createToken(req.email().toLowerCase());

    ResponseCookie cookie =
        ResponseCookie.from(cookieName, token)
            .httpOnly(true)
            .secure(cookieSecure)
            .path("/")
            .sameSite(cookieSameSite)
            .maxAge(Duration.ofSeconds(expiresSeconds))
            .build();

    return ResponseEntity.ok()
        .header("Set-Cookie", cookie.toString())
        .body(Map.of("message", "login_ok"));
  }

  @GetMapping("/auth/me")
  public Map<String, String> me(Principal principal) {
    return Map.of("user", principal.getName());
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
}

