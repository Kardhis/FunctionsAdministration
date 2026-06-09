import { describe, expect, it, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw/server.js'
import { renderWithProviders } from '../../../test/test-utils.jsx'
import { resetTasksStore, seedTasksStore } from '../../../test/pageTestHelpers.js'
import TasksCalendarPage from './TasksCalendarPage.jsx'

const API = 'http://localhost:8080'

describe('TasksCalendarPage', () => {
  beforeEach(() => {
    resetTasksStore()
    seedTasksStore()
  })

  it('renders week calendar controls', async () => {
    renderWithProviders(<TasksCalendarPage />)
    expect(screen.getByRole('button', { name: 'Setmana' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Avui' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByText('Carregant…')).not.toBeInTheDocument()
    })
  })

  it('switches to month view', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TasksCalendarPage />)
    await waitFor(() => expect(screen.queryByText('Carregant…')).not.toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Mes' }))
    expect(screen.getByRole('button', { name: 'Mes' }).className).toMatch(/accent/)
  })

  it('shows calendar tasks', async () => {
    server.use(
      http.get(`${API}/api/tasks/calendar`, () =>
        HttpResponse.json([
          {
            id: 3,
            title: 'Calendari task',
            status: 'PLANIFICADA',
            plannedDate: '2026-06-08',
            plannedTime: '10:00:00',
          },
        ]),
      ),
    )
    renderWithProviders(<TasksCalendarPage />)
    await waitFor(() => {
      expect(screen.getByText('Calendari task')).toBeInTheDocument()
    })
  })
})
