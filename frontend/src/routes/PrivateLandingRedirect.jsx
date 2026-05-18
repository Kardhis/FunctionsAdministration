import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { isAdmin } from '../auth/roles.js'

export default function PrivateLandingRedirect() {
  const { status, roles } = useAuth()

  if (status === 'loading') {
    return (
      <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        <p>Comprobando sesión...</p>
      </main>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  const to = isAdmin(roles) ? '/dashboard' : '/dashboard/habits/overview'
  return <Navigate to={to} replace />
}
