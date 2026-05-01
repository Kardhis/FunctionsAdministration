package com.example.backend.objectives;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ObjectiveStatusRepository extends JpaRepository<ObjectiveStatus, Long> {
  Optional<ObjectiveStatus> findByCode(String code);
}

