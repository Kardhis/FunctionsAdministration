import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw/server.js'
import { getSetting, setSetting } from './settingsRepo.js'

const API = 'http://localhost:8080'

describe('settingsRepo', () => {
  it('getSetting returns value or fallback', async () => {
    server.use(
      http.get(`${API}/api/settings/enforceNoOverlap`, () =>
        HttpResponse.json({ value: true }),
      ),
    )
    await expect(getSetting('enforceNoOverlap', false)).resolves.toBe(true)
  })

  it('getSetting returns fallback when value missing', async () => {
    server.use(
      http.get(`${API}/api/settings/theme`, () => HttpResponse.json({})),
    )
    await expect(getSetting('theme', 'system')).resolves.toBe('system')
  })

  it('setSetting puts value and returns stored value', async () => {
    server.use(
      http.put(`${API}/api/settings/theme`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ value: body })
      }),
    )
    await expect(setSetting('theme', 'dark')).resolves.toBe('dark')
  })
})
