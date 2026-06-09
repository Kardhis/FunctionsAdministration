import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LiveTimer from './LiveTimer.jsx'

const habits = [
  { id: 'h1', name: 'Correr', icon: '🏃', active: true },
  { id: 'h2', name: 'Leer', icon: '📚', active: true },
]

describe('LiveTimer', () => {
  it('renders timer UI with habit selector', () => {
    render(<LiveTimer habits={habits} onComplete={vi.fn()} />)
    expect(screen.getByText('Temporizador en vivo')).toBeInTheDocument()
    expect(screen.getByText('parado')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeInTheDocument()
  })

  it('starts timer and calls onComplete when stopped', async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(<LiveTimer habits={habits} onComplete={onComplete} />)
    await user.click(screen.getByRole('button', { name: 'Iniciar' }))
    expect(screen.getByText('en curso')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Parar y guardar' }))
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        habitId: 'h1',
        notes: 'Sesión con temporizador',
      }),
    )
    expect(screen.getByText('parado')).toBeInTheDocument()
  })
})
