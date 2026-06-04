import { apiFetch } from '../../../data/api.js'

export async function listProjects() {
  return apiFetch('/api/task-projects')
}

export async function createProject(data) {
  return apiFetch('/api/task-projects', { method: 'POST', body: data })
}

export async function updateProject(id, data) {
  return apiFetch(`/api/task-projects/${id}`, { method: 'PUT', body: data })
}

export async function deleteProject(id) {
  return apiFetch(`/api/task-projects/${id}`, { method: 'DELETE' })
}
