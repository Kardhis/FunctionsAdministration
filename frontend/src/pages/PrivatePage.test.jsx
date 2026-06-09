import { describe, expect, it, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../test/msw/server.js'
import { renderWithProviders } from '../test/test-utils.jsx'
import PrivatePage from './PrivatePage.jsx'

const API = 'http://localhost:8080'

describe('PrivatePage', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/private')
  })

  it('loads private API data for authenticated user', async () => {
    server.use(
      http.get(`${API}/api/private`, () =>
        HttpResponse.json({ message: 'private_ok', user: 'user@example.com' }),
      ),
    )

    renderWithProviders(<PrivatePage />, { route: '/private', withAuth: true })

    await waitFor(() => {
      expect(screen.getByText(/private_ok/)).toBeInTheDocument()
    })
  })
})
