import { describe, expect, it } from 'vitest'
import { computeDurationMinutes, formatDurationHuman } from './time.js'

describe('computeDurationMinutes', () => {
  it('computes same-day duration', () => {
    expect(computeDurationMinutes({ date: '2026-04-16', startTime: '09:00', endTime: '10:25' })).toBe(85)
  })

  it('rejects end before start at schema-level elsewhere; helper returns 0 if equal? actually equal is 0', () => {
    expect(computeDurationMinutes({ date: '2026-04-16', startTime: '10:00', endTime: '10:00' })).toBe(0)
  })
})

describe('formatDurationHuman', () => {
  it('formats hours+minutes', () => {
    expect(formatDurationHuman(85)).toBe('1h 25min')
  })
})
