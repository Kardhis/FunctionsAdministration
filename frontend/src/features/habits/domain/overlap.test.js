import { describe, expect, it } from 'vitest'
import { findOverlappingEntries, rangesOverlap } from './overlap.js'

describe('rangesOverlap', () => {
  it('returns true when ranges partially overlap', () => {
    expect(rangesOverlap({ start: 0, end: 60 }, { start: 30, end: 90 })).toBe(true)
  })

  it('returns false when ranges are adjacent but not overlapping', () => {
    expect(rangesOverlap({ start: 0, end: 60 }, { start: 60, end: 120 })).toBe(false)
  })

  it('returns false when ranges are on separate timelines', () => {
    expect(rangesOverlap({ start: 0, end: 30 }, { start: 100, end: 130 })).toBe(false)
  })
})

describe('findOverlappingEntries', () => {
  const entries = [
    { id: 'e1', date: '2026-06-08', startTime: '09:00', endTime: '10:00' },
    { id: 'e2', date: '2026-06-08', startTime: '11:00', endTime: '12:00' },
    { id: 'e3', date: '2026-06-09', startTime: '09:00', endTime: '10:00' },
  ]

  it('finds entries that overlap on the same date', () => {
    const candidate = { date: '2026-06-08', startTime: '09:30', endTime: '10:30' }
    const result = findOverlappingEntries({ candidate, entries })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('e1')
  })

  it('ignores the entry specified by ignoreId', () => {
    const candidate = { date: '2026-06-08', startTime: '09:00', endTime: '10:00' }
    const result = findOverlappingEntries({ candidate, entries, ignoreId: 'e1' })
    expect(result).toHaveLength(0)
  })

  it('returns empty when candidate is on a different date', () => {
    const candidate = { date: '2026-06-10', startTime: '09:00', endTime: '10:00' }
    expect(findOverlappingEntries({ candidate, entries })).toHaveLength(0)
  })
})
