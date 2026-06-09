import { describe, expect, it, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw/server.js'
import { renderWithProviders } from '../../../test/test-utils.jsx'
import { resetTasksStore, seedTasksStore } from '../../../test/pageTestHelpers.js'
import { emptyEisenhower } from '../../../test/msw/handlers.js'
import TasksEisenhowerPage from './TasksEisenhowerPage.jsx'

const API = 'http://localhost:8080'

describe('TasksEisenhowerPage', () => {
  beforeEach(() => {
    resetTasksStore()
    seedTasksStore()
  })

  it('renders Eisenhower quadrants', async () => {
    renderWithProviders(<TasksEisenhowerPage />)
    expect(screen.getByText('Priorització')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getAllByText(/Cap tasca en aquest quadrant/).length).toBeGreaterThan(0)
    })
    expect(screen.getByLabelText('IMPORTANT I URGENT')).toBeInTheDocument()
    expect(screen.getByLabelText('IMPORTANT I NO URGENT')).toBeInTheDocument()
  })

  it('shows tasks in quadrant', async () => {
    server.use(
      http.get(`${API}/api/tasks/eisenhower`, () =>
        HttpResponse.json({
          ...emptyEisenhower,
          importantUrgent: [{ id: 2, title: 'Urgent task', status: 'PENDIENTE', important: true, urgent: true }],
        }),
      ),
    )
    renderWithProviders(<TasksEisenhowerPage />)
    await waitFor(() => {
      expect(screen.getByText('Urgent task')).toBeInTheDocument()
    })
  })
})
