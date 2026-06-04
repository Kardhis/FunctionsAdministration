import { apiFetch } from '../../../data/api.js'

/**
 * Returns the list of task statuses from the server (id, code, label).
 * Typically used to keep labels in sync with the backend seed data.
 * For most cases, the static TASK_STATUSES from taskStatus.js is sufficient.
 * @returns {Promise<Array<{id: number, code: string, label: string}>>}
 */
export async function listTaskStatuses() {
  return apiFetch('/api/task-statuses')
}
