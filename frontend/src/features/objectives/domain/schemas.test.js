import { describe, expect, it } from 'vitest'
import { objectiveCreateSchema, objectiveMetricTypeSchema } from './schemas.js'

describe('objectiveMetricTypeSchema', () => {
  it('accepts supported metric types', () => {
    expect(objectiveMetricTypeSchema.safeParse('REPETITIONS').success).toBe(true)
    expect(objectiveMetricTypeSchema.safeParse('MINUTES').success).toBe(true)
  })

  it('rejects unknown metric types', () => {
    expect(objectiveMetricTypeSchema.safeParse('HOURS').success).toBe(false)
  })
})

describe('objectiveCreateSchema', () => {
  const valid = {
    habitId: 'h1',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    notes: '',
    metricType: 'MINUTES',
    targetValue: 120,
  }

  it('accepts valid objective payload', () => {
    expect(objectiveCreateSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects missing habitId', () => {
    const result = objectiveCreateSchema.safeParse({ ...valid, habitId: '' })
    expect(result.success).toBe(false)
  })

  it('rejects non-positive targetValue', () => {
    const result = objectiveCreateSchema.safeParse({ ...valid, targetValue: 0 })
    expect(result.success).toBe(false)
    expect(result.error.issues[0].message).toMatch(/objetivo/)
  })

  it('rejects invalid date format', () => {
    const result = objectiveCreateSchema.safeParse({ ...valid, startDate: '08-06-2026' })
    expect(result.success).toBe(false)
  })
})
