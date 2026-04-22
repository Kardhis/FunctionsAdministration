import { differenceInMinutes, format, parse } from 'date-fns'

export function minutesFromDayTimeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function computeDurationMinutes({ date, startTime, endTime }) {
  const base = parse(date, 'yyyy-MM-dd', new Date())
  const start = parse(`${date} ${startTime}`, 'yyyy-MM-dd HH:mm', base)
  const end = parse(`${date} ${endTime}`, 'yyyy-MM-dd HH:mm', base)
  return Math.max(0, differenceInMinutes(end, start))
}

export function formatDurationHuman(totalMinutes) {
  const m = Math.max(0, Math.round(totalMinutes))
  const h = Math.floor(m / 60)
  const mm = m % 60
  if (h <= 0) return `${mm}min`
  if (mm === 0) return `${h}h`
  return `${h}h ${mm}min`
}

export function toIsoNow() {
  return new Date().toISOString()
}

export function todayLocalDateString(date = new Date()) {
  return format(date, 'yyyy-MM-dd')
}
