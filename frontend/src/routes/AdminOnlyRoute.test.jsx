import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminOnlyRoute from './AdminOnlyRoute.jsx'

const useAuthMock = vi.fn()

vi.mock('../auth/AuthContext.jsx', () => ({
  useAuth: () => useAuthMock(),
}))

function renderAdminOnlyRoute() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route
          path="/settings"
          element={
            <AdminOnlyRoute redirectTo="/app">
              <p>Settings</p>
            </AdminOnlyRoute>
          }
        />
        <Route path="/login" element={<p>Login page</p>} />
        <Route path="/app" element={<p>App home</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminOnlyRoute', () => {
  it('shows loading state while auth is loading', () => {
    useAuthMock.mockReturnValue({ status: 'loading', roles: [] })
    renderAdminOnlyRoute()
    expect(screen.getByText(/Comprobando sesión/)).toBeInTheDocument()
  })

  it('redirects unauthenticated users to login', () => {
    useAuthMock.mockReturnValue({ status: 'unauthenticated', roles: [] })
    renderAdminOnlyRoute()
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('redirects non-admin users to custom path', () => {
    useAuthMock.mockReturnValue({ status: 'authenticated', roles: ['USER'] })
    renderAdminOnlyRoute()
    expect(screen.getByText('App home')).toBeInTheDocument()
  })

  it('renders children for admin users', () => {
    useAuthMock.mockReturnValue({ status: 'authenticated', roles: ['ADMIN'] })
    renderAdminOnlyRoute()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })
})
