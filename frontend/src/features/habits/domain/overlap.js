import { parse } from 'date-fns'

function toRangeMinutesOnDate(date, startTime, endTime) {
  const base = parse(date, 'yyyy-MM-dd', new Date())
  const start = parse(`${date} ${startTime}`, 'yyyy-MM-dd HH:mm', base).getTime()
  const end = parse(`${date} ${endTime}`, 'yyyy-MM-dd HH:mm', base).getTime()
  return { start, end }
}

export function rangesOverlap(a, b) {
  return a.start < b.end && b.start < a.end
}

export function findOverlappingEntries({ candidate, entries, ignoreId }) {
  const cand = toRangeMinutesOnDate(candidate.date, candidate.startTime, candidate.endTime)
  return entries.filter((e) => {
    if (e.id === ignoreId) return false
    if (e.date !== candidate.date) return false
    const other = toRangeMinutesOnDate(e.date, e.startTime, e.endTime)
    return rangesOverlap(cand, other)
  })
}
