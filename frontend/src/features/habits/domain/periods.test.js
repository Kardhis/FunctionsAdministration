import { describe, expect, it } from 'vitest'
import { format, parseISO } from 'date-fns'
import {
  eachLocalDayBetween,
  formatRangeLabel,
  getWeekRangeMonday,
  isDateInRange,
  periodPresets,
  resolvePeriodRange,
} from './periods.js'

const anchor = parseISO('2026-06-10T12:00:00') // Wednesday

describe('periodPresets', () => {
  it('includes expected preset keys', () => {
    const keys = periodPresets.map((p) => p.key)
    expect(keys).toContain('today')
    expect(keys).toContain('this_week')
    expect(keys).toContain('custom')
  })
})

describe('resolvePeriodRange', () => {
  it('resolves today preset to a single day', () => {
    const range = resolvePeriodRange({ preset: 'today', anchorDate: anchor })
    expect(range.label).toBe('Hoy')
    expect(format(range.start, 'yyyy-MM-dd')).toBe('2026-06-10')
    expect(format(range.end, 'yyyy-MM-dd')).toBe('2026-06-10')
  })

  it('resolves last_7 to seven days ending on anchor', () => {
    const range = resolvePeriodRange({ preset: 'last_7', anchorDate: anchor })
    expect(range.label).toBe('Últimos 7 días')
    expect(format(range.start, 'yyyy-MM-dd')).toBe('2026-06-04')
    expect(format(range.end, 'yyyy-MM-dd')).toBe('2026-06-10')
  })

  it('resolves custom range from from/to strings', () => {
    const range = resolvePeriodRange({
      preset: 'custom',
      customFrom: '2026-06-01',
      customTo: '2026-06-05',
    })
    expect(range.label).toBe('Rango personalizado')
    expect(format(range.start, 'yyyy-MM-dd')).toBe('2026-06-01')
    expect(format(range.end, 'yyyy-MM-dd')).toBe('2026-06-05')
  })
})

describe('getWeekRangeMonday', () => {
  it('starts week on Monday for a Wednesday anchor', () => {
    const { start, end } = getWeekRangeMonday(anchor)
    expect(format(start, 'yyyy-MM-dd')).toBe('2026-06-08')
    expect(format(end, 'yyyy-MM-dd')).toBe('2026-06-14')
  })
})

describe('formatRangeLabel', () => {
  it('formats start and end as yyyy-MM-dd', () => {
    const range = resolvePeriodRange({ preset: 'today', anchorDate: anchor })
    expect(formatRangeLabel(range)).toBe('2026-06-10 → 2026-06-10')
  })
})

describe('isDateInRange', () => {
  it('returns true for dates inside the range', () => {
    const range = resolvePeriodRange({ preset: 'last_7', anchorDate: anchor })
    expect(isDateInRange('2026-06-05', range)).toBe(true)
  })

  it('returns false for dates outside the range', () => {
    const range = resolvePeriodRange({ preset: 'today', anchorDate: anchor })
    expect(isDateInRange('2026-06-01', range)).toBe(false)
  })
})

describe('eachLocalDayBetween', () => {
  it('lists every day inclusively between start and end', () => {
    const range = resolvePeriodRange({
      preset: 'custom',
      customFrom: '2026-06-01',
      customTo: '2026-06-03',
    })
    expect(eachLocalDayBetween(range.start, range.end)).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
    ])
  })
})
