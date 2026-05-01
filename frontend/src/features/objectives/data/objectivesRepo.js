import { apiFetch } from '../../../data/api.js'

export async function listObjectives({ status, habitId, from, to } = {}) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (habitId) params.set('habitId', habitId)
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const qs = params.toString()
  return apiFetch(`/api/objectives${qs ? `?${qs}` : ''}`)
}

export async function createObjective(payload) {
  return apiFetch('/api/objectives', { method: 'POST', body: payload })
}

export async function updateObjective(id, patch) {
  return apiFetch(`/api/objectives/${encodeURIComponent(id)}`, { method: 'PUT', body: patch })
}

export async function deleteObjective(id) {
  return apiFetch(`/api/objectives/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

