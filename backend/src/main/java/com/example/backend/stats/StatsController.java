package com.example.backend.stats;

import com.example.backend.habits.HabitEntryRepository;
import com.example.backend.users.CurrentUserService;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

  public record HabitAggregate(String habitId, long sessions, long totalMinutes) {}

  private final HabitEntryRepository entryRepository;
  private final CurrentUserService currentUserService;

  public StatsController(HabitEntryRepository entryRepository, CurrentUserService currentUserService) {
    this.entryRepository = entryRepository;
    this.currentUserService = currentUserService;
  }

  @GetMapping
  @Transactional(readOnly = true)
  public Map<String, Object> stats(
      @RequestParam("fromDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
      @RequestParam("toDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
      Principal principal) {
    var user = currentUserService.requireUser(principal);
    var entries =
        entryRepository.findAllByUserIdAndDateBetweenOrderByDateAsc(user.getId(), fromDate, toDate);

    long totalSessions = entries.size();
    long totalMinutes = entries.stream().mapToLong(e -> e.getDurationMinutes()).sum();

    Map<String, HabitAggregate> byHabit =
        entries.stream()
            .collect(
                java.util.stream.Collectors.groupingBy(
                    e -> e.getHabit().getId(),
                    java.util.stream.Collectors.collectingAndThen(
                        java.util.stream.Collectors.toList(),
                        list ->
                            new HabitAggregate(
                                list.get(0).getHabit().getId(),
                                list.size(),
                                list.stream().mapToLong(x -> x.getDurationMinutes()).sum()))));

    List<HabitAggregate> habits = byHabit.values().stream().toList();

    return Map.of(
        "fromDate", fromDate.toString(),
        "toDate", toDate.toString(),
        "totalSessions", totalSessions,
        "totalMinutes", totalMinutes,
        "byHabit", habits);
  }
}

