import { describe, expect, it, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw/server.js'
import { renderWithProviders } from '../../../test/test-utils.jsx'
import { resetTasksStore, seedTasksStore } from '../../../test/pageTestHelpers.js'
import { emptyPagedTasks, sampleTask } from '../../../test/msw/handlers.js'
import TasksListPage from './TasksListPage.jsx'

const API = 'http://localhost:8080'

describe('TasksListPage', () => {
  beforeEach(() => {
    resetTasksStore()
    seedTasksStore({
      projects: [{ id: 1, name: 'Proyecto A', color: '#f00' }],
      categories: [{ id: 2, name: 'Categoría B', color: '#0f0' }],
    })
  })

  it('renders list header and empty state', async () => {
    renderWithProviders(<TasksListPage />)
    expect(screen.getByText('Totes les tasques')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(/0\s+tasca/)).toBeInTheDocument()
    })
  })

  it('shows tasks from API', async () => {
    server.use(
      http.get(`${API}/api/tasks`, () =>
        HttpResponse.json({
          ...emptyPagedTasks,
          content: [sampleTask],
          totalElements: 1,
        }),
      ),
    )
    renderWithProviders(<TasksListPage />)
    await waitFor(() => {
      expect(screen.getAllByText('Revisar informe').length).toBeGreaterThan(0)
    })
    expect(screen.getByText(/1\s+tasca/)).toBeInTheDocument()
  })

  it('opens create modal from button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TasksListPage />)
    await waitFor(() => expect(screen.getByText(/0\s+tasca/)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '+ Nova tasca' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
