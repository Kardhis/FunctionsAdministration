import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { isAdmin } from '../auth/roles.js'

/**
 * @param {{ children: import('react').ReactNode, redirectTo: string }} props
 */
export default function AdminOnlyRoute({ children, redirectTo }) {
  const { status, roles } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        <p>Comprobando sesión...</p>
      </main>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!isAdmin(roles)) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
