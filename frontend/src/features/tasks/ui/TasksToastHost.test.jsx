import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetTasksStore } from '../../../test/pageTestHelpers.js'
import { useTasksStore } from '../store/tasksStore.js'
import TasksToastHost from './TasksToastHost.jsx'

describe('TasksToastHost', () => {
  beforeEach(() => {
    resetTasksStore()
  })

  it('renders nothing when there are no toasts', () => {
    const { container } = render(<TasksToastHost />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders toasts and dismisses on close', async () => {
    useTasksStore.getState().addToast('Tasca creada correctament')
    useTasksStore.getState().addToast('Error de servidor', 'error')

    render(<TasksToastHost />)
    expect(screen.getByText('Tasca creada correctament')).toBeInTheDocument()
    expect(screen.getByText('Error de servidor')).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getAllByRole('button', { name: 'Tancar notificació' })[0])
    expect(screen.queryByText('Tasca creada correctament')).not.toBeInTheDocument()
    expect(screen.getByText('Error de servidor')).toBeInTheDocument()
  })
})
