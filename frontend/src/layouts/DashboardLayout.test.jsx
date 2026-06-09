import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext.jsx'
import DashboardLayout from './DashboardLayout.jsx'

function renderLayout(route = '/dashboard/habits/overview') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <Routes>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="habits/overview" element={<div>Child content</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('DashboardLayout', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/dashboard/habits/overview')
  })

  it('renders sidebar and outlet content', async () => {
    renderLayout()
    await waitFor(() => {
      expect(screen.getByText('Child content')).toBeInTheDocument()
    })
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
  })

  it('opens mobile navigation drawer', async () => {
    const user = userEvent.setup()
    renderLayout()
    const menuBtn = screen.getByRole('button', { name: 'Abrir menú' })
    await user.click(menuBtn)
    expect(screen.getByRole('dialog', { name: 'Menú principal' })).toBeInTheDocument()
  })
})
