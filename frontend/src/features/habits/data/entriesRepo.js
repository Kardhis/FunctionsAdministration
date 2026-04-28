import { apiFetch } from '../../../data/api.js'

export async function listEntries() {
  return apiFetch('/api/habit-entries')
}

export async function listEntriesByDateRange({ fromDate, toDate }) {
  const qs = new URLSearchParams({ fromDate, toDate })
  return apiFetch(`/api/habit-entries?${qs.toString()}`)
}

export async function putEntry(entry) {
  if (!entry?.id) throw new Error('Entry id is required')
  try {
    return await apiFetch('/api/habit-entries', { method: 'POST', body: entry })
  } catch (e) {
    if (e && e.status === 409) {
      return apiFetch(`/api/habit-entries/${encodeURIComponent(entry.id)}`, { method: 'PUT', body: entry })
    }
    throw e
  }
}

export async function deleteEntry(id) {
  await apiFetch(`/api/habit-entries/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function clearEntries() {
  const entries = await listEntries()
  await Promise.all(entries.map((e) => deleteEntry(e.id)))
}
