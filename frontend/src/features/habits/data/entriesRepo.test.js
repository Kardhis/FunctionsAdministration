import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw/server.js'
import {
  deleteEntry,
  listEntries,
  listEntriesByDateRange,
  putEntry,
  updateEntry,
} from './entriesRepo.js'

const API = 'http://localhost:8080'

const entry = {
  id: 'e1',
  habitId: 'h1',
  date: '2026-06-08',
  startTime: '09:00',
  endTime: '10:00',
  durationMinutes: 60,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('entriesRepo', () => {
  it('listEntries fetches all entries', async () => {
    server.use(http.get(`${API}/api/habit-entries`, () => HttpResponse.json([entry])))
    await expect(listEntries()).resolves.toEqual([entry])
  })

  it('listEntriesByDateRange passes query params', async () => {
    server.use(
      http.get(`${API}/api/habit-entries`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('fromDate')).toBe('2026-06-01')
        expect(url.searchParams.get('toDate')).toBe('2026-06-30')
        return HttpResponse.json([entry])
      }),
    )
    await expect(listEntriesByDateRange({ fromDate: '2026-06-01', toDate: '2026-06-30' })).resolves.toEqual([entry])
  })

  it('putEntry creates via POST', async () => {
    server.use(http.post(`${API}/api/habit-entries`, () => HttpResponse.json(entry)))
    await expect(putEntry(entry)).resolves.toEqual(entry)
  })

  it('putEntry falls back to PUT on conflict', async () => {
    server.use(
      http.post(`${API}/api/habit-entries`, () => HttpResponse.json({}, { status: 409 })),
      http.put(`${API}/api/habit-entries/e1`, () => HttpResponse.json(entry)),
    )
    await expect(putEntry(entry)).resolves.toEqual(entry)
  })

  it('updateEntry requires id and uses PUT', async () => {
    await expect(updateEntry({ habitId: 'h1' })).rejects.toThrow(/id is required/)
    server.use(http.put(`${API}/api/habit-entries/e1`, () => HttpResponse.json(entry)))
    await expect(updateEntry(entry)).resolves.toEqual(entry)
  })

  it('deleteEntry calls DELETE', async () => {
    server.use(
      http.delete(`${API}/api/habit-entries/e1`, () => new HttpResponse(null, { status: 204 })),
    )
    await expect(deleteEntry('e1')).resolves.toBeUndefined()
  })
})
