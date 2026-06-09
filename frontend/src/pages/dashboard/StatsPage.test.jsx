import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import StatsPage from './StatsPage.jsx'

describe('StatsPage', () => {
  it('renders stats placeholder', async () => {
    render(<StatsPage />)
    expect(screen.getByRole('heading', { name: /estadísticas/i })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })
  })
})
