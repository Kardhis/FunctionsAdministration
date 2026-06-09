import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw/server.js'
import { listTaskStatuses } from './taskStatusesRepo.js'

const API = 'http://localhost:8080'

describe('taskStatusesRepo', () => {
  it('listTaskStatuses fetches task statuses', async () => {
    server.use(
      http.get(`${API}/api/task-statuses`, () =>
        HttpResponse.json([{ code: 'PENDIENTE', label: 'Pendent' }]),
      ),
    )
    const statuses = await listTaskStatuses()
    expect(statuses).toHaveLength(1)
    expect(statuses[0].code).toBe('PENDIENTE')
  })
})
