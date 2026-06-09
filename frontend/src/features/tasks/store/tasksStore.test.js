import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw/server.js'
import { useTasksStore } from './tasksStore.js'

const API = 'http://localhost:8080'

function resetStore() {
  useTasksStore.setState({
    toasts: [],
    projects: [],
    categories: [],
    bootstrapped: false,
    bootstrapError: '',
  })
}

describe('useTasksStore addToast', () => {
  beforeEach(() => {
    resetStore()
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

  it('dismissToastById removes a toast', () => {
    useTasksStore.getState().addToast('One')
    const id = useTasksStore.getState().toasts[0].id
    useTasksStore.getState().dismissToastById(id)
    expect(useTasksStore.getState().toasts).toHaveLength(0)
  })
})

describe('useTasksStore bootstrap', () => {
  beforeEach(() => {
    resetStore()
  })

  it('loads projects and categories once', async () => {
    server.use(
      http.get(`${API}/api/task-projects`, () => HttpResponse.json([{ id: 1, name: 'P1' }])),
      http.get(`${API}/api/task-categories`, () => HttpResponse.json([{ id: 2, name: 'C1' }])),
    )

    await useTasksStore.getState().bootstrap()

    const state = useTasksStore.getState()
    expect(state.bootstrapped).toBe(true)
    expect(state.projects).toHaveLength(1)
    expect(state.categories).toHaveLength(1)
    expect(state.bootstrapError).toBe('')
  })

  it('stores bootstrap error on failure', async () => {
    server.use(
      http.get(`${API}/api/task-projects`, () => HttpResponse.json({ error: 'fail' }, { status: 500 })),
      http.get(`${API}/api/task-categories`, () => HttpResponse.json([])),
    )

    await useTasksStore.getState().bootstrap()

    expect(useTasksStore.getState().bootstrapped).toBe(false)
    expect(useTasksStore.getState().bootstrapError).toBeTruthy()
  })

  it('skips bootstrap when already bootstrapped', async () => {
    useTasksStore.setState({ bootstrapped: true, projects: [{ id: 9 }] })
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    await useTasksStore.getState().bootstrap()
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(useTasksStore.getState().projects).toEqual([{ id: 9 }])
    fetchSpy.mockRestore()
  })
})

describe('useTasksStore taxonomy CRUD', () => {
  beforeEach(() => {
    resetStore()
    useTasksStore.setState({ bootstrapped: true })
  })

  it('createProject refreshes projects list', async () => {
    server.use(
      http.get(`${API}/api/task-projects`, () => HttpResponse.json([{ id: 1, name: 'Alpha' }])),
      http.post(`${API}/api/task-projects`, async ({ request }) => HttpResponse.json(await request.json())),
    )
    const result = await useTasksStore.getState().createProject({ name: 'Alpha' })
    expect(result.ok).toBe(true)
    expect(useTasksStore.getState().projects[0].name).toBe('Alpha')
  })

  it('createCategory refreshes categories list', async () => {
    server.use(
      http.get(`${API}/api/task-categories`, () => HttpResponse.json([{ id: 2, name: 'Work' }])),
      http.post(`${API}/api/task-categories`, async ({ request }) => HttpResponse.json(await request.json())),
    )
    const result = await useTasksStore.getState().createCategory({ name: 'Work' })
    expect(result.ok).toBe(true)
    expect(useTasksStore.getState().categories[0].name).toBe('Work')
  })

  it('deleteCategory removes category via API', async () => {
    server.use(
      http.get(`${API}/api/task-categories`, () => HttpResponse.json([])),
      http.delete(`${API}/api/task-categories/:id`, () => new HttpResponse(null, { status: 204 })),
    )
    const result = await useTasksStore.getState().deleteCategory(5)
    expect(result.ok).toBe(true)
  })

  it('dismissToast removes toast by index', () => {
    useTasksStore.getState().addToast('A')
    useTasksStore.getState().addToast('B')
    useTasksStore.getState().dismissToast(0)
    expect(useTasksStore.getState().toasts).toHaveLength(1)
    expect(useTasksStore.getState().toasts[0].message).toBe('B')
  })
})
