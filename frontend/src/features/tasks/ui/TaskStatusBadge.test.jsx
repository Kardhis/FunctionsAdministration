import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import TaskStatusBadge from './TaskStatusBadge.jsx'

describe('TaskStatusBadge', () => {
  it('renders status label for known status', () => {
    render(<TaskStatusBadge status="PENDIENTE" />)
    expect(screen.getByText('Pendent')).toBeInTheDocument()
  })

  it('renders completed status with success tone class', () => {
    const { container } = render(<TaskStatusBadge status="COMPLETADA" />)
    expect(screen.getByText('Completada')).toBeInTheDocument()
    expect(container.firstChild.className).toMatch(/success/)
  })

  it('falls back to raw status for unknown values', () => {
    render(<TaskStatusBadge status="CUSTOM" />)
    expect(screen.getByText('CUSTOM')).toBeInTheDocument()
  })
})
