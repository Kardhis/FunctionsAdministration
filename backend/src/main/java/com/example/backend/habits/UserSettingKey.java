package com.example.backend.habits;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserSettingKey implements Serializable {

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "setting_key", nullable = false, length = 64)
  private String settingKey;

  public UserSettingKey() {}

  public UserSettingKey(Long userId, String settingKey) {
    this.userId = userId;
    this.settingKey = settingKey;
  }

  public Long getUserId() {
    return userId;
  }

  public String getSettingKey() {
    return settingKey;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    UserSettingKey that = (UserSettingKey) o;
    return Objects.equals(userId, that.userId) && Objects.equals(settingKey, that.settingKey);
  }

  @Override
  public int hashCode() {
    return Objects.hash(userId, settingKey);
  }
}

