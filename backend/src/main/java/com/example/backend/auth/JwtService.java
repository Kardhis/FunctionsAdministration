package com.example.backend.auth;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import java.time.Instant;
import java.util.List;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final Algorithm algorithm;
  private final JWTVerifier verifier;
  private final long expiresSeconds;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.expires-seconds}") long expiresSeconds) {
    this.algorithm = Algorithm.HMAC256(secret);
    this.verifier = JWT.require(this.algorithm).build();
    this.expiresSeconds = expiresSeconds;
  }

  public String createToken(String subject) {
    return createToken(subject, List.of());
  }

  public String createToken(String subject, List<String> roles) {
    Instant now = Instant.now();
    Instant expiresAt = now.plusSeconds(expiresSeconds);

    var builder =
        JWT.create()
        .withSubject(subject)
        .withIssuedAt(Date.from(now))
        .withExpiresAt(Date.from(expiresAt));

    if (roles != null && !roles.isEmpty()) {
      builder.withClaim("roles", roles);
    }

    return builder.sign(algorithm);
  }

  public String verifyAndGetSubject(String token) throws JWTVerificationException {
    return verifier.verify(token).getSubject();
  }

  public List<String> verifyAndGetRoles(String token) throws JWTVerificationException {
    var claim = verifier.verify(token).getClaim("roles");
    if (claim == null || claim.isNull()) return List.of();
    List<String> roles = claim.asList(String.class);
    return roles == null ? List.of() : roles;
  }
}

