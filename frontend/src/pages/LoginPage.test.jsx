import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../test/msw/server.js'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext.jsx'
import { renderWithProviders } from '../test/test-utils.jsx'
import LoginPage from './LoginPage.jsx'

const API = 'http://localhost:8080'
const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

describe('LoginPage', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    window.history.pushState({}, '', '/login')
  })

  it('renders login form and navigation links', () => {
    renderWithProviders(<LoginPage />, { route: '/login', withAuth: true })
    expect(screen.getByRole('heading', { name: 'Acceso' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/register')
    expect(screen.getByRole('link', { name: '¿Has olvidado la contraseña?' })).toHaveAttribute(
      'href',
      '/forgot-password',
    )
  })

  it('shows info message from navigation state', () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/login', state: { message: 'Cuenta creada. Ya puedes iniciar sesión.' } }]}
      >
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Cuenta creada. Ya puedes iniciar sesión.')
  })

  it('shows error on invalid credentials', async () => {
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json({ error: 'invalid_credentials' }, { status: 401 }),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { route: '/login', withAuth: true })

    await user.type(screen.getByLabelText('Email'), 'bad@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Credenciales incorrectas')
    })
  })

  it('logs in and redirects non-admin users to habits overview', async () => {
    server.use(
      http.post(`${API}/auth/login`, () => HttpResponse.json({ message: 'login_ok' })),
      http.get(`${API}/auth/me`, () =>
        HttpResponse.json({ user: 'user@example.com', roles: ['USER'] }),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { route: '/login', withAuth: true })

    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/dashboard/habits/overview', { replace: true })
    })
  })
})
