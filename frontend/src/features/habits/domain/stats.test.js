import { describe, expect, it } from 'vitest'
import { parseISO } from 'date-fns'
import {
  barSeriesByDay,
  compareRanges,
  computeHabitStreakDays,
  filterEntries,
  minutesByDay,
  minutesByHabit,
  percentRowsByHabit,
  pieDataFromMinutesByHabit,
  summaryStats,
} from './stats.js'
import { resolvePeriodRange } from './periods.js'

const habits = [
  { id: 'h1', name: 'Run', color: '#ff0000', category: 'fitness', active: true },
  { id: 'h2', name: 'Read', color: '#00ff00', category: 'mind', active: false },
]

const entries = [
  { id: 'e1', habitId: 'h1', date: '2026-06-08', durationMinutes: 30 },
  { id: 'e2', habitId: 'h1', date: '2026-06-07', durationMinutes: 20 },
  { id: 'e3', habitId: 'h2', date: '2026-06-08', durationMinutes: 15 },
]

describe('filterEntries', () => {
  it('filters by habitId', () => {
    const result = filterEntries(entries, habits, { habitId: 'h1' })
    expect(result).toHaveLength(2)
    expect(result.every((e) => e.habitId === 'h1')).toBe(true)
  })

  it('filters by activeOnly', () => {
    const result = filterEntries(entries, habits, { activeOnly: true })
    expect(result).toHaveLength(2)
    expect(result.every((e) => e.habitId === 'h1')).toBe(true)
  })
})

describe('minutesByHabit', () => {
  it('aggregates minutes per habit', () => {
    const map = minutesByHabit(entries)
    expect(map.get('h1')).toBe(50)
    expect(map.get('h2')).toBe(15)
  })
})

describe('minutesByDay', () => {
  it('aggregates minutes per date', () => {
    const map = minutesByDay(entries)
    expect(map.get('2026-06-08')).toBe(45)
    expect(map.get('2026-06-07')).toBe(20)
  })
})

describe('pieDataFromMinutesByHabit', () => {
  it('builds sorted rows with habit metadata', () => {
    const byHabit = minutesByHabit(entries)
    const { rows, total } = pieDataFromMinutesByHabit(byHabit, habits)
    expect(total).toBe(65)
    expect(rows[0].habitId).toBe('h1')
    expect(rows[0].name).toBe('Run')
  })
})

describe('percentRowsByHabit', () => {
  it('computes percentage share per habit', () => {
    const { rows, totalMinutes } = percentRowsByHabit(entries, habits)
    expect(totalMinutes).toBe(65)
    const h1 = rows.find((r) => r.habitId === 'h1')
    expect(h1.percent).toBeCloseTo((50 / 65) * 100, 1)
  })
})

describe('barSeriesByDay', () => {
  it('returns zero-filled days in range', () => {
    const range = resolvePeriodRange({
      preset: 'custom',
      customFrom: '2026-06-07',
      customTo: '2026-06-08',
    })
    const series = barSeriesByDay({ range, entries })
    expect(series).toEqual([
      { day: '2026-06-07', minutes: 20 },
      { day: '2026-06-08', minutes: 45 },
    ])
  })
})

describe('summaryStats', () => {
  it('summarizes entries in range', () => {
    const range = resolvePeriodRange({
      preset: 'custom',
      customFrom: '2026-06-07',
      customTo: '2026-06-08',
    })
    const stats = summaryStats({ entries, range })
    expect(stats.totalMinutes).toBe(65)
    expect(stats.entriesCount).toBe(3)
    expect(stats.activeDays).toBe(2)
    expect(stats.topHabitId).toBe('h1')
  })
})

describe('compareRanges', () => {
  it('computes delta and percent between two entry sets', () => {
    const a = [{ durationMinutes: 100 }]
    const b = [{ durationMinutes: 50 }]
    expect(compareRanges({ entriesA: a, entriesB: b })).toEqual({
      a: 100,
      b: 50,
      delta: 50,
      pct: 100,
    })
  })

  it('returns 0 pct when both sums are zero', () => {
    expect(compareRanges({ entriesA: [], entriesB: [] }).pct).toBe(0)
  })
})

describe('computeHabitStreakDays', () => {
  it('counts consecutive days with activity ending at anchor', () => {
    const streak = computeHabitStreakDays({
      habitId: 'h1',
      entries,
      anchorDate: parseISO('2026-06-08T12:00:00'),
    })
    expect(streak).toBe(2)
  })

  it('returns 0 when habit has no qualifying entries', () => {
    expect(
      computeHabitStreakDays({
        habitId: 'h99',
        entries,
        anchorDate: parseISO('2026-06-08T12:00:00'),
      }),
    ).toBe(0)
  })
})
