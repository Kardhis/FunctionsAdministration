import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../test/msw/server.js'
import { AuthProvider, useAuth } from './AuthContext.jsx'

const API = 'http://localhost:8080'

function AuthProbe() {
  const { status, user, roles, logout } = useAuth()
  return (
    <div>
      <p>status:{status}</p>
      <p>user:{user ?? 'none'}</p>
      <p>roles:{roles.join(',')}</p>
      <button type="button" onClick={() => logout()}>
        Logout
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  const originalPathname = window.location.pathname

  beforeEach(() => {
    window.history.pushState({}, '', '/dashboard')
  })

  afterEach(() => {
    window.history.pushState({}, '', originalPathname)
  })

  it('loads authenticated user from /auth/me', async () => {
    server.use(
      http.get(`${API}/auth/me`, () =>
        HttpResponse.json({ user: 'user@example.com', roles: ['USER'] }),
      ),
    )

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('status:authenticated')).toBeInTheDocument()
    })
    expect(screen.getByText('user:user@example.com')).toBeInTheDocument()
    expect(screen.getByText('roles:USER')).toBeInTheDocument()
  })

  it('sets unauthenticated when /auth/me fails', async () => {
    server.use(http.get(`${API}/auth/me`, () => new HttpResponse(null, { status: 401 })))

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('status:unauthenticated')).toBeInTheDocument()
    })
    expect(screen.getByText('user:none')).toBeInTheDocument()
  })

  it('skips refresh on public auth paths', async () => {
    window.history.pushState({}, '', '/login')
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('status:unauthenticated')).toBeInTheDocument()
    })
    expect(fetchSpy).not.toHaveBeenCalledWith(`${API}/auth/me`, expect.anything())
    fetchSpy.mockRestore()
  })

  it('logout calls endpoint and refreshes session', async () => {
    server.use(
      http.get(`${API}/auth/me`, () =>
        HttpResponse.json({ user: 'user@example.com', roles: ['USER'] }),
      ),
      http.post(`${API}/auth/logout`, () => HttpResponse.json({ message: 'logout_ok' })),
    )

    const user = userEvent.setup()
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('status:authenticated')).toBeInTheDocument()
    })

    server.use(http.get(`${API}/auth/me`, () => new HttpResponse(null, { status: 401 })))

    await user.click(screen.getByRole('button', { name: 'Logout' }))

    await waitFor(() => {
      expect(screen.getByText('status:unauthenticated')).toBeInTheDocument()
    })
  })

  it('throws when useAuth is used outside provider', () => {
    function BadConsumer() {
      useAuth()
      return null
    }

    expect(() => render(<BadConsumer />)).toThrow(/AuthProvider/)
  })
})
