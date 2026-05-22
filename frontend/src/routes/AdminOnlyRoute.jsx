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
      <div className="flex min-h-[100svh] items-center justify-center bg-bg p-6">
        <p className="text-sm text-text">Comprobando sesión…</p>
      </div>
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
