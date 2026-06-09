import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { server } from '../test/msw/server.js'
import { AuthProvider } from '../auth/AuthContext.jsx'
import ProtectedRoute from '../routes/ProtectedRoute.jsx'
import LoginPage from '../pages/LoginPage.jsx'

const API = 'http://localhost:8080'

describe('critical flows integration', () => {
  const originalPathname = window.location.pathname

  beforeEach(() => {
    window.history.pushState({}, '', '/dashboard/habits/overview')
  })

  afterEach(() => {
    window.history.pushState({}, '', originalPathname)
  })

  it('redirects to login when /auth/me returns 401', async () => {
    server.use(http.get(`${API}/auth/me`, () => new HttpResponse(null, { status: 401 })))

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard/habits/overview']}>
          <Routes>
            <Route
              path="/dashboard/habits/overview"
              element={
                <ProtectedRoute>
                  <p>Habits overview</p>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<p>Login page</p>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Login page')).toBeInTheDocument()
    })
    expect(screen.queryByText('Habits overview')).not.toBeInTheDocument()
  })

  it('submits login form and navigates to habits dashboard', async () => {
    window.history.pushState({}, '', '/login')

    server.use(
      http.post(`${API}/auth/login`, async ({ request }) => {
        const body = await request.json()
        if (body.email === 'user@example.com' && body.password === 'secret123') {
          return HttpResponse.json({ message: 'login_ok' })
        }
        return HttpResponse.json({ error: 'invalid_credentials' }, { status: 401 })
      }),
      http.get(`${API}/auth/me`, () =>
        HttpResponse.json({ user: 'user@example.com', roles: ['USER'] }),
      ),
    )

    const user = userEvent.setup()

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard/habits/overview" element={<p>Habits dashboard</p>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Habits dashboard')).toBeInTheDocument()
    })
  })
})
