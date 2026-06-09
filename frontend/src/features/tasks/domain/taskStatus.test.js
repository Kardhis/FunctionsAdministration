import { describe, expect, it } from 'vitest'
import {
  canComplete,
  getStatusMeta,
  isFinal,
  isOverdue,
  TASK_STATUSES,
} from './taskStatus.js'

describe('getStatusMeta', () => {
  it('returns metadata for known statuses', () => {
    expect(getStatusMeta('COMPLETADA').label).toBe('Completada')
    expect(getStatusMeta('COMPLETADA').tone).toBe('success')
  })

  it('falls back for unknown status', () => {
    expect(getStatusMeta('UNKNOWN')).toEqual({
      value: 'UNKNOWN',
      label: 'UNKNOWN',
      tone: 'neutral',
    })
  })
})

describe('isFinal', () => {
  it('returns true for terminal statuses', () => {
    expect(isFinal('COMPLETADA')).toBe(true)
    expect(isFinal('CANCELADA')).toBe(true)
  })

  it('returns false for active statuses', () => {
    expect(isFinal('EN_PROGRESO')).toBe(false)
  })
})

describe('canComplete', () => {
  it('allows completion for in-progress tasks', () => {
    expect(canComplete('EN_PROGRESO')).toBe(true)
  })

  it('disallows completion for backlog and final statuses', () => {
    expect(canComplete('BACKLOG')).toBe(false)
    expect(canComplete('COMPLETADA')).toBe(false)
  })
})

describe('isOverdue', () => {
  it('returns true when due date is in the past and status is not final', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const iso = yesterday.toISOString().slice(0, 10)
    expect(isOverdue({ dueDate: iso, status: 'PENDIENTE' })).toBe(true)
  })

  it('returns false without due date or for final statuses', () => {
    expect(isOverdue({ status: 'PENDIENTE' })).toBe(false)
    expect(isOverdue({ dueDate: '2020-01-01', status: 'COMPLETADA' })).toBe(false)
  })
})

describe('TASK_STATUSES', () => {
  it('includes all workflow statuses', () => {
    const values = TASK_STATUSES.map((s) => s.value)
    expect(values).toContain('BACKLOG')
    expect(values).toContain('COMPLETADA')
  })
})
