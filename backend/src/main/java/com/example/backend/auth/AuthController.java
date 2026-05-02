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
  public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
    var userOpt = userRepository.findByEmailIgnoreCase(req.email().trim());
    if (userOpt.isEmpty() || !userOpt.get().isActive()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "invalid_credentials"));
    }

    var user = userOpt.get();
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
}

