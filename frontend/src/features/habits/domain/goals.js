import { differenceInCalendarDays, endOfMonth, startOfMonth } from 'date-fns'
import { getWeekRangeMonday } from './periods.js'

export function goalProgressForHabit({ habit, entries, anchorDate = new Date() }) {
  const habitEntries = entries.filter((e) => e.habitId === habit.id)

  if (habit.targetType === 'minutes_per_day' && habit.targetPeriod === 'day') {
    const dayStr = habitEntries
      .map((e) => e.date)
      .sort()
      .reverse()[0] // not ideal; UI should pass day; fallback to latest entry day
    const day = dayStr ?? null
    const minutes = habitEntries.filter((e) => (day ? e.date === day : true)).reduce((a, e) => a + e.durationMinutes, 0)
    const target = habit.targetValue
    return {
      label: 'Objetivo diario (min)',
      current: minutes,
      target,
      pct: Math.min(1, target > 0 ? minutes / target : 0),
    }
  }

  if (habit.targetType === 'sessions_per_week' && habit.targetPeriod === 'week') {
    const { start, end } = getWeekRangeMonday(anchorDate)
    const days = differenceInCalendarDays(end, start) + 1
    const inWeek = habitEntries.filter((e) => {
      const t = new Date(`${e.date}T00:00:00`)
      return t >= start && t <= end
    })
    const sessions = new Set(inWeek.map((e) => e.date)).size
    const target = habit.targetValue
    return {
      label: 'Objetivo semanal (días con registro)',
      current: sessions,
      target,
      pct: Math.min(1, target > 0 ? sessions / target : 0),
      meta: { days },
    }
  }

  if (habit.targetType === 'hours_per_month' && habit.targetPeriod === 'month') {
    const start = startOfMonth(anchorDate)
    const end = endOfMonth(anchorDate)
    const minutes = habitEntries
      .filter((e) => {
        const t = new Date(`${e.date}T00:00:00`)
        return t >= start && t <= end
      })
      .reduce((a, e) => a + e.durationMinutes, 0)
    const targetMinutes = habit.targetValue * 60
    return {
      label: 'Objetivo mensual (horas)',
      current: minutes / 60,
      target: habit.targetValue,
      pct: Math.min(1, targetMinutes > 0 ? minutes / targetMinutes : 0),
      meta: { minutes },
    }
  }

  return { label: 'Objetivo', current: 0, target: habit.targetValue ?? 0, pct: 0 }
}
