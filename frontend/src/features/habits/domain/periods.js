import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from 'date-fns'

export const periodPresets = [
  { key: 'today', label: 'Hoy' },
  { key: 'this_week', label: 'Esta semana' },
  { key: 'this_month', label: 'Este mes' },
  { key: 'last_7', label: 'Últimos 7 días' },
  { key: 'last_30', label: 'Últimos 30 días' },
  { key: 'custom', label: 'Rango personalizado' },
]

export function getWeekRangeMonday(date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return { start: startOfDay(start), end: endOfDay(end) }
}

export function resolvePeriodRange({ preset, anchorDate = new Date(), customFrom, customTo }) {
  if (preset === 'custom') {
    const from = customFrom ? parseISO(`${customFrom}T00:00:00`) : startOfDay(anchorDate)
    const to = customTo ? parseISO(`${customTo}T23:59:59.999`) : endOfDay(anchorDate)
    return { start: startOfDay(from), end: endOfDay(to), label: 'Rango personalizado' }
  }

  if (preset === 'today') {
    return { start: startOfDay(anchorDate), end: endOfDay(anchorDate), label: 'Hoy' }
  }

  if (preset === 'this_week') {
    const { start, end } = getWeekRangeMonday(anchorDate)
    return { start, end, label: 'Esta semana' }
  }

  if (preset === 'this_month') {
    return { start: startOfMonth(anchorDate), end: endOfMonth(anchorDate), label: 'Este mes' }
  }

  if (preset === 'last_7') {
    const end = endOfDay(anchorDate)
    const start = startOfDay(subDays(end, 6))
    return { start, end, label: 'Últimos 7 días' }
  }

  if (preset === 'last_30') {
    const end = endOfDay(anchorDate)
    const start = startOfDay(subDays(end, 29))
    return { start, end, label: 'Últimos 30 días' }
  }

  // default
  return { start: startOfDay(anchorDate), end: endOfDay(anchorDate), label: 'Hoy' }
}

export function formatRangeLabel({ start, end }) {
  return `${format(start, 'yyyy-MM-dd')} → ${format(end, 'yyyy-MM-dd')}`
}

export function isDateInRange(isoOrDate, range) {
  const d = typeof isoOrDate === 'string' ? parseISO(isoOrDate) : isoOrDate
  return d >= range.start && d <= range.end
}

export function eachLocalDayBetween(start, end) {
  const days = []
  let cur = startOfDay(start)
  const last = startOfDay(end)
  while (cur <= last) {
    days.push(format(cur, 'yyyy-MM-dd'))
    cur = addDays(cur, 1)
  }
  return days
}
