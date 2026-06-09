import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardOverviewPage from './DashboardOverviewPage.jsx'

describe('DashboardOverviewPage', () => {
  it('renders metrics and module cards', () => {
    render(
      <MemoryRouter>
        <DashboardOverviewPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Hábitos activos')).toBeInTheDocument()
    expect(screen.getByText('Gestión de hábitos')).toBeInTheDocument()
    expect(screen.getByText('Gestión de hábitos')).toBeInTheDocument()
    expect(screen.getAllByRole('link').some((a) => a.getAttribute('href') === '/dashboard/habits/overview')).toBe(
      true,
    )
  })
})
