import { apiFetch } from '../../../data/api.js'

export async function listReminders() {
  return apiFetch('/api/reminders')
}

export async function putReminder(reminder) {
  if (!reminder?.id) throw new Error('Reminder id is required')
  try {
    return await apiFetch('/api/reminders', { method: 'POST', body: reminder })
  } catch (e) {
    if (e && e.status === 409) {
      return apiFetch(`/api/reminders/${encodeURIComponent(reminder.id)}`, { method: 'PUT', body: reminder })
    }
    throw e
  }
}
