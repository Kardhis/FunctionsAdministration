package com.example.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

  private static final String SECRET =
      "unit-test-secret-must-be-at-least-256-bits-for-hs256-safety-pad";

  @Test
  void createsTokenWithSubjectAndRoles() {
    JwtService jwt = new JwtService(SECRET, 3600);
    String token = jwt.createToken("user@example.com", List.of("USER", "ADMIN"));
    assertThat(jwt.verifyAndGetSubject(token)).isEqualTo("user@example.com");
    assertThat(jwt.verifyAndGetRoles(token)).containsExactlyInAnyOrder("USER", "ADMIN");
  }

  @Test
  void shouldRejectExpiredToken() {
    JwtService jwt = new JwtService(SECRET, 3600);
    String expired =
        JWT.create()
            .withSubject("user@example.com")
            .withExpiresAt(Date.from(Instant.now().minusSeconds(120)))
            .sign(Algorithm.HMAC256(SECRET));

    assertThatThrownBy(() -> jwt.verifyAndGetSubject(expired))
        .isInstanceOf(JWTVerificationException.class);
    assertThatThrownBy(() -> jwt.verifyAndGetRoles(expired))
        .isInstanceOf(JWTVerificationException.class);
  }

  @Test
  void shouldRejectInvalidToken() {
    JwtService jwt = new JwtService(SECRET, 3600);

    assertThatThrownBy(() -> jwt.verifyAndGetSubject("not.a.valid.jwt"))
        .isInstanceOf(JWTVerificationException.class);
    assertThatThrownBy(() -> jwt.verifyAndGetRoles(""))
        .isInstanceOf(JWTVerificationException.class);
  }

  @Test
  void shouldReturnEmptyRolesWhenTokenHasNoRolesClaim() {
    JwtService jwt = new JwtService(SECRET, 3600);
    String token = jwt.createToken("user@example.com", List.of());

    assertThat(jwt.verifyAndGetSubject(token)).isEqualTo("user@example.com");
    assertThat(jwt.verifyAndGetRoles(token)).isEmpty();
  }
}
