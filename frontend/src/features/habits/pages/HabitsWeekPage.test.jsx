import { describe, expect, it, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/test-utils.jsx'
import { seedHabitsStore } from '../../../test/pageTestHelpers.js'
import HabitsWeekPage from './HabitsWeekPage.jsx'

describe('HabitsWeekPage', () => {
  beforeEach(() => {
    seedHabitsStore({
      entries: [
        {
          id: 'e1',
          habitId: 'h1',
          date: new Date().toISOString().slice(0, 10),
          durationMinutes: 20,
          startTime: '07:00',
          endTime: '07:20',
        },
      ],
    })
  })

  it('renders weekly view', () => {
    renderWithProviders(<HabitsWeekPage />)
    expect(screen.getByText('Vista semanal')).toBeInTheDocument()
    expect(screen.getAllByText('Correr').length).toBeGreaterThan(0)
  })
})
