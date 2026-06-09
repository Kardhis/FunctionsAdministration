import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw/server.js'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from './categoriesRepo.js'

const API = 'http://localhost:8080'

const category = {
  id: 'c1',
  name: 'Health',
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('categoriesRepo', () => {
  it('listCategories fetches categories', async () => {
    server.use(http.get(`${API}/api/habit-categories`, () => HttpResponse.json([category])))
    await expect(listCategories()).resolves.toEqual([category])
  })

  it('createCategory posts payload', async () => {
    server.use(http.post(`${API}/api/habit-categories`, () => HttpResponse.json(category)))
    await expect(createCategory(category)).resolves.toEqual(category)
  })

  it('updateCategory puts patch', async () => {
    server.use(
      http.put(`${API}/api/habit-categories/c1`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ ...category, ...body })
      }),
    )
    const updated = await updateCategory('c1', { name: 'Fitness' })
    expect(updated.name).toBe('Fitness')
  })

  it('deleteCategory calls DELETE', async () => {
    server.use(
      http.delete(`${API}/api/habit-categories/c1`, () => new HttpResponse(null, { status: 204 })),
    )
    await expect(deleteCategory('c1')).resolves.toBeNull()
  })
})
