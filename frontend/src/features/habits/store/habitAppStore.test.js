import { describe, expect, it, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw/server.js'
import { useHabitAppStore } from './habitAppStore.js'

const API = 'http://localhost:8080'

function resetStore() {
  useHabitAppStore.getState().resetSession()
}

describe('habitAppStore', () => {
  beforeEach(() => {
    resetStore()
  })

  it('resetSession clears module state', () => {
    useHabitAppStore.setState({
      bootstrapped: true,
      habits: [{ id: 'h1' }],
      toasts: [{ id: 't1', message: 'ok' }],
    })
    resetStore()
    const state = useHabitAppStore.getState()
    expect(state.bootstrapped).toBe(false)
    expect(state.habits).toEqual([])
    expect(state.toasts).toEqual([])
  })

  it('bootstrap loads habits, entries, categories and settings', async () => {
    server.use(
      http.get(`${API}/api/habits`, () => HttpResponse.json([{ id: 'h1', name: 'Run' }])),
      http.get(`${API}/api/habit-entries`, () => HttpResponse.json([])),
      http.get(`${API}/api/habit-categories`, () => HttpResponse.json([])),
      http.get(`${API}/api/settings/enforceNoOverlap`, () => HttpResponse.json({ value: true })),
      http.get(`${API}/api/settings/theme`, () => HttpResponse.json({ value: 'dark' })),
    )

    await useHabitAppStore.getState().bootstrap()

    const state = useHabitAppStore.getState()
    expect(state.bootstrapped).toBe(true)
    expect(state.habits).toHaveLength(1)
    expect(state.settings.enforceNoOverlap).toBe(true)
    expect(state.settings.theme).toBe('dark')
  })

  it('createHabit rejects invalid input and shows toast', async () => {
    const result = await useHabitAppStore.getState().createHabit({ name: '', color: '#aabbcc' })
    expect(result.ok).toBe(false)
    expect(useHabitAppStore.getState().toasts.at(-1)?.kind).toBe('error')
  })

  it('dismissToast removes toast by index', () => {
    useHabitAppStore.setState({ toasts: [{ id: '1' }, { id: '2' }] })
    useHabitAppStore.getState().dismissToast(0)
    expect(useHabitAppStore.getState().toasts).toEqual([{ id: '2' }])
  })

  it('createHabit succeeds with valid payload', async () => {
    server.use(
      http.get(`${API}/api/habits`, () =>
        HttpResponse.json([{ id: 'h-new', name: 'Meditar', color: '#aabbcc', active: true }]),
      ),
      http.put(`${API}/api/habits/:id`, async ({ request }) => HttpResponse.json(await request.json())),
    )

    const result = await useHabitAppStore.getState().createHabit({
      name: 'Meditar',
      color: '#aabbcc',
      active: true,
    })

    expect(result.ok).toBe(true)
    expect(useHabitAppStore.getState().habits).toHaveLength(1)
    expect(useHabitAppStore.getState().toasts.at(-1)?.kind).toBe('success')
  })

  it('setTheme updates settings and applies theme', async () => {
    await useHabitAppStore.getState().setTheme('dark')
    expect(useHabitAppStore.getState().settings.theme).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('setEnforceNoOverlap persists setting', async () => {
    await useHabitAppStore.getState().setEnforceNoOverlap(true)
    expect(useHabitAppStore.getState().settings.enforceNoOverlap).toBe(true)
  })

  it('createCategory adds category via API', async () => {
    server.use(
      http.get(`${API}/api/habit-categories`, () =>
        HttpResponse.json([{ id: 'c1', name: 'Salud', active: true }]),
      ),
      http.post(`${API}/api/habit-categories`, async ({ request }) => HttpResponse.json(await request.json())),
    )

    const result = await useHabitAppStore.getState().createCategory({ name: 'Salud' })
    expect(result.ok).toBe(true)
    expect(useHabitAppStore.getState().categories).toHaveLength(1)
  })
})
