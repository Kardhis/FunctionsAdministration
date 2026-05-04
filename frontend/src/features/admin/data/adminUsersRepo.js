import { apiFetch } from '../../../data/api.js'

export async function listUsers() {
  return apiFetch('/api/admin/users')
}

export async function listRoles() {
  return apiFetch('/api/admin/roles')
}

/**
 * @param {{ email: string, password: string, displayName: string, active: boolean, roles: string[] }} body
 */
export async function createUser(body) {
  return apiFetch('/api/admin/users', { method: 'POST', body })
}

/**
 * @param {number|string} id
 * @param {{ email?: string, displayName?: string }} body
 */
export async function updateUserBasics(id, body) {
  return apiFetch(`/api/admin/users/${id}`, { method: 'PUT', body })
}

/**
 * @param {number|string} id
 * @param {boolean} active
 */
export async function updateUserStatus(id, active) {
  return apiFetch(`/api/admin/users/${id}/status`, { method: 'PUT', body: { active } })
}

/**
 * @param {number|string} id
 * @param {string[]} roles
 */
export async function updateUserRoles(id, roles) {
  return apiFetch(`/api/admin/users/${id}/roles`, { method: 'PUT', body: { roles } })
}

/**
 * @param {number|string} id
 * @param {string} password
 */
export async function updateUserPassword(id, password) {
  return apiFetch(`/api/admin/users/${id}/password`, { method: 'PUT', body: { password } })
}

/**
 * @param {number|string} id
 */
export async function deleteUser(id) {
  return apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' })
}
