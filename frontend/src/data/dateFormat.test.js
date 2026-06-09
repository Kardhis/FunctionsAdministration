import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { formatDateEs, parseDateEsToIso } from './dateFormat.js'

const originalTz = process.env.TZ

beforeAll(() => {
  process.env.TZ = 'UTC'
})

afterAll(() => {
  process.env.TZ = originalTz
})

describe('formatDateEs', () => {
  it('formats ISO date strings in ca-ES locale', () => {
    expect(formatDateEs('2026-06-08')).toMatch(/08.*06.*2026/)
  })

  it('returns em dash for empty or invalid input', () => {
    expect(formatDateEs(null)).toBe('—')
    expect(formatDateEs('not-a-date')).toBe('—')
  })
})

describe('parseDateEsToIso', () => {
  it('parses dd/MM/yyyy to ISO', () => {
    expect(parseDateEsToIso('08/06/2026')).toBe('2026-06-08')
  })

  it('returns empty string for invalid dates', () => {
    expect(parseDateEsToIso('')).toBe('')
    expect(parseDateEsToIso('32/01/2026')).toBe('')
    expect(parseDateEsToIso('31/02/2026')).toBe('')
    expect(parseDateEsToIso('2026-06-08')).toBe('')
  })
})
