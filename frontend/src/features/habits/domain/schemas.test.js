import { describe, expect, it } from 'vitest'
import {
  habitCreateSchema,
  habitEntryCreateSchema,
  habitEntrySchema,
  habitEntryUpdateSchema,
  habitSchema,
  habitUpdateSchema,
} from './schemas.js'

const validHabit = {
  id: 'h1',
  name: 'Meditate',
  description: null,
  color: '#aabbcc',
  icon: null,
  categoryIds: [],
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const validEntry = {
  id: 'e1',
  habitId: 'h1',
  date: '2026-06-08',
  startTime: '09:00',
  endTime: '10:00',
  durationMinutes: 60,
  notes: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('habitSchema', () => {
  it('accepts a valid habit', () => {
    expect(habitSchema.safeParse(validHabit).success).toBe(true)
  })

  it('rejects invalid color format', () => {
    const result = habitCreateSchema.safeParse({ ...validHabit, color: 'red' })
    expect(result.success).toBe(false)
    expect(result.error.issues[0].message).toMatch(/Color inválido/)
  })

  it('rejects empty name on create', () => {
    const result = habitCreateSchema.safeParse({ ...validHabit, name: '   ' })
    expect(result.success).toBe(false)
  })
})

describe('habitUpdateSchema', () => {
  it('allows partial updates with id', () => {
    expect(habitUpdateSchema.safeParse({ id: 'h1', active: false }).success).toBe(true)
  })
})

describe('habitEntrySchema', () => {
  it('accepts valid entry times', () => {
    expect(habitEntrySchema.safeParse(validEntry).success).toBe(true)
  })

  it('rejects end time before start time', () => {
    const result = habitEntryCreateSchema.safeParse({
      habitId: 'h1',
      date: '2026-06-08',
      startTime: '10:00',
      endTime: '09:00',
    })
    expect(result.success).toBe(false)
    expect(result.error.issues.some((i) => i.path.includes('endTime'))).toBe(true)
  })
})

describe('habitEntryUpdateSchema', () => {
  it('validates time order only when both times provided', () => {
    expect(habitEntryUpdateSchema.safeParse({ id: 'e1', startTime: '09:00' }).success).toBe(true)

    const invalid = habitEntryUpdateSchema.safeParse({
      id: 'e1',
      startTime: '11:00',
      endTime: '10:00',
    })
    expect(invalid.success).toBe(false)
  })
})
