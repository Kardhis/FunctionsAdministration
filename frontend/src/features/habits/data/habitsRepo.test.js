import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw/server.js'
import { deleteHabit, getHabit, listHabits, putHabit } from './habitsRepo.js'

const API = 'http://localhost:8080'

const habit = {
  id: 'h1',
  name: 'Run',
  color: '#aabbcc',
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('habitsRepo', () => {
  it('listHabits fetches habits', async () => {
    server.use(http.get(`${API}/api/habits`, () => HttpResponse.json([habit])))
    await expect(listHabits()).resolves.toEqual([habit])
  })

  it('getHabit finds habit by id from list', async () => {
    server.use(http.get(`${API}/api/habits`, () => HttpResponse.json([habit])))
    await expect(getHabit('h1')).resolves.toEqual(habit)
    await expect(getHabit('missing')).resolves.toBe(null)
  })

  it('putHabit creates via POST', async () => {
    server.use(
      http.post(`${API}/api/habits`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(body, { status: 201 })
      }),
    )
    await expect(putHabit(habit)).resolves.toEqual(habit)
  })

  it('putHabit falls back to PUT on 409 conflict', async () => {
    server.use(
      http.post(`${API}/api/habits`, () => HttpResponse.json({ error: 'exists' }, { status: 409 })),
      http.put(`${API}/api/habits/h1`, () => HttpResponse.json(habit)),
    )
    await expect(putHabit(habit)).resolves.toEqual(habit)
  })

  it('putHabit requires id', async () => {
    await expect(putHabit({ name: 'No id' })).rejects.toThrow(/id is required/)
  })

  it('deleteHabit calls DELETE endpoint', async () => {
    server.use(
      http.delete(`${API}/api/habits/h1`, () => new HttpResponse(null, { status: 204 })),
    )
    await expect(deleteHabit('h1')).resolves.toBeUndefined()
  })
})
