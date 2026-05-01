package com.example.backend.categories;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class HabitCategoryLinkKey implements Serializable {

  @Column(name = "habit_id", nullable = false, length = 36)
  private String habitId;

  @Column(name = "category_id", nullable = false, length = 36)
  private String categoryId;

  public HabitCategoryLinkKey() {}

  public HabitCategoryLinkKey(String habitId, String categoryId) {
    this.habitId = habitId;
    this.categoryId = categoryId;
  }

  public String getHabitId() {
    return habitId;
  }

  public String getCategoryId() {
    return categoryId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    HabitCategoryLinkKey that = (HabitCategoryLinkKey) o;
    return Objects.equals(habitId, that.habitId) && Objects.equals(categoryId, that.categoryId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(habitId, categoryId);
  }
}

