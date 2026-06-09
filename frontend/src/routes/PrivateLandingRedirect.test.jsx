import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PrivateLandingRedirect from './PrivateLandingRedirect.jsx'

const useAuthMock = vi.fn()

vi.mock('../auth/AuthContext.jsx', () => ({
  useAuth: () => useAuthMock(),
}))

function renderRedirect(initialPath = '/private') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/private" element={<PrivateLandingRedirect />} />
        <Route path="/login" element={<p>Login destination</p>} />
        <Route path="/dashboard" element={<p>Dashboard destination</p>} />
        <Route path="/dashboard/habits/overview" element={<p>Habits overview destination</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PrivateLandingRedirect', () => {
  it('shows loading state while auth is loading', () => {
    useAuthMock.mockReturnValue({ status: 'loading', roles: [] })
    renderRedirect()
    expect(screen.getByText('Comprobando sesión...')).toBeInTheDocument()
  })

  it('redirects unauthenticated users to login', () => {
    useAuthMock.mockReturnValue({ status: 'unauthenticated', roles: [] })
    renderRedirect()
    expect(screen.getByText('Login destination')).toBeInTheDocument()
  })

  it('redirects admin users to dashboard', () => {
    useAuthMock.mockReturnValue({ status: 'authenticated', roles: ['ADMIN'] })
    renderRedirect()
    expect(screen.getByText('Dashboard destination')).toBeInTheDocument()
  })

  it('redirects regular users to habits overview', () => {
    useAuthMock.mockReturnValue({ status: 'authenticated', roles: ['USER'] })
    renderRedirect()
    expect(screen.getByText('Habits overview destination')).toBeInTheDocument()
  })
})
