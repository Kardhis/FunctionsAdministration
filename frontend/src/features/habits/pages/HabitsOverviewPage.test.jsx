import { describe, expect, it, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../test/test-utils.jsx'
import { seedHabitsStore } from '../../../test/pageTestHelpers.js'
import HabitsOverviewPage from './HabitsOverviewPage.jsx'

describe('HabitsOverviewPage', () => {
  beforeEach(() => {
    seedHabitsStore({
      entries: [
        {
          id: 'e1',
          habitId: 'h1',
          date: new Date().toISOString().slice(0, 10),
          durationMinutes: 45,
          startTime: '09:00',
          endTime: '09:45',
        },
      ],
    })
  })

  it('renders overview dashboard cards', async () => {
    renderWithProviders(<HabitsOverviewPage />)
    expect(screen.getByText('Tiempo hoy')).toBeInTheDocument()
    expect(screen.getByText('Semana (resumen)')).toBeInTheDocument()
    expect(screen.getByText('Top hábito (semana)')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Objetivos en progreso')).toBeInTheDocument()
    })
  })

  it('recalculates percentages for date range', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HabitsOverviewPage />)
    await waitFor(() => expect(screen.getByText('Distribución del tiempo (%)')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Recalcular porcentajes' }))
    expect(screen.getByText('Distribución del tiempo (%)')).toBeInTheDocument()
  })
})
