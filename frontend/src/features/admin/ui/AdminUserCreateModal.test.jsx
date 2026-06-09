import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminUserCreateModal from './AdminUserCreateModal.jsx'

describe('AdminUserCreateModal', () => {
  it('renders form and calls onClose', async () => {
    const onClose = vi.fn()
    const onCreated = vi.fn()
    const user = userEvent.setup()

    render(
      <AdminUserCreateModal
        open
        onClose={onClose}
        onSubmit={onCreated}
        rolesCatalog={['USER', 'ADMIN']}
      />,
    )

    expect(screen.getByText('Crear Usuari')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
