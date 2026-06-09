import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw/server.js'
import { listReminders, putReminder } from './remindersRepo.js'

const API = 'http://localhost:8080'

const reminder = {
  id: 'r1',
  habitId: 'h1',
  time: '08:00',
  active: true,
}

describe('remindersRepo', () => {
  it('listReminders fetches reminders', async () => {
    server.use(http.get(`${API}/api/reminders`, () => HttpResponse.json([reminder])))
    await expect(listReminders()).resolves.toEqual([reminder])
  })

  it('putReminder creates via POST', async () => {
    server.use(http.post(`${API}/api/reminders`, () => HttpResponse.json(reminder)))
    await expect(putReminder(reminder)).resolves.toEqual(reminder)
  })

  it('putReminder falls back to PUT on conflict', async () => {
    server.use(
      http.post(`${API}/api/reminders`, () => HttpResponse.json({}, { status: 409 })),
      http.put(`${API}/api/reminders/r1`, () => HttpResponse.json(reminder)),
    )
    await expect(putReminder(reminder)).resolves.toEqual(reminder)
  })

  it('putReminder requires id', async () => {
    await expect(putReminder({ habitId: 'h1' })).rejects.toThrow(/id is required/)
  })
})
