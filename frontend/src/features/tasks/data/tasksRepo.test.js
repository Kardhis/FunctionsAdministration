import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw/server.js'
import {
  cancelTask,
  completeTask,
  createTask,
  getBacklog,
  getCalendarTasks,
  getEisenhower,
  getTask,
  getTodayTasks,
  listTasks,
  searchTasks,
  updateTask,
} from './tasksRepo.js'

const API = 'http://localhost:8080'

describe('tasksRepo', () => {
  it('listTasks builds query params', async () => {
    server.use(
      http.get(`${API}/api/tasks`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('status')).toBe('PENDIENTE')
        expect(url.searchParams.get('page')).toBe('1')
        return HttpResponse.json({ items: [{ id: 1 }], total: 1, page: 1, size: 25 })
      }),
    )
    const result = await listTasks({ status: 'PENDIENTE', page: 1 })
    expect(result.items).toHaveLength(1)
  })

  it('createTask posts payload', async () => {
    server.use(
      http.post(`${API}/api/tasks`, async ({ request }) => {
        const body = await request.json()
        expect(body.title).toBe('Nova tasca')
        return HttpResponse.json({ id: 42, ...body })
      }),
    )
    const created = await createTask({ title: 'Nova tasca' })
    expect(created.id).toBe(42)
  })

  it('getTask fetches by id', async () => {
    server.use(
      http.get(`${API}/api/tasks/5`, () => HttpResponse.json({ id: 5, title: 'Task' })),
    )
    await expect(getTask(5)).resolves.toEqual({ id: 5, title: 'Task' })
  })

  it('updateTask puts payload', async () => {
    server.use(
      http.put(`${API}/api/tasks/3`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 3, ...body })
      }),
    )
    const updated = await updateTask(3, { title: 'Updated' })
    expect(updated.title).toBe('Updated')
  })

  it('completeTask and cancelTask call action endpoints', async () => {
    server.use(
      http.post(`${API}/api/tasks/1/complete`, () =>
        HttpResponse.json({ id: 1, status: 'COMPLETADA' }),
      ),
      http.post(`${API}/api/tasks/2/cancel`, () =>
        HttpResponse.json({ id: 2, status: 'CANCELADA' }),
      ),
    )
    await expect(completeTask(1)).resolves.toMatchObject({ status: 'COMPLETADA' })
    await expect(cancelTask(2)).resolves.toMatchObject({ status: 'CANCELADA' })
  })

  it('getTodayTasks, getEisenhower, getCalendarTasks and getBacklog fetch views', async () => {
    server.use(
      http.get(`${API}/api/tasks/today`, () => HttpResponse.json([])),
      http.get(`${API}/api/tasks/eisenhower`, () => HttpResponse.json({ quadrants: {} })),
      http.get(`${API}/api/tasks/calendar`, () => HttpResponse.json([])),
      http.get(`${API}/api/tasks/backlog`, () => HttpResponse.json({ items: [], total: 0 })),
    )
    await expect(getTodayTasks()).resolves.toEqual([])
    await expect(getEisenhower()).resolves.toEqual({ quadrants: {} })
    await expect(getCalendarTasks('2026-06-01', '2026-06-30')).resolves.toEqual([])
    await expect(getBacklog()).resolves.toMatchObject({ total: 0 })
  })

  it('searchTasks returns empty array for blank query', async () => {
    await expect(searchTasks('   ')).resolves.toEqual([])
  })

  it('searchTasks encodes query', async () => {
    server.use(
      http.get(`${API}/api/tasks/search`, ({ request }) => {
        expect(new URL(request.url).searchParams.get('q')).toBe('informe')
        return HttpResponse.json([{ id: 1, title: 'informe' }])
      }),
    )
    const results = await searchTasks('informe')
    expect(results).toHaveLength(1)
  })
})
