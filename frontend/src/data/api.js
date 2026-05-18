function computeApiBase() {
  const fromEnv = import.meta.env?.VITE_API_BASE
  const devDefault = 'http://localhost:8080'
  const trimmed = typeof fromEnv === 'string' ? fromEnv.trim() : ''

  // Production build + real hostname + empty VITE_API_BASE → same-origin (reverse proxy on :80)
  if (
    trimmed === '' &&
    import.meta.env.PROD &&
    typeof window !== 'undefined'
  ) {
    const host = window.location.hostname
    const isLocalPage = host === 'localhost' || host === '127.0.0.1' || host === ''
    if (!isLocalPage) {
      return ''
    }
  }

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

function isLocalDebugHost() {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1'
}

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
    // #region agent log
    if (isLocalDebugHost() && (res.status === 403 || res.status === 401)) {
      fetch('http://127.0.0.1:7799/ingest/4640c2d9-05e7-49ac-af5a-780a24bdc3b2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '877f10' },
        body: JSON.stringify({
          sessionId: '877f10',
          hypothesisId: 'H2-H4',
          location: 'api.js:apiFetch',
          message: 'api error response',
          data: { path, status: res.status, apiBase: API_BASE },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
    }
    // #endregion
    const message = (data && (data.error || data.message)) ?? `HTTP ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.payload = data
    throw err
  }
  return data
}
