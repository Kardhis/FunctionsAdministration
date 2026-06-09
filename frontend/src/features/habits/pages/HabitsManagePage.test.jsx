import { describe, expect, it, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../test/test-utils.jsx'
import { seedHabitsStore } from '../../../test/pageTestHelpers.js'
import HabitsManagePage from './HabitsManagePage.jsx'

describe('HabitsManagePage', () => {
  beforeEach(() => {
    seedHabitsStore({
      categories: [{ id: 'c1', name: 'Salud', active: true, color: '#22c55e' }],
    })
  })

  it('renders habits and categories lists', () => {
    renderWithProviders(<HabitsManagePage />)
    expect(screen.getByText('Listado')).toBeInTheDocument()
    expect(screen.getAllByText('Correr').length).toBeGreaterThan(0)
    expect(screen.getByText('Categorías')).toBeInTheDocument()
    expect(screen.getAllByText('Salud').length).toBeGreaterThan(0)
  })

  it('opens create habit flow button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HabitsManagePage />)
    await user.click(screen.getByRole('button', { name: 'Nuevo hábito' }))
    expect(screen.getAllByText('Nuevo hábito').length).toBeGreaterThan(1)
  })
})
