import { describe, expect, it, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/test-utils.jsx'
import { seedHabitsStore } from '../../../test/pageTestHelpers.js'
import HabitsStatsPage from './HabitsStatsPage.jsx'

describe('HabitsStatsPage', () => {
  beforeEach(() => {
    seedHabitsStore({
      entries: [
        {
          id: 'e1',
          habitId: 'h1',
          date: new Date().toISOString().slice(0, 10),
          durationMinutes: 60,
          startTime: '10:00',
          endTime: '11:00',
        },
      ],
    })
  })

  it('renders stats filters and charts section', () => {
    renderWithProviders(<HabitsStatsPage />)
    expect(screen.getByText('Filtros')).toBeInTheDocument()
    expect(screen.getByText('Comparativa semanal')).toBeInTheDocument()
    expect(screen.getByText('Comparativa mensual')).toBeInTheDocument()
  })
})
