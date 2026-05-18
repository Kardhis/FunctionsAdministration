import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { isAdmin } from '../auth/roles.js'

export default function AdminRoute({ children }) {
  const { status, roles } = useAuth()
  const location = useLocation()

  if (status === 'loading') return null
  if (status === 'unauthenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />

  if (!isAdmin(roles)) return <Navigate to="/dashboard" replace />

  return children
}

