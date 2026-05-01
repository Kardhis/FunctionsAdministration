export const API_BASE = import.meta.env?.VITE_API_BASE ?? 'http://localhost:8080'

export async function apiFetch(path, { method = 'GET', body, headers } = {}) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const message = (data && (data.error || data.message)) ?? `HTTP ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.payload = data
    throw err
  }
  return data
}

