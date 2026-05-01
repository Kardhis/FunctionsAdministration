import { apiFetch } from '../../../data/api.js'

export async function listCategories() {
  try {
    const data = await apiFetch('/api/habit-categories')
    return data
  } catch (e) {
    throw e
  }
}

export async function createCategory(category) {
  return apiFetch('/api/habit-categories', { method: 'POST', body: category })
}

export async function updateCategory(id, patch) {
  return apiFetch(`/api/habit-categories/${encodeURIComponent(id)}`, { method: 'PUT', body: patch })
}

export async function deleteCategory(id) {
  return apiFetch(`/api/habit-categories/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

