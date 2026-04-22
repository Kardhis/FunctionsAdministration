import { addDays, differenceInCalendarDays, format, parseISO, startOfDay, subMonths } from 'date-fns'
import { eachLocalDayBetween, resolvePeriodRange } from './periods.js'

function habitMatchesFilters(habit, { habitId, category, activeOnly }) {
  if (habitId && habit.id !== habitId) return false
  if (category && habit.category !== category) return false
  if (activeOnly === true && habit.active !== true) return false
  if (activeOnly === false && habit.active !== false) return false
  return true
}

function entryMatchesFilters(entry, habitsById, filters) {
  const habit = habitsById.get(entry.habitId)
  if (!habit) return false
  if (!habitMatchesFilters(habit, filters)) return false
  if (filters.habitId && entry.habitId !== filters.habitId) return false
  return true
}

export function filterEntries(entries, habits, filters) {
  const habitsById = new Map(habits.map((h) => [h.id, h]))
  return entries.filter((e) => entryMatchesFilters(e, habitsById, filters))
}

export function minutesByHabit(entries) {
  const map = new Map()
  for (const e of entries) {
    map.set(e.habitId, (map.get(e.habitId) ?? 0) + (e.durationMinutes ?? 0))
  }
  return map
}

export function minutesByDay(entries) {
  const map = new Map()
  for (const e of entries) {
    map.set(e.date, (map.get(e.date) ?? 0) + (e.durationMinutes ?? 0))
  }
  return map
}

export function pieDataFromMinutesByHabit(minutesByHabit, habits) {
  const rows = []
  let total = 0
  for (const [habitId, minutes] of minutesByHabit.entries()) {
    total += minutes
    const habit = habits.find((h) => h.id === habitId)
    rows.push({
      habitId,
      name: habit?.name ?? 'Hábito',
      color: habit?.color ?? '#888888',
      minutes,
    })
  }
  rows.sort((a, b) => b.minutes - a.minutes)
  return { rows, total }
}

export function barSeriesByDay({ range, entries }) {
  const byDay = minutesByDay(entries)
  const days = eachLocalDayBetween(range.start, range.end)
  return days.map((d) => ({ day: d, minutes: byDay.get(d) ?? 0 }))
}

export function summaryStats({ entries, range }) {
  const totalMinutes = entries.reduce((acc, e) => acc + (e.durationMinutes ?? 0), 0)
  const daysSpan = Math.max(1, differenceInCalendarDays(startOfDay(range.end), startOfDay(range.start)) + 1)
  const uniqueDays = new Set(entries.map((e) => e.date)).size
  const byHabit = minutesByHabit(entries)

  let top = null
  let bottom = null
  for (const [habitId, minutes] of byHabit.entries()) {
    if (!top || minutes > top.minutes) top = { habitId, minutes }
    if (!bottom || minutes < bottom.minutes) bottom = { habitId, minutes }
  }

  return {
    totalMinutes,
    entriesCount: entries.length,
    avgMinutesPerDayInRange: totalMinutes / daysSpan,
    activeDays: uniqueDays,
    topHabitId: top?.habitId ?? null,
    bottomHabitId: bottom?.habitId ?? null,
  }
}

export function compareRanges({ entriesA, entriesB }) {
  const sum = (xs) => xs.reduce((acc, e) => acc + (e.durationMinutes ?? 0), 0)
  const a = sum(entriesA)
  const b = sum(entriesB)
  const delta = a - b
  const pct = b === 0 ? (a === 0 ? 0 : 100) : ((a - b) / b) * 100
  return { a, b, delta, pct }
}

export function computeHabitStreakDays({ habitId, entries, anchorDate = new Date() }) {
  const daysWithTime = new Set(
    entries
      .filter((e) => e.habitId === habitId && (e.durationMinutes ?? 0) > 0)
      .map((e) => e.date),
  )
  if (daysWithTime.size === 0) return 0

  const anchorKey = format(anchorDate, 'yyyy-MM-dd')
  let cursor = anchorKey
  if (!daysWithTime.has(anchorKey)) {
    // If today missing, start from yesterday (common UX)
    cursor = format(addDays(parseISO(`${anchorKey}T00:00:00`), -1), 'yyyy-MM-dd')
  }

  let streak = 0
  let guard = 0
  while (guard < 4000) {
    if (!daysWithTime.has(cursor)) break
    streak += 1
    cursor = format(addDays(parseISO(`${cursor}T00:00:00`), -1), 'yyyy-MM-dd')
    guard += 1
  }
  return streak
}

export function presetCompareWeekVsPrev(anchorDate = new Date()) {
  const thisWeek = resolvePeriodRange({ preset: 'this_week', anchorDate })
  const prevAnchor = addDays(anchorDate, -7)
  const prevWeek = resolvePeriodRange({ preset: 'this_week', anchorDate: prevAnchor })
  return { thisWeek, prevWeek }
}

export function presetCompareMonthVsPrev(anchorDate = new Date()) {
  const thisMonth = resolvePeriodRange({ preset: 'this_month', anchorDate })
  const prevMonth = resolvePeriodRange({ preset: 'this_month', anchorDate: subMonths(anchorDate, 1) })
  return { thisMonth, prevMonth }
}
