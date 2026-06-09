import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminRoute from './AdminRoute.jsx'

const useAuthMock = vi.fn()

vi.mock('../auth/AuthContext.jsx', () => ({
  useAuth: () => useAuthMock(),
}))

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <p>Admin panel</p>
            </AdminRoute>
          }
        />
        <Route path="/login" element={<p>Login page</p>} />
        <Route path="/dashboard" element={<p>Dashboard</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminRoute', () => {
  it('renders nothing while loading', () => {
    useAuthMock.mockReturnValue({ status: 'loading', roles: [] })
    const { container } = renderAdminRoute()
    expect(container).toBeEmptyDOMElement()
  })

  it('redirects unauthenticated users to login', () => {
    useAuthMock.mockReturnValue({ status: 'unauthenticated', roles: [] })
    renderAdminRoute()
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('redirects non-admin users to dashboard', () => {
    useAuthMock.mockReturnValue({ status: 'authenticated', roles: ['USER'] })
    renderAdminRoute()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders children for admin users', () => {
    useAuthMock.mockReturnValue({ status: 'authenticated', roles: ['ADMIN'] })
    renderAdminRoute()
    expect(screen.getByText('Admin panel')).toBeInTheDocument()
  })
})
