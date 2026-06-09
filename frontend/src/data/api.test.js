import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../test/msw/server.js'
import { API_BASE, apiFetch } from './api.js'

describe('API_BASE / computeApiBase', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('defaults to localhost:8080 when VITE_API_BASE is empty in dev', async () => {
    vi.stubEnv('VITE_API_BASE', '')
    const { API_BASE: base } = await import('./api.js')
    expect(base).toBe('http://localhost:8080')
  })

  it('uses trimmed VITE_API_BASE when provided', async () => {
    vi.stubEnv('VITE_API_BASE', '  https://api.example.com  ')
    const { API_BASE: base } = await import('./api.js')
    expect(base).toBe('https://api.example.com')
  })
})

describe('apiFetch', () => {
  it('returns parsed JSON on success', async () => {
    server.use(
      http.get(`${API_BASE}/api/ping`, () => HttpResponse.json({ ok: true })),
    )
    await expect(apiFetch('/api/ping')).resolves.toEqual({ ok: true })
  })

  it('throws error with message and status on failure', async () => {
    server.use(
      http.get(`${API_BASE}/api/fail`, () =>
        HttpResponse.json({ error: 'No autorizado' }, { status: 401 }),
      ),
    )
    await expect(apiFetch('/api/fail')).rejects.toMatchObject({
      message: 'No autorizado',
      status: 401,
    })
  })

  it('falls back to HTTP status when body has no message', async () => {
    server.use(
      http.get(`${API_BASE}/api/broken`, () => new HttpResponse(null, { status: 500 })),
    )
    await expect(apiFetch('/api/broken')).rejects.toMatchObject({
      message: 'HTTP 500',
      status: 500,
    })
  })
})
