package com.example.backend.support;

import com.example.backend.users.User;
import java.lang.reflect.Field;
import java.security.Principal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public final class ControllerTestSupport {

  private ControllerTestSupport() {}

  public static User userWithId(long id, String email) {
    User user = TestUserFactory.activeUser(email, "hash");
    setField(user, "id", id);
    return user;
  }

  public static Principal principal(String email) {
    return () -> email;
  }

  public static Instant fixedInstant() {
    return Instant.parse("2026-01-15T10:00:00Z");
  }

  public static LocalDate fixedDate() {
    return LocalDate.of(2026, 1, 15);
  }

  public static LocalTime fixedTime(int hour, int minute) {
    return LocalTime.of(hour, minute);
  }

  private static void setField(Object target, String fieldName, Object value) {
    try {
      Field field = target.getClass().getDeclaredField(fieldName);
      field.setAccessible(true);
      field.set(target, value);
    } catch (ReflectiveOperationException e) {
      throw new IllegalStateException("Failed to set field " + fieldName, e);
    }
  }
}
