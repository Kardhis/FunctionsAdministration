package com.example.backend.support;

import com.example.backend.users.User;
import java.time.Instant;

public final class TestUserFactory {

  private TestUserFactory() {}

  public static User activeUser(String email, String passwordHash) {
    User user = new User();
    user.setEmail(email);
    user.setPasswordHash(passwordHash);
    user.setActive(true);
    user.setCreatedAt(Instant.now());
    user.setUpdatedAt(Instant.now());
    return user;
  }
}
