import { describe, expect, it, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../test/msw/server.js'
import { renderWithProviders } from '../test/test-utils.jsx'
import ForgotPasswordPage from './ForgotPasswordPage.jsx'

const API = 'http://localhost:8080'

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/forgot-password')
  })

  it('renders forgot password form', () => {
    renderWithProviders(<ForgotPasswordPage />, { route: '/forgot-password' })
    expect(screen.getByRole('heading', { name: 'Recuperar contraseña' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio de sesión' })).toHaveAttribute('href', '/login')
  })

  it('shows success message after submit', async () => {
    server.use(
      http.post(`${API}/auth/forgot-password`, () =>
        HttpResponse.json({ message: 'Enlace enviado correctamente.' }),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<ForgotPasswordPage />, { route: '/forgot-password' })

    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Enlace enviado correctamente')
    })
  })

  it('shows validation error from API', async () => {
    server.use(
      http.post(`${API}/auth/forgot-password`, () =>
        HttpResponse.json({ error: 'validation_failed', details: ['Email inválido'] }, { status: 400 }),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<ForgotPasswordPage />, { route: '/forgot-password' })

    await user.type(screen.getByLabelText('Email'), 'bad')
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email inválido')
    })
  })
})
