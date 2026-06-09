import { describe, expect, it } from 'vitest'
import { categorySchema, projectSchema, taskCreateSchema, taskUpdateSchema } from './taskSchemas.js'

const validTask = {
  title: 'Revisar informe',
  description: null,
  dueDate: null,
  plannedDate: null,
  plannedTime: null,
  important: null,
  urgent: null,
  projectId: null,
  categoryId: null,
  recurring: false,
  recurrenceType: null,
  recurrenceInterval: null,
  recurrenceEndDate: null,
  estimatedMinutes: null,
  totalMinutes: null,
}

describe('taskCreateSchema', () => {
  it('accepts minimal valid task', () => {
    expect(taskCreateSchema.safeParse(validTask).success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = taskCreateSchema.safeParse({ ...validTask, title: '' })
    expect(result.success).toBe(false)
    expect(result.error.issues[0].message).toMatch(/títol/)
  })

  it('requires plannedDate when plannedTime is set', () => {
    const result = taskCreateSchema.safeParse({
      ...validTask,
      plannedTime: '09:00',
      plannedDate: null,
    })
    expect(result.success).toBe(false)
    expect(result.error.issues.some((i) => i.path.includes('plannedTime'))).toBe(true)
  })

  it('requires recurrence fields when recurring is true', () => {
    const result = taskCreateSchema.safeParse({
      ...validTask,
      recurring: true,
      recurrenceType: null,
    })
    expect(result.success).toBe(false)
    expect(result.error.issues.some((i) => i.path.includes('recurrenceType'))).toBe(true)
  })
})

describe('taskUpdateSchema', () => {
  it('allows partial updates', () => {
    expect(taskUpdateSchema.safeParse({ title: 'Updated' }).success).toBe(true)
  })
})

describe('categorySchema', () => {
  it('accepts valid category with default color', () => {
    const parsed = categorySchema.parse({ name: 'Work' })
    expect(parsed.color).toBe('#6366f1')
  })

  it('rejects invalid hex color', () => {
    expect(categorySchema.safeParse({ name: 'Work', color: 'blue' }).success).toBe(false)
  })
})

describe('projectSchema', () => {
  it('accepts valid project', () => {
    expect(projectSchema.safeParse({ name: 'Portfolio' }).success).toBe(true)
  })
})
