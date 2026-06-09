import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SidebarPanel from './SidebarPanel.jsx'
import { dashboardNav } from '../data/dashboardMock.js'

const baseProps = {
  location: { pathname: '/dashboard/habits/overview', search: '', hash: '', state: null, key: 'default' },
  isCollapsed: false,
  onToggleCollapse: vi.fn(),
  mobileDrawer: false,
  onCloseMobile: vi.fn(),
  displayName: 'Test User',
  email: 'user@example.com',
  navId: 'sidebar-nav',
  navItems: dashboardNav,
  onLogout: vi.fn(),
}

describe('SidebarPanel', () => {
  it('renders user info and navigation', () => {
    render(
      <MemoryRouter>
        <SidebarPanel {...baseProps} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('user@example.com')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
  })

  it('calls onToggleCollapse when collapse button clicked', async () => {
    const onToggleCollapse = vi.fn()
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <SidebarPanel {...baseProps} onToggleCollapse={onToggleCollapse} />
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: 'Colapsar sidebar' }))
    expect(onToggleCollapse).toHaveBeenCalled()
  })

  it('calls onLogout from logout button', async () => {
    const onLogout = vi.fn()
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <SidebarPanel {...baseProps} onLogout={onLogout} />
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: 'Logout' }))
    expect(onLogout).toHaveBeenCalled()
  })
})
