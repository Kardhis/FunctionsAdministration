import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from './Badge.jsx'

describe('Badge', () => {
  it('renders children with neutral tone by default', () => {
    const { container } = render(<Badge>Neutral</Badge>)
    expect(screen.getByText('Neutral')).toBeInTheDocument()
    expect(container.firstChild.className).toMatch(/neutral|white/)
  })

  it('applies tone classes', () => {
    const { container } = render(<Badge tone="success">OK</Badge>)
    expect(screen.getByText('OK')).toBeInTheDocument()
    expect(container.firstChild.className).toMatch(/success/)
  })

  it('forwards extra props', () => {
    render(<Badge data-testid="status-badge">Activo</Badge>)
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Activo')
  })
})
