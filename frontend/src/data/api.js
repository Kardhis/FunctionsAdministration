function computeApiBase() {
  const fromEnv = import.meta.env?.VITE_API_BASE
  const devDefault = 'http://localhost:8080'
  const trimmed = typeof fromEnv === 'string' ? fromEnv.trim() : ''
  let resolved = trimmed !== '' ? trimmed : devDefault

  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    const host = window.location.hostname
    const isLocalPage = host === 'localhost' || host === '127.0.0.1' || host === ''
    const looksLikeDevApi =
      resolved === devDefault ||
      resolved.startsWith('http://localhost:') ||
      resolved.startsWith('http://127.0.0.1:')
    if (!isLocalPage && looksLikeDevApi) {
      resolved = `${window.location.protocol}//${host}:8080`
    }
  }

  return resolved
}

export const API_BASE = computeApiBase()

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
