import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import DailyLogPage from './DailyLogPage.jsx'

describe('DailyLogPage', () => {
  it('renders daily log sections', () => {
    render(<DailyLogPage />)
    expect(screen.getByRole('heading', { name: /registro diario/i })).toBeInTheDocument()
  })
})
