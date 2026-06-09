import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import CalendarPage from './CalendarPage.jsx'

describe('CalendarPage', () => {
  it('renders calendar section', () => {
    render(<CalendarPage />)
    expect(screen.getByRole('heading', { name: /calendario/i })).toBeInTheDocument()
  })
})
