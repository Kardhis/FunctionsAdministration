import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../test/test-utils.jsx'
import { resetTasksStore } from '../../test/pageTestHelpers.js'
import TasksAppLayout from './TasksAppLayout.jsx'

const useAuthMock = vi.fn()

vi.mock('../../auth/AuthContext.jsx', () => ({
  useAuth: () => useAuthMock(),
}))

describe('TasksAppLayout', () => {
  beforeEach(() => {
    resetTasksStore()
    useAuthMock.mockReturnValue({
      status: 'authenticated',
      user: 'user@example.com',
      roles: ['USER'],
    })
  })

  it('renders module navigation and bootstraps store data', async () => {
    renderWithProviders(<TasksAppLayout />, { route: '/dashboard/tasks/list' })

    expect(screen.getByText('Mòdul')).toBeInTheDocument()
    expect(screen.getByText('Totes les tasques')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tasques' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Avui' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Gestió')).toBeInTheDocument()
    })
  })
})
