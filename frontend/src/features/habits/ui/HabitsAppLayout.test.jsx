import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../../../test/test-utils.jsx'
import { seedHabitsStore } from '../../../test/pageTestHelpers.js'
import HabitsAppLayout from './HabitsAppLayout.jsx'
import HabitsOverviewPage from '../pages/HabitsOverviewPage.jsx'

const useAuthMock = vi.fn()

vi.mock('../../../auth/AuthContext.jsx', () => ({
  useAuth: () => useAuthMock(),
}))

describe('HabitsAppLayout', () => {
  beforeEach(() => {
    seedHabitsStore()
    useAuthMock.mockReturnValue({
      status: 'authenticated',
      user: 'user@example.com',
      roles: ['USER'],
    })
  })

  it('renders habits navigation and outlet', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/dashboard/habits" element={<HabitsAppLayout />}>
          <Route path="overview" element={<HabitsOverviewPage />} />
        </Route>
      </Routes>,
      { route: '/dashboard/habits/overview' },
    )

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Registros' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Tiempo hoy')).toBeInTheDocument()
    })
  })
})
