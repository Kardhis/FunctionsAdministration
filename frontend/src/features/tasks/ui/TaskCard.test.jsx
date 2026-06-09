import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskCard from './TaskCard.jsx'

const baseTask = {
  id: 1,
  title: 'Revisar informe',
  description: 'Detall breu',
  status: 'PENDIENTE',
  overdue: false,
  recurring: false,
  important: true,
  urgent: false,
  dueDate: '2026-12-31',
  plannedDate: '2026-06-08',
  plannedTime: '09:30:00',
}

describe('TaskCard', () => {
  it('renders task title and status badge', () => {
    render(<TaskCard task={baseTask} />)
    expect(screen.getByText('Revisar informe')).toBeInTheDocument()
    expect(screen.getByText('Pendent')).toBeInTheDocument()
    expect(screen.getByText('Important')).toBeInTheDocument()
  })

  it('shows overdue badge when task is overdue', () => {
    render(<TaskCard task={{ ...baseTask, overdue: true }} />)
    expect(screen.getByText('Vencuda')).toBeInTheDocument()
  })

  it('calls action handlers from buttons', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onComplete = vi.fn()
    const onDelete = vi.fn()

    render(
      <TaskCard
        task={baseTask}
        onEdit={onEdit}
        onComplete={onComplete}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    await user.click(screen.getByRole('button', { name: 'Completar' }))
    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(onEdit).toHaveBeenCalledWith(baseTask)
    expect(onComplete).toHaveBeenCalledWith(baseTask)
    expect(onDelete).toHaveBeenCalledWith(baseTask)
  })

  it('hides action bar in compact mode', () => {
    render(<TaskCard task={baseTask} onEdit={vi.fn()} compact />)
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })
})
