package com.example.backend.habits;

import com.example.backend.users.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "habits")
public class Habit {

  public enum Category {
    salud,
    estudio,
    trabajo,
    ejercicio,
    ocio,
    otro
  }

  public enum TargetType {
    minutes_per_day,
    sessions_per_week,
    hours_per_month
  }

  public enum TargetPeriod {
    day,
    week,
    month
  }

  @Id
  @Column(name = "id", nullable = false, length = 36)
  private String id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "name", nullable = false, length = 80)
  private String name;

  @Column(name = "description", length = 500)
  private String description;

  @Column(name = "color", nullable = false, length = 7)
  private String color;

  @Column(name = "icon", length = 32)
  private String icon;

  @Enumerated(EnumType.STRING)
  @Column(name = "category")
  private Category category;

  @Column(name = "active", nullable = false)
  private boolean active;

  @Enumerated(EnumType.STRING)
  @Column(name = "target_type", nullable = false)
  private TargetType targetType;

  @Column(name = "target_value", nullable = false, precision = 10, scale = 2)
  private BigDecimal targetValue;

  @Enumerated(EnumType.STRING)
  @Column(name = "target_period", nullable = false)
  private TargetPeriod targetPeriod;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getColor() {
    return color;
  }

  public void setColor(String color) {
    this.color = color;
  }

  public String getIcon() {
    return icon;
  }

  public void setIcon(String icon) {
    this.icon = icon;
  }

  public Category getCategory() {
    return category;
  }

  public void setCategory(Category category) {
    this.category = category;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }

  public TargetType getTargetType() {
    return targetType;
  }

  public void setTargetType(TargetType targetType) {
    this.targetType = targetType;
  }

  public BigDecimal getTargetValue() {
    return targetValue;
  }

  public void setTargetValue(BigDecimal targetValue) {
    this.targetValue = targetValue;
  }

  public TargetPeriod getTargetPeriod() {
    return targetPeriod;
  }

  public void setTargetPeriod(TargetPeriod targetPeriod) {
    this.targetPeriod = targetPeriod;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }
}

