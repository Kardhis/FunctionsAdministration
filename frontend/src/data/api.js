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

export async function apiFetch(path, { method = 'GET', body, headers } = {}) {
  const url = `${API_BASE}${path}`

  // #region agent log
  let res
  try {
    res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (e) {
    fetch('http://127.0.0.1:7799/ingest/4640c2d9-05e7-49ac-af5a-780a24bdc3b2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '9d3ba5' },
      body: JSON.stringify({
        sessionId: '9d3ba5',
        runId: 'pre-fix',
        hypothesisId: 'H-net',
        location: 'api.js:apiFetch',
        message: 'fetch network failure',
        data: {
          apiBaseLen: API_BASE.length,
          pathStart: String(path).slice(0, 48),
          errName: e && e.name,
          errMsg: e && String(e.message || e),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    throw e
  }
  // #endregion agent log

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
