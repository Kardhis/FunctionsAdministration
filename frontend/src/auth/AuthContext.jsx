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
        setStatus('unauthenticated')
        return false
      }

      const data = await res.json().catch(() => ({}))
      setUser(data?.user ?? null)
      setRoles(Array.isArray(data?.roles) ? data.roles : [])
      setStatus('authenticated')
      return true
    } catch {
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

