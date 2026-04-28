import { apiFetch } from '../../../data/api.js'

export async function listHabits() {
  return apiFetch('/api/habits')
}

export async function getHabit(id) {
  const all = await listHabits()
  return all.find((h) => h.id === id) ?? null
}

export async function putHabit(habit) {
  if (!habit?.id) throw new Error('Habit id is required')
  try {
    // create (POST) first; if it already exists, fall back to update (PUT)
    return await apiFetch('/api/habits', { method: 'POST', body: habit })
  } catch (e) {
    if (e && e.status === 409) {
      return apiFetch(`/api/habits/${encodeURIComponent(habit.id)}`, { method: 'PUT', body: habit })
    }
    throw e
  }
}

export async function deleteHabit(id) {
  await apiFetch(`/api/habits/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function clearHabits() {
  const habits = await listHabits()
  await Promise.all(habits.map((h) => deleteHabit(h.id)))
}
