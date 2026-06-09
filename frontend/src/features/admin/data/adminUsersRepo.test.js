import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw/server.js'
import {
  createUser,
  deleteUser,
  listRoles,
  listUsers,
  updateUserBasics,
  updateUserPassword,
  updateUserRoles,
  updateUserStatus,
} from './adminUsersRepo.js'

const API = 'http://localhost:8080'

const user = {
  id: 1,
  email: 'admin@example.com',
  displayName: 'Admin',
  active: true,
  roles: ['ADMIN'],
}

describe('adminUsersRepo', () => {
  it('listUsers and listRoles fetch admin data', async () => {
    server.use(
      http.get(`${API}/api/admin/users`, () => HttpResponse.json([user])),
      http.get(`${API}/api/admin/roles`, () => HttpResponse.json(['USER', 'ADMIN'])),
    )
    await expect(listUsers()).resolves.toEqual([user])
    await expect(listRoles()).resolves.toEqual(['USER', 'ADMIN'])
  })

  it('createUser posts new user', async () => {
    server.use(
      http.post(`${API}/api/admin/users`, async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 2, ...body })
      }),
    )
    const created = await createUser({
      email: 'new@example.com',
      password: 'secret',
      displayName: 'New',
      active: true,
      roles: ['USER'],
    })
    expect(created.email).toBe('new@example.com')
  })

  it('updateUserBasics, status, roles and password call PUT endpoints', async () => {
    server.use(
      http.put(`${API}/api/admin/users/1`, () => HttpResponse.json(user)),
      http.put(`${API}/api/admin/users/1/status`, () => HttpResponse.json({ ...user, active: false })),
      http.put(`${API}/api/admin/users/1/roles`, () => HttpResponse.json(user)),
      http.put(`${API}/api/admin/users/1/password`, () => HttpResponse.json({ ok: true })),
    )
    await expect(updateUserBasics(1, { displayName: 'Admin' })).resolves.toEqual(user)
    await expect(updateUserStatus(1, false)).resolves.toMatchObject({ active: false })
    await expect(updateUserRoles(1, ['ADMIN'])).resolves.toEqual(user)
    await expect(updateUserPassword(1, 'new-pass')).resolves.toEqual({ ok: true })
  })

  it('deleteUser calls DELETE', async () => {
    server.use(
      http.delete(`${API}/api/admin/users/1`, () => new HttpResponse(null, { status: 204 })),
    )
    await expect(deleteUser(1)).resolves.toBeNull()
  })
})
