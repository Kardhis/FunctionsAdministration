import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('App routes', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('redirects root to login', () => {
    renderApp('/')
    expect(screen.getByRole('heading', { name: 'Acceso' })).toBeInTheDocument()
  })

  it('renders login page', () => {
    renderApp('/login')
    expect(screen.getByRole('heading', { name: 'Acceso' })).toBeInTheDocument()
  })

  it('renders register page', () => {
    renderApp('/register')
    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument()
  })

  it('renders forgot password page', () => {
    renderApp('/forgot-password')
    expect(screen.getByRole('heading', { name: 'Recuperar contraseña' })).toBeInTheDocument()
  })

  it('renders reset password page', () => {
    renderApp('/reset-password?token=test')
    expect(screen.getByRole('heading', { name: 'Nueva contraseña' })).toBeInTheDocument()
  })
})
