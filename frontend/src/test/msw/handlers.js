import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8080'

export const emptyPagedTasks = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: 25,
  first: true,
  last: true,
}

export const emptyTodayTasks = {
  plannedToday: [],
  overdue: [],
  importantUnplanned: [],
}

export const emptyEisenhower = {
  importantUrgent: [],
  importantNotUrgent: [],
  notImportantUrgent: [],
  notImportantNotUrgent: [],
  unclassified: [],
}

export const sampleTask = {
  id: 1,
  title: 'Revisar informe',
  description: 'Detall breu',
  status: 'PENDIENTE',
  overdue: false,
  recurring: false,
  important: true,
  urgent: false,
  dueDate: '2026-12-31',
  plannedDate: '2026-06-08',
  plannedTime: '09:30:00',
}

export const sampleHabit = {
  id: 'h1',
  name: 'Correr',
  color: '#3b82f6',
  active: true,
  categoryIds: [],
}

export const sampleAdminUser = {
  id: 1,
  email: 'user@example.com',
  displayName: 'Usuario',
  active: true,
  roles: ['USER'],
}

export const handlers = [
  http.get(`${API}/health`, () => HttpResponse.json({ status: 'ok' })),

  http.get(`${API}/auth/me`, () =>
    HttpResponse.json({ user: 'user@example.com', roles: ['USER'] }),
  ),
  http.post(`${API}/auth/login`, async () => HttpResponse.json({ message: 'login_ok' })),
  http.post(`${API}/auth/logout`, async () => HttpResponse.json({ message: 'logout_ok' })),
  http.post(`${API}/auth/register`, async () => HttpResponse.json({ message: 'registered' })),
  http.post(`${API}/auth/forgot-password`, async () =>
    HttpResponse.json({ message: 'Si el correo está registrado, recibirás un enlace.' }),
  ),
  http.post(`${API}/auth/reset-password`, async () => HttpResponse.json({ message: 'reset_ok' })),

  http.get(`${API}/api/tasks`, () => HttpResponse.json(emptyPagedTasks)),
  http.post(`${API}/api/tasks`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 99, ...body })
  }),
  http.get(`${API}/api/tasks/:id`, ({ params }) =>
    HttpResponse.json({ ...sampleTask, id: Number(params.id) }),
  ),
  http.put(`${API}/api/tasks/:id`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: Number(params.id), ...body })
  }),
  http.delete(`${API}/api/tasks/:id`, () => new HttpResponse(null, { status: 204 })),
  http.post(`${API}/api/tasks/:id/complete`, ({ params }) =>
    HttpResponse.json({ ...sampleTask, id: Number(params.id), status: 'COMPLETADA' }),
  ),
  http.post(`${API}/api/tasks/:id/cancel`, ({ params }) =>
    HttpResponse.json({ ...sampleTask, id: Number(params.id), status: 'CANCELADA' }),
  ),
  http.post(`${API}/api/tasks/:id/start`, ({ params }) =>
    HttpResponse.json({ ...sampleTask, id: Number(params.id), status: 'EN_PROGRESO' }),
  ),
  http.post(`${API}/api/tasks/:id/block`, ({ params }) =>
    HttpResponse.json({ ...sampleTask, id: Number(params.id), status: 'BLOQUEADA' }),
  ),
  http.post(`${API}/api/tasks/:id/reopen`, ({ params }) =>
    HttpResponse.json({ ...sampleTask, id: Number(params.id), status: 'PENDIENTE' }),
  ),
  http.post(`${API}/api/tasks/:id/duplicate`, ({ params }) =>
    HttpResponse.json({ ...sampleTask, id: Number(params.id) + 100 }),
  ),
  http.post(`${API}/api/tasks/:id/schedule`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({ ...sampleTask, id: Number(params.id), ...body })
  }),
  http.post(`${API}/api/tasks/:id/classify`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({ ...sampleTask, id: Number(params.id), ...body })
  }),
  http.get(`${API}/api/tasks/today`, () => HttpResponse.json(emptyTodayTasks)),
  http.get(`${API}/api/tasks/eisenhower`, () => HttpResponse.json(emptyEisenhower)),
  http.get(`${API}/api/tasks/calendar`, () => HttpResponse.json([])),
  http.get(`${API}/api/tasks/backlog`, () => HttpResponse.json(emptyPagedTasks)),
  http.get(`${API}/api/tasks/search`, () => HttpResponse.json([])),

  http.get(`${API}/api/task-projects`, () => HttpResponse.json([])),
  http.post(`${API}/api/task-projects`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 1, ...body })
  }),
  http.put(`${API}/api/task-projects/:id`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: Number(params.id), ...body })
  }),
  http.delete(`${API}/api/task-projects/:id`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/api/task-categories`, () => HttpResponse.json([])),
  http.post(`${API}/api/task-categories`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 1, ...body })
  }),
  http.put(`${API}/api/task-categories/:id`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: Number(params.id), ...body })
  }),
  http.delete(`${API}/api/task-categories/:id`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/api/task-statuses`, () => HttpResponse.json([])),

  http.get(`${API}/api/habits`, () => HttpResponse.json([sampleHabit])),
  http.post(`${API}/api/habits`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 'h-new', ...body })
  }),
  http.put(`${API}/api/habits/:id`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: params.id, ...body })
  }),
  http.delete(`${API}/api/habits/:id`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/api/habit-entries`, () => HttpResponse.json([])),
  http.post(`${API}/api/habit-entries`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 'e1', durationMinutes: 30, ...body })
  }),
  http.put(`${API}/api/habit-entries/:id`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: params.id, ...body })
  }),
  http.delete(`${API}/api/habit-entries/:id`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/api/habit-categories`, () => HttpResponse.json([])),
  http.post(`${API}/api/habit-categories`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 'c1', ...body })
  }),
  http.put(`${API}/api/habit-categories/:id`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: params.id, ...body })
  }),
  http.delete(`${API}/api/habit-categories/:id`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/api/reminders`, () => HttpResponse.json([])),
  http.post(`${API}/api/reminders`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 'r1', ...body })
  }),
  http.put(`${API}/api/reminders/:id`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: params.id, ...body })
  }),

  http.get(`${API}/api/settings/:key`, ({ params }) =>
    HttpResponse.json({ value: params.key === 'theme' ? 'system' : false }),
  ),
  http.put(`${API}/api/settings/:key`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(body)
  }),

  http.get(`${API}/api/objectives`, () => HttpResponse.json([])),
  http.post(`${API}/api/objectives`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 'o1', status: 'IN_PROGRESS', ...body })
  }),
  http.put(`${API}/api/objectives/:id`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: params.id, ...body })
  }),
  http.delete(`${API}/api/objectives/:id`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/api/admin/users`, () => HttpResponse.json([sampleAdminUser])),
  http.get(`${API}/api/admin/roles`, () => HttpResponse.json(['USER', 'ADMIN'])),
  http.post(`${API}/api/admin/users`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 2, ...body })
  }),
  http.put(`${API}/api/admin/users/:id`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: Number(params.id), ...sampleAdminUser, ...body })
  }),
  http.put(`${API}/api/admin/users/:id/status`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({ ...sampleAdminUser, id: Number(params.id), active: body.active })
  }),
  http.put(`${API}/api/admin/users/:id/roles`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({ ...sampleAdminUser, id: Number(params.id), roles: body.roles })
  }),
  http.put(`${API}/api/admin/users/:id/password`, () => HttpResponse.json({ ok: true })),
  http.delete(`${API}/api/admin/users/:id`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/api/private`, () =>
    HttpResponse.json({ message: 'private_ok', user: 'user@example.com' }),
  ),

  http.get(`${API}/api/stats`, () =>
    HttpResponse.json({
      totalMinutes: 120,
      totalSessions: 4,
      byHabit: [{ habitId: 'h1', habitName: 'Correr', minutes: 120, sessions: 4 }],
    }),
  ),
]
