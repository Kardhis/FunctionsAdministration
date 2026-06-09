import { describe, expect, it, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw/server.js'
import { renderWithProviders } from '../../../test/test-utils.jsx'
import { resetTasksStore, seedTasksStore } from '../../../test/pageTestHelpers.js'
import { emptyPagedTasks, sampleTask } from '../../../test/msw/handlers.js'
import TasksBacklogPage from './TasksBacklogPage.jsx'

const API = 'http://localhost:8080'

describe('TasksBacklogPage', () => {
  beforeEach(() => {
    resetTasksStore()
    seedTasksStore()
  })

  it('renders backlog header', async () => {
    renderWithProviders(<TasksBacklogPage />)
    expect(screen.getByText('Backlog')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(/0\s+tasca.*sense planificar/)).toBeInTheDocument()
    })
  })

  it('shows backlog tasks', async () => {
    server.use(
      http.get(`${API}/api/tasks/backlog`, () =>
        HttpResponse.json({
          ...emptyPagedTasks,
          content: [{ ...sampleTask, status: 'BACKLOG' }],
          totalElements: 1,
        }),
      ),
    )
    renderWithProviders(<TasksBacklogPage />)
    await waitFor(() => {
      expect(screen.getByText('Revisar informe')).toBeInTheDocument()
    })
  })

  it('opens create modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TasksBacklogPage />)
    await waitFor(() => expect(screen.getByText('El backlog és buit. Totes les tasques estan planificades.')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '+ Nova tasca' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
