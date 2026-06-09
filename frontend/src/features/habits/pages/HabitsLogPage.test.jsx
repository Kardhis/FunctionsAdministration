import { describe, expect, it, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../test/test-utils.jsx'
import { seedHabitsStore } from '../../../test/pageTestHelpers.js'
import HabitsLogPage from './HabitsLogPage.jsx'

describe('HabitsLogPage', () => {
  beforeEach(() => {
    seedHabitsStore({
      entries: [
        {
          id: 'e1',
          habitId: 'h1',
          date: new Date().toISOString().slice(0, 10),
          durationMinutes: 30,
          startTime: '08:00',
          endTime: '08:30',
        },
      ],
    })
  })

  it('renders log section and live timer', () => {
    renderWithProviders(<HabitsLogPage />)
    expect(screen.getByText('Registros')).toBeInTheDocument()
    expect(screen.getByText('Temporizador en vivo')).toBeInTheDocument()
    expect(screen.getAllByText('Correr').length).toBeGreaterThan(0)
  })

  it('opens new entry modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HabitsLogPage />)
    await user.click(screen.getByRole('button', { name: 'Nuevo registro' }))
    expect(screen.getAllByText('Nuevo registro').length).toBeGreaterThan(1)
  })
})
