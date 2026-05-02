package com.example.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

  private static final String SECRET =
      "unit-test-secret-must-be-at-least-256-bits-for-hs256-safety-pad";

  @Test
  void createsTokenWithSubjectAndRoles() {
    JwtService jwt = new JwtService(SECRET, 3600);
    String token = jwt.createToken("user@example.com", List.of("USER", "ADMIN"));
    assertEquals("user@example.com", jwt.verifyAndGetSubject(token));
    List<String> roles = jwt.verifyAndGetRoles(token);
    assertTrue(roles.contains("USER"));
    assertTrue(roles.contains("ADMIN"));
  }
}
