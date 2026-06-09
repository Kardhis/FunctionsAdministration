import { describe, expect, it } from 'vitest'
import { buildTaskUpdatePayload } from './taskPayload.js'

describe('buildTaskUpdatePayload', () => {
  it('maps form values and sets clear flags when fields are empty', () => {
    const payload = buildTaskUpdatePayload({
      title: '  Task title  ',
      description: '',
      dueDate: '',
      plannedDate: '',
      plannedTime: '',
      important: null,
      urgent: null,
      projectId: null,
      categoryId: null,
      recurring: false,
      estimatedMinutes: null,
      totalMinutes: null,
    })

    expect(payload.title).toBe('Task title')
    expect(payload.description).toBe(null)
    expect(payload.clearPlannedDate).toBe(true)
    expect(payload.clearImportant).toBe(true)
    expect(payload.clearUrgent).toBe(true)
    expect(payload.clearEstimatedMinutes).toBe(true)
    expect(payload.recurrenceType).toBe(null)
  })

  it('keeps planned time and sets clearPlannedTime when date exists without time', () => {
    const payload = buildTaskUpdatePayload({
      title: 'Task',
      plannedDate: '2026-06-08',
      plannedTime: '',
      important: true,
      urgent: false,
      recurring: true,
      recurrenceType: 'WEEKLY',
      recurrenceInterval: 2,
      recurrenceEndDate: '2026-12-31',
      estimatedMinutes: 30,
      totalMinutes: 45,
    })

    expect(payload.plannedDate).toBe('2026-06-08')
    expect(payload.plannedTime).toBe(null)
    expect(payload.clearPlannedTime).toBe(true)
    expect(payload.important).toBe(true)
    expect(payload.clearImportant).toBeUndefined()
    expect(payload.recurrenceType).toBe('WEEKLY')
    expect(payload.estimatedMinutes).toBe(30)
  })
})
