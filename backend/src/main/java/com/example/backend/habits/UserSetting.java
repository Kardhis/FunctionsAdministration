package com.example.backend.habits;

import com.example.backend.users.User;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "user_settings")
public class UserSetting {

  @EmbeddedId
  private UserSettingKey id;

  @MapsId("userId")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "setting_value", nullable = false, columnDefinition = "json")
  private String settingValueJson;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  public UserSettingKey getId() {
    return id;
  }

  public void setId(UserSettingKey id) {
    this.id = id;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public String getSettingValueJson() {
    return settingValueJson;
  }

  public void setSettingValueJson(String settingValueJson) {
    this.settingValueJson = settingValueJson;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }
}

