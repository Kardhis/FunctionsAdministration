import { describe, expect, it, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw/server.js'
import { renderWithProviders } from '../../../test/test-utils.jsx'
import { resetTasksStore, seedTasksStore } from '../../../test/pageTestHelpers.js'
import { emptyTodayTasks, sampleTask } from '../../../test/msw/handlers.js'
import TasksTodayPage from './TasksTodayPage.jsx'

const API = 'http://localhost:8080'

describe('TasksTodayPage', () => {
  beforeEach(() => {
    resetTasksStore()
    seedTasksStore()
    server.use(http.get(`${API}/api/tasks/today`, () => HttpResponse.json(emptyTodayTasks)))
  })

  it('renders today sections with empty state', async () => {
    renderWithProviders(<TasksTodayPage />)
    expect(screen.getByText('Foc diari')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Cap tasca planificada per avui.')).toBeInTheDocument()
    })
    expect(screen.getByText('Cap tasca vencuda.')).toBeInTheDocument()
  })

  it('shows planned tasks for today', async () => {
    server.use(
      http.get(`${API}/api/tasks/today`, () =>
        HttpResponse.json({
          ...emptyTodayTasks,
          plannedToday: [sampleTask],
        }),
      ),
    )
    renderWithProviders(<TasksTodayPage />)
    await waitFor(() => {
      expect(screen.getByText('Revisar informe')).toBeInTheDocument()
    })
  })

  it('opens create modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TasksTodayPage />)
    await waitFor(() => expect(screen.getByText('Cap tasca planificada per avui.')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '+ Nova tasca' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
