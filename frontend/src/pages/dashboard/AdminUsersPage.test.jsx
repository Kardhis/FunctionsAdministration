import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/test-utils.jsx'
import AdminUsersPage from './AdminUsersPage.jsx'

describe('AdminUsersPage', () => {
  it('renders users table with data from API', async () => {
    renderWithProviders(<AdminUsersPage />)
    expect(screen.getByText('Administració · Usuaris')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getAllByText('user@example.com').length).toBeGreaterThan(0)
    })
    expect(screen.getAllByText('USER').length).toBeGreaterThan(0)
  })

  it('opens create user modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AdminUsersPage />)
    await waitFor(() => expect(screen.getAllByText('user@example.com').length).toBeGreaterThan(0))
    await user.click(screen.getByRole('button', { name: 'Crear Usuari' }))
    expect(screen.getAllByText('Crear Usuari').length).toBeGreaterThan(1)
  })
})
