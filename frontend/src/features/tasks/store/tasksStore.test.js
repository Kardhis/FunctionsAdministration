import { describe, it, expect, beforeEach } from 'vitest'
import { useTasksStore } from './tasksStore.js'

describe('useTasksStore addToast', () => {
  beforeEach(() => {
    useTasksStore.setState({
      toasts: [],
      projects: [],
      categories: [],
      bootstrapped: false,
      bootstrapError: '',
    })
  })

  it('adds a toast message to the store', () => {
    useTasksStore.getState().addToast('Tasca creada correctament')
    const { toasts } = useTasksStore.getState()
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe('Tasca creada correctament')
    expect(toasts[0].kind).toBe('success')
  })

  it('resetSession does not clear toasts', () => {
    useTasksStore.getState().addToast('Test')
    useTasksStore.getState().resetSession()
    expect(useTasksStore.getState().toasts).toHaveLength(1)
  })
})
