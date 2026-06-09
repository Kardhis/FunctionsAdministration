import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.jsx'

const useAuthMock = vi.fn()

vi.mock('../auth/AuthContext.jsx', () => ({
  useAuth: () => useAuthMock(),
}))

function renderProtected(initialPath = '/private') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/private"
          element={
            <ProtectedRoute>
              <p>Private content</p>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('shows loading state while auth is loading', () => {
    useAuthMock.mockReturnValue({ status: 'loading' })
    renderProtected()
    expect(screen.getByRole('status')).toHaveTextContent(/Comprobando sesión/)
  })

  it('redirects unauthenticated users to login', () => {
    useAuthMock.mockReturnValue({ status: 'unauthenticated' })
    renderProtected()
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    useAuthMock.mockReturnValue({ status: 'authenticated' })
    renderProtected()
    expect(screen.getByText('Private content')).toBeInTheDocument()
  })
})
