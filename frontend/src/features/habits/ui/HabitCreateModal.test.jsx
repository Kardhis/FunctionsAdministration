import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HabitCreateModal from './HabitCreateModal.jsx'

describe('HabitCreateModal', () => {
  it('renders create habit form', async () => {
    const onClose = vi.fn()
    const onCreated = vi.fn()
    const user = userEvent.setup()

    render(<HabitCreateModal open onClose={onClose} onCreated={onCreated} />)

    expect(screen.getByText('Nuevo hábito')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
