import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmDeleteModal from './ConfirmDeleteModal.jsx'

describe('ConfirmDeleteModal', () => {
  it('does not render when closed', () => {
    render(
      <ConfirmDeleteModal open={false} title="Eliminar" message="¿Seguro?" onCancel={vi.fn()} onConfirm={vi.fn()} />,
    )
    expect(screen.queryByText('Eliminar')).not.toBeInTheDocument()
  })

  it('renders and handles confirm/cancel', async () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    const user = userEvent.setup()

    render(
      <ConfirmDeleteModal
        open
        title="Eliminar hábito"
        message="Esta acción no se puede deshacer."
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByText('Eliminar hábito')).toBeInTheDocument()
    expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('closes on Escape', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()

    render(
      <ConfirmDeleteModal open title="Confirmar" message="Mensaje" onCancel={onCancel} onConfirm={vi.fn()} />,
    )

    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
