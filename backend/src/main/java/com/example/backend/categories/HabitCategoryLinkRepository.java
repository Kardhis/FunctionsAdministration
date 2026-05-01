package com.example.backend.categories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HabitCategoryLinkRepository
    extends JpaRepository<HabitCategoryLink, HabitCategoryLinkKey> {

  void deleteAllByIdHabitId(String habitId);

  @Query(
      "select l.id.categoryId from HabitCategoryLink l where l.id.habitId = :habitId")
  List<String> findCategoryIdsByHabitId(@Param("habitId") String habitId);

  @Query(
      "select l.id.categoryId, count(distinct l.id.habitId) from HabitCategoryLink l where l.category.user.id = :userId group by l.id.categoryId")
  List<Object[]> countDistinctHabitsByCategoryIdForUser(@Param("userId") Long userId);
}

