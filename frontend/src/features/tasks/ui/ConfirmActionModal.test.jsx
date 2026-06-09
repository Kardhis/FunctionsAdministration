import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmActionModal from './ConfirmActionModal.jsx'

describe('ConfirmActionModal', () => {
  it('does not render when closed', () => {
    render(
      <ConfirmActionModal
        open={false}
        title="Eliminar"
        message="Segur?"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog and handles actions', async () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    const user = userEvent.setup()

    render(
      <ConfirmActionModal
        open
        title="Eliminar tasca"
        message="Segur que vols eliminar?"
        confirmLabel="Eliminar"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Eliminar tasca')).toBeInTheDocument()
    expect(screen.getByText('Segur que vols eliminar?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel·lar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('closes on Escape key', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()

    render(
      <ConfirmActionModal
        open
        title="Confirmar"
        message="Missatge"
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />,
    )

    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
