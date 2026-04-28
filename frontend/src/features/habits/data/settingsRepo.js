import { apiFetch } from '../../../data/api.js'

export async function getSetting(key, fallback = null) {
  const res = await apiFetch(`/api/settings/${encodeURIComponent(key)}`)
  return res?.value ?? fallback
}

export async function setSetting(key, value) {
  const res = await apiFetch(`/api/settings/${encodeURIComponent(key)}`, { method: 'PUT', body: value })
  return res?.value ?? value
}
