import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw/server.js'
import {
  createObjective,
  deleteObjective,
  listObjectives,
  updateObjective,
} from './objectivesRepo.js'

const API = 'http://localhost:8080'

const objective = {
  id: 'o1',
  habitId: 'h1',
  startDate: '2026-06-01',
  endDate: '2026-06-30',
  metricType: 'MINUTES',
  targetValue: 100,
}

describe('objectivesRepo', () => {
  it('listObjectives builds optional filters', async () => {
    server.use(
      http.get(`${API}/api/objectives`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('habitId')).toBe('h1')
        expect(url.searchParams.get('status')).toBe('ACTIVE')
        return HttpResponse.json([objective])
      }),
    )
    await expect(listObjectives({ habitId: 'h1', status: 'ACTIVE' })).resolves.toEqual([objective])
  })

  it('createObjective posts payload', async () => {
    server.use(http.post(`${API}/api/objectives`, () => HttpResponse.json(objective)))
    await expect(createObjective(objective)).resolves.toEqual(objective)
  })

  it('updateObjective puts patch', async () => {
    server.use(
      http.put(`${API}/api/objectives/o1`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ ...objective, ...body })
      }),
    )
    const updated = await updateObjective('o1', { targetValue: 200 })
    expect(updated.targetValue).toBe(200)
  })

  it('deleteObjective calls DELETE', async () => {
    server.use(
      http.delete(`${API}/api/objectives/o1`, () => new HttpResponse(null, { status: 204 })),
    )
    await expect(deleteObjective('o1')).resolves.toBeNull()
  })
})
