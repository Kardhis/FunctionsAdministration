import { apiFetch } from '../../../data/api.js'

/** @param {object} params */
export async function listTasks({
  status,
  includeAll,
  projectId,
  categoryId,
  important,
  urgent,
  recurring,
  q,
  page = 0,
  size = 25,
} = {}) {
  const params = new URLSearchParams()
  if (status)                        params.set('status', status)
  if (includeAll)                    params.set('includeAll', 'true')
  if (projectId != null)             params.set('projectId', projectId)
  if (categoryId != null)            params.set('categoryId', categoryId)
  if (important != null)             params.set('important', important)
  if (urgent != null)                params.set('urgent', urgent)
  if (recurring != null)             params.set('recurring', recurring)
  if (q)                             params.set('q', q)
  params.set('page', page)
  params.set('size', size)
  const qs = params.toString()
  return apiFetch(`/api/tasks${qs ? `?${qs}` : ''}`)
}

/** @param {object} data */
export async function createTask(data) {
  return apiFetch('/api/tasks', { method: 'POST', body: data })
}

/** @param {number} id */
export async function getTask(id) {
  return apiFetch(`/api/tasks/${id}`)
}

/** @param {number} id @param {object} data */
export async function updateTask(id, data) {
  return apiFetch(`/api/tasks/${id}`, { method: 'PUT', body: data })
}

/** @param {number} id */
export async function deleteTask(id) {
  return apiFetch(`/api/tasks/${id}`, { method: 'DELETE' })
}

/** @param {number} id */
export async function duplicateTask(id) {
  return apiFetch(`/api/tasks/${id}/duplicate`, { method: 'POST' })
}

/** @param {number} id */
export async function completeTask(id) {
  return apiFetch(`/api/tasks/${id}/complete`, { method: 'POST' })
}

/** @param {number} id */
export async function cancelTask(id) {
  return apiFetch(`/api/tasks/${id}/cancel`, { method: 'POST' })
}

/** @param {number} id */
export async function startTask(id) {
  return apiFetch(`/api/tasks/${id}/start`, { method: 'POST' })
}

/** @param {number} id */
export async function blockTask(id) {
  return apiFetch(`/api/tasks/${id}/block`, { method: 'POST' })
}

/** @param {number} id */
export async function reopenTask(id) {
  return apiFetch(`/api/tasks/${id}/reopen`, { method: 'POST' })
}

/**
 * @param {number} id
 * @param {{ plannedDate: string|null, plannedTime: string|null }} payload
 */
export async function scheduleTask(id, payload) {
  return apiFetch(`/api/tasks/${id}/schedule`, { method: 'POST', body: payload })
}

/**
 * @param {number} id
 * @param {{ important: boolean|null, urgent: boolean|null }} payload
 */
export async function classifyTask(id, payload) {
  return apiFetch(`/api/tasks/${id}/classify`, { method: 'POST', body: payload })
}

/** @param {string} [date] YYYY-MM-DD */
export async function getTodayTasks(date) {
  const qs = date ? `?date=${date}` : ''
  return apiFetch(`/api/tasks/today${qs}`)
}

export async function getEisenhower() {
  return apiFetch('/api/tasks/eisenhower')
}

/** @param {string} from @param {string} to YYYY-MM-DD */
export async function getCalendarTasks(from, to) {
  return apiFetch(`/api/tasks/calendar?from=${from}&to=${to}`)
}

/** @param {object} params */
export async function getBacklog({ page = 0, size = 25 } = {}) {
  return apiFetch(`/api/tasks/backlog?page=${page}&size=${size}`)
}

/** @param {string} q @param {number} [limit] */
export async function searchTasks(q, limit = 10) {
  if (!q || !q.trim()) return []
  return apiFetch(`/api/tasks/search?q=${encodeURIComponent(q)}&limit=${limit}`)
}
