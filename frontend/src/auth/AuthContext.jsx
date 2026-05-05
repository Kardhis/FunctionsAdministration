/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../data/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading') // loading | authenticated | unauthenticated
  const [user, setUser] = useState(null)
  const [roles, setRoles] = useState([])

  const refresh = useCallback(async () => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7799/ingest/4640c2d9-05e7-49ac-af5a-780a24bdc3b2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '16e790' },
        body: JSON.stringify({
          sessionId: '16e790',
          runId: 'pre-fix',
          hypothesisId: 'H1',
          location: 'AuthContext.jsx:refresh:pre_fetch',
          message: 'Refreshing /auth/me',
          data: {
            apiBase: API_BASE,
            pageOrigin: typeof window !== 'undefined' ? window.location.origin : null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
      // #endregion agent log

      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!res.ok) {
        // #region agent log
        fetch('http://127.0.0.1:7799/ingest/4640c2d9-05e7-49ac-af5a-780a24bdc3b2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '16e790' },
          body: JSON.stringify({
            sessionId: '16e790',
            runId: 'pre-fix',
            hypothesisId: 'H2',
            location: 'AuthContext.jsx:refresh:unauthorized',
            message: '/auth/me not ok',
            data: {
              status: res.status,
              ok: res.ok,
              type: res.type,
              url: res.url,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {})
        // #endregion agent log

        setUser(null)
        setStatus('unauthenticated')
        return false
      }

      const data = await res.json().catch(() => ({}))
      setUser(data?.user ?? null)
      setRoles(Array.isArray(data?.roles) ? data.roles : [])
      setStatus('authenticated')

      // #region agent log
      fetch('http://127.0.0.1:7799/ingest/4640c2d9-05e7-49ac-af5a-780a24bdc3b2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '16e790' },
        body: JSON.stringify({
          sessionId: '16e790',
          runId: 'pre-fix',
          hypothesisId: 'H4',
          location: 'AuthContext.jsx:refresh:ok',
          message: '/auth/me ok',
          data: {
            userPresent: Boolean(data?.user),
            rolesCount: Array.isArray(data?.roles) ? data.roles.length : null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
      // #endregion agent log

      return true
    } catch {
      // #region agent log
      fetch('http://127.0.0.1:7799/ingest/4640c2d9-05e7-49ac-af5a-780a24bdc3b2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '16e790' },
        body: JSON.stringify({
          sessionId: '16e790',
          runId: 'pre-fix',
          hypothesisId: 'H3',
          location: 'AuthContext.jsx:refresh:catch',
          message: '/auth/me fetch threw',
          data: {},
          timestamp: Date.now(),
        }),
      }).catch(() => {})
      // #endregion agent log

      setUser(null)
      setRoles([])
      setStatus('unauthenticated')
      return false
    }
  }, [])

  useEffect(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
    if (pathname === '/login') {
      // Avoid a guaranteed 401 noise on the public login page.
      setUser(null)
      setRoles([])
      setStatus('unauthenticated')
      return
    }
    refresh()
  }, [refresh])

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      await refresh()
    }
  }, [refresh])

  const value = useMemo(() => ({ status, user, roles, refresh, logout }), [status, user, roles, refresh, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}

