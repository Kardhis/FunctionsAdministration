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
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!res.ok) {
        setUser(null)
        setRoles([])
        setStatus('unauthenticated')
        return { ok: false, roles: [] }
      }

      const data = await res.json().catch(() => ({}))
      const nextRoles = Array.isArray(data?.roles) ? data.roles : []
      setUser(data?.user ?? null)
      setRoles(nextRoles)
      setStatus('authenticated')
      // #region agent log
      fetch('http://127.0.0.1:7799/ingest/4640c2d9-05e7-49ac-af5a-780a24bdc3b2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '877f10' },
        body: JSON.stringify({
          sessionId: '877f10',
          hypothesisId: 'H1',
          location: 'AuthContext.jsx:refresh',
          message: 'auth me ok',
          data: { roleCount: nextRoles.length, roles: nextRoles },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
      // #endregion

      return { ok: true, roles: nextRoles }
    } catch {
      setUser(null)
      setRoles([])
      setStatus('unauthenticated')
      return { ok: false, roles: [] }
    }
  }, [])

  useEffect(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
    const publicAuthPaths = ['/login', '/register', '/forgot-password', '/reset-password']
    if (publicAuthPaths.includes(pathname)) {
      // Avoid a guaranteed 401 noise on public auth pages.
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

