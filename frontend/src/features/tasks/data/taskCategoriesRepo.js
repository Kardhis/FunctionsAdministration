import { apiFetch } from '../../../data/api.js'

export async function listCategories() {
  return apiFetch('/api/task-categories')
}

export async function createCategory(data) {
  return apiFetch('/api/task-categories', { method: 'POST', body: data })
}

export async function updateCategory(id, data) {
  return apiFetch(`/api/task-categories/${id}`, { method: 'PUT', body: data })
}

export async function deleteCategory(id) {
  return apiFetch(`/api/task-categories/${id}`, { method: 'DELETE' })
}
