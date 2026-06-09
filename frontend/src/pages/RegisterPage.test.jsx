import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../test/msw/server.js'
import { renderWithProviders } from '../test/test-utils.jsx'
import RegisterPage from './RegisterPage.jsx'

const API = 'http://localhost:8080'
const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

describe('RegisterPage', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    window.history.pushState({}, '', '/register')
  })

  it('renders registration form', () => {
    renderWithProviders(<RegisterPage />, { route: '/register' })
    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre (opcional)')).toBeInTheDocument()
    expect(screen.getByLabelText(/Contraseña/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Iniciar sesión/ })).toHaveAttribute('href', '/login')
  })

  it('shows error when email already exists', async () => {
    server.use(
      http.post(`${API}/auth/register`, () =>
        HttpResponse.json({ error: 'email_exists' }, { status: 409 }),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />, { route: '/register' })

    await user.type(screen.getByLabelText('Email'), 'exists@example.com')
    await user.type(screen.getByLabelText(/Contraseña/), 'password123')
    await user.click(screen.getByRole('button', { name: 'Registrarse' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Ya existe una cuenta con este correo')
    })
  })

  it('redirects to login on successful registration', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />, { route: '/register' })

    await user.type(screen.getByLabelText('Email'), 'new@example.com')
    await user.type(screen.getByLabelText('Nombre (opcional)'), 'Nuevo')
    await user.type(screen.getByLabelText(/Contraseña/), 'password123')
    await user.click(screen.getByRole('button', { name: 'Registrarse' }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login', {
        replace: true,
        state: { message: 'Cuenta creada. Ya puedes iniciar sesión.' },
      })
    })
  })
})
