package com.example.backend.objectives;

import com.example.backend.habits.HabitEntryRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class ObjectiveProgressService {

  public record Progress(long progressValue, String statusCode) {}

  private final HabitEntryRepository habitEntryRepository;

  public ObjectiveProgressService(HabitEntryRepository habitEntryRepository) {
    this.habitEntryRepository = habitEntryRepository;
  }

  public Progress compute(Objective o, ZoneId zoneId) {
    LocalDate start = o.getStartDate() != null ? o.getStartDate() : LocalDate.ofInstant(o.getCreatedAt(), zoneId);
    LocalDate end = o.getEndDate();

    long progress;
    if (o.getMetricType() == Objective.MetricType.MINUTES) {
      progress =
          habitEntryRepository.sumDurationMinutesForHabitBetween(
              o.getUser().getId(), o.getHabit().getId(), start, end);
    } else {
      progress =
          habitEntryRepository.countEntriesForHabitBetween(
              o.getUser().getId(), o.getHabit().getId(), start, end);
    }

    String status;
    if (progress >= (long) o.getTargetValue()) {
      status = "DONE";
    } else {
      LocalDate today = LocalDate.now(zoneId);
      status = today.isAfter(end) ? "NOT_DONE" : "IN_PROGRESS";
    }
    return new Progress(progress, status);
  }

  public ObjectiveStatus requireStatus(Map<String, ObjectiveStatus> byCode, String code) {
    ObjectiveStatus s = byCode.get(code);
    if (s == null) throw new IllegalStateException("objective_status_missing:" + code);
    return s;
  }

  public ZoneId defaultZone() {
    return ZoneId.systemDefault();
  }

  public Instant now() {
    return Instant.now();
  }
}

