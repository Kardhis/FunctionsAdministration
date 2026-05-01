package com.example.backend.categories;

import com.example.backend.habits.Habit;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "habit_category_links")
public class HabitCategoryLink {

  @EmbeddedId
  private HabitCategoryLinkKey id;

  @MapsId("habitId")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "habit_id", nullable = false)
  private Habit habit;

  @MapsId("categoryId")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "category_id", nullable = false)
  private HabitCategory category;

  public HabitCategoryLinkKey getId() {
    return id;
  }

  public void setId(HabitCategoryLinkKey id) {
    this.id = id;
  }

  public Habit getHabit() {
    return habit;
  }

  public void setHabit(Habit habit) {
    this.habit = habit;
  }

  public HabitCategory getCategory() {
    return category;
  }

  public void setCategory(HabitCategory category) {
    this.category = category;
  }
}

