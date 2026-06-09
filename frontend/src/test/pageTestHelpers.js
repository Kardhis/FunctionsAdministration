import { useTasksStore } from '../features/tasks/store/tasksStore.js'
import { useHabitAppStore } from '../features/habits/store/habitAppStore.js'
import { sampleHabit } from './msw/handlers.js'

export function resetTasksStore() {
  useTasksStore.setState({
    toasts: [],
    projects: [],
    categories: [],
    bootstrapped: false,
    bootstrapError: '',
  })
}

export function seedTasksStore({ projects = [], categories = [] } = {}) {
  useTasksStore.setState({
    toasts: [],
    projects,
    categories,
    bootstrapped: true,
    bootstrapError: '',
  })
}

export function resetHabitsStore() {
  useHabitAppStore.getState().resetSession()
}

export function seedHabitsStore(overrides = {}) {
  resetHabitsStore()
  useHabitAppStore.setState({
    bootstrapped: true,
    loading: false,
    error: '',
    habits: [sampleHabit],
    entries: [],
    categories: [],
    settings: { enforceNoOverlap: false, theme: 'system' },
    ...overrides,
  })
}
