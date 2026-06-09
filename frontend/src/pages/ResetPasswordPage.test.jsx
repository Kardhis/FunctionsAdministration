import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../test/msw/server.js'
import { renderWithProviders } from '../test/test-utils.jsx'
import ResetPasswordPage from './ResetPasswordPage.jsx'

const API = 'http://localhost:8080'
const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    window.history.pushState({}, '', '/reset-password')
  })

  it('shows alert when token is missing', () => {
    renderWithProviders(<ResetPasswordPage />, { route: '/reset-password' })
    expect(screen.getByRole('alert')).toHaveTextContent('Falta el token en la URL')
    expect(screen.getByRole('button', { name: 'Guardar contraseña' })).toBeDisabled()
  })

  it('validates matching passwords client-side', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ResetPasswordPage />, {
      route: '/reset-password?token=abc123',
    })

    await user.type(document.getElementById('reset-password'), 'password123')
    await user.type(document.getElementById('reset-password2'), 'different123')
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Las contraseñas no coinciden')
    })
  })

  it('resets password and redirects to login', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ResetPasswordPage />, {
      route: '/reset-password?token=valid-token',
    })

    await user.type(document.getElementById('reset-password'), 'newpassword1')
    await user.type(document.getElementById('reset-password2'), 'newpassword1')
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login', {
        replace: true,
        state: { message: 'Contraseña actualizada. Inicia sesión con la nueva contraseña.' },
      })
    })
  })

  it('shows error for expired token', async () => {
    server.use(
      http.post(`${API}/auth/reset-password`, () =>
        HttpResponse.json({ error: 'reset_token_expired' }, { status: 400 }),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<ResetPasswordPage />, {
      route: '/reset-password?token=expired',
    })

    await user.type(document.getElementById('reset-password'), 'newpassword1')
    await user.type(document.getElementById('reset-password2'), 'newpassword1')
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('El enlace ha caducado')
    })
  })
})
