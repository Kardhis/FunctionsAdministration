package com.example.backend.objectives;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ObjectiveRepository extends JpaRepository<Objective, String> {

  Optional<Objective> findByIdAndUserId(String id, Long userId);

  @Query(
      "select o from Objective o"
          + " where o.user.id = :userId"
          + " and (:habitId is null or o.habit.id = :habitId)"
          + " and (:from is null or o.endDate >= :from)"
          + " and (:to is null or o.endDate <= :to)"
          + " order by o.endDate asc, o.createdAt desc")
  List<Objective> findAllForUserFiltered(
      @Param("userId") Long userId,
      @Param("habitId") String habitId,
      @Param("from") LocalDate from,
      @Param("to") LocalDate to);
}

