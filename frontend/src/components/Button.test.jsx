import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button.jsx'

describe('Button', () => {
  it('renders as button by default', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={onClick}>Guardar</Button>)
    const btn = screen.getByRole('button', { name: 'Guardar' })
    expect(btn).toBeInTheDocument()
    await user.click(btn)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('supports variant and size classes', () => {
    render(
      <Button variant="danger" size="sm" disabled>
        Eliminar
      </Button>,
    )
    const btn = screen.getByRole('button', { name: 'Eliminar' })
    expect(btn).toBeDisabled()
    expect(btn.className).toMatch(/danger/)
  })

  it('can render as custom element via as prop', () => {
    render(
      <Button as="a" href="/dashboard">
        Ir al panel
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Ir al panel' })
    expect(link).toHaveAttribute('href', '/dashboard')
  })
})
