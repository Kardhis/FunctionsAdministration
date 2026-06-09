import { describe, expect, it, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../test/test-utils.jsx'
import { seedHabitsStore } from '../../../test/pageTestHelpers.js'
import ObjectivesPage from './ObjectivesPage.jsx'

describe('ObjectivesPage', () => {
  beforeEach(() => {
    seedHabitsStore()
  })

  it('renders objectives list header', async () => {
    renderWithProviders(<ObjectivesPage />)
    expect(screen.getByText('Objetivos')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Listado y filtros (por defecto: en progreso).')).toBeInTheDocument()
    })
  })

  it('opens create objective modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ObjectivesPage />)
    await waitFor(() => expect(screen.getByText('Objetivos')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Nuevo objetivo' }))
    expect(screen.getAllByText('Nuevo objetivo').length).toBeGreaterThan(1)
  })
})
