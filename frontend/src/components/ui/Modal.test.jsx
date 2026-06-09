import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from './Modal.jsx'

describe('Modal', () => {
  it('does not render when closed', () => {
    render(
      <Modal open={false} onClose={vi.fn()}>
        <p>Content</p>
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders children and locks body scroll when open', () => {
    document.body.style.overflow = ''
    render(
      <Modal open onClose={vi.fn()} label="Test modal">
        <button type="button">Inside</button>
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: 'Test modal' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inside' })).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('calls onClose from backdrop and Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Modal open onClose={onClose} label="Closable">
        <p>Body</p>
      </Modal>,
    )

    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    onClose.mockClear()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
