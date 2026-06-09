package com.example.backend.habits;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.backend.support.AbstractJpaTest;
import com.example.backend.support.TestUserFactory;
import com.example.backend.users.User;
import com.example.backend.users.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class HabitEntryRepositoryTest extends AbstractJpaTest {

  @Autowired UserRepository userRepository;
  @Autowired HabitRepository habitRepository;
  @Autowired HabitEntryRepository entryRepository;

  User user;
  Habit habit;

  @BeforeEach
  void setUp() {
    user = userRepository.save(TestUserFactory.activeUser("repo-test@example.com", "hash"));
    habit = habitRepository.save(sampleHabit(user, "habit-repo-1"));
  }

  @Test
  void findAllByUserIdAndDateBetweenReturnsEntriesInRange() {
    entryRepository.save(sampleEntry("entry-1", LocalDate.of(2026, 1, 10)));
    entryRepository.save(sampleEntry("entry-2", LocalDate.of(2026, 1, 20)));
    entryRepository.save(sampleEntry("entry-3", LocalDate.of(2026, 2, 1)));

    List<HabitEntry> results =
        entryRepository.findAllByUserIdAndDateBetweenOrderByDateAsc(
            user.getId(), LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31));

    assertThat(results).hasSize(2).extracting(HabitEntry::getId).containsExactly("entry-1", "entry-2");
  }

  @Test
  void sumDurationMinutesForHabitBetweenAggregatesMinutes() {
    entryRepository.save(sampleEntry("entry-1", LocalDate.of(2026, 1, 10), 30));
    entryRepository.save(sampleEntry("entry-2", LocalDate.of(2026, 1, 15), 45));
    entryRepository.save(sampleEntry("entry-3", LocalDate.of(2026, 2, 1), 60));

    long total =
        entryRepository.sumDurationMinutesForHabitBetween(
            user.getId(), habit.getId(), LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31));

    assertThat(total).isEqualTo(75L);
  }

  @Test
  void countEntriesForHabitBetweenCountsSessions() {
    entryRepository.save(sampleEntry("entry-1", LocalDate.of(2026, 1, 10), 30));
    entryRepository.save(sampleEntry("entry-2", LocalDate.of(2026, 1, 15), 45));
    entryRepository.save(sampleEntry("entry-3", LocalDate.of(2026, 2, 1), 60));

    long count =
        entryRepository.countEntriesForHabitBetween(
            user.getId(), habit.getId(), LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31));

    assertThat(count).isEqualTo(2L);
  }

  @Test
  void findByIdAndUserIdScopesToOwner() {
    HabitEntry saved = entryRepository.save(sampleEntry("entry-1", LocalDate.of(2026, 1, 10)));

    assertThat(entryRepository.findByIdAndUserId("entry-1", user.getId())).isPresent();
    assertThat(entryRepository.findByIdAndUserId("entry-1", user.getId() + 999)).isEmpty();
    assertThat(saved.getHabit().getId()).isEqualTo(habit.getId());
  }

  private static Habit sampleHabit(User owner, String id) {
    Instant now = Instant.now();
    Habit habit = new Habit();
    habit.setId(id);
    habit.setUser(owner);
    habit.setName("Run");
    habit.setColor("#112233");
    habit.setActive(true);
    habit.setCreatedAt(now);
    habit.setUpdatedAt(now);
    return habit;
  }

  private HabitEntry sampleEntry(String id, LocalDate date) {
    return sampleEntry(id, date, 60);
  }

  private HabitEntry sampleEntry(String id, LocalDate date, int durationMinutes) {
    Instant now = Instant.now();
    LocalTime start = LocalTime.of(9, 0);
    LocalTime end = start.plusMinutes(durationMinutes);
    HabitEntry entry = new HabitEntry();
    entry.setId(id);
    entry.setUser(user);
    entry.setHabit(habit);
    entry.setDate(date);
    entry.setStartTime(start);
    entry.setEndTime(end);
    entry.setDurationMinutes(durationMinutes);
    entry.setCreatedAt(now);
    entry.setUpdatedAt(now);
    return entry;
  }
}
