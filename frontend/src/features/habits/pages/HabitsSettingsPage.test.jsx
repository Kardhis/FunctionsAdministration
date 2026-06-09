import { describe, expect, it, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../test/test-utils.jsx'
import { seedHabitsStore } from '../../../test/pageTestHelpers.js'
import HabitsSettingsPage from './HabitsSettingsPage.jsx'

describe('HabitsSettingsPage', () => {
  beforeEach(() => {
    seedHabitsStore({
      settings: { enforceNoOverlap: false, theme: 'system' },
    })
  })

  it('renders settings sections', () => {
    renderWithProviders(<HabitsSettingsPage />)
    expect(screen.getByText('Validación')).toBeInTheDocument()
    expect(screen.getByText('Tema')).toBeInTheDocument()
    expect(screen.getByText('Exportación')).toBeInTheDocument()
  })

  it('toggles overlap validation', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HabitsSettingsPage />)
    const toggle = screen.getByRole('checkbox', { name: /Evitar solapes/i })
    await user.click(toggle)
    expect(toggle).toBeChecked()
  })
})
