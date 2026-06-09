import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskFormModal from './TaskFormModal.jsx'

describe('TaskFormModal', () => {
  it('does not render when closed', () => {
    render(
      <TaskFormModal
        open={false}
        mode="create"
        projects={[]}
        categories={[]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders create form and validates required title', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <TaskFormModal
        open
        mode="create"
        projects={[]}
        categories={[]}
        onClose={onClose}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Nova tasca')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Crear tasca' }))

    await waitFor(() => {
      expect(screen.getByText('El títol és obligatori')).toBeInTheDocument()
    })
  })

  it('submits valid form and closes on success', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSubmit = vi.fn().mockResolvedValue({ ok: true })

    render(
      <TaskFormModal
        open
        mode="create"
        projects={[]}
        categories={[]}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    )

    await user.type(screen.getByLabelText(/Títol/i), 'Nova tasca de prova')
    await user.click(screen.getByRole('button', { name: 'Crear tasca' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('closes on Escape key', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <TaskFormModal
        open
        mode="edit"
        initial={{ title: 'Existing', status: 'PENDIENTE' }}
        projects={[]}
        categories={[]}
        onClose={onClose}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Editar tasca')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
