package com.example.backend.habits;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReminderRepository extends JpaRepository<Reminder, String> {
  List<Reminder> findAllByUserIdOrderByCreatedAtDesc(Long userId);

  Optional<Reminder> findByIdAndUserId(String id, Long userId);
}

