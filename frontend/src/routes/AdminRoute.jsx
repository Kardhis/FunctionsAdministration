import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

export default function AdminRoute({ children }) {
  const { status, roles } = useAuth()
  const location = useLocation()

  if (status === 'loading') return null
  if (status === 'unauthenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />

  const isAdmin = Array.isArray(roles) && roles.includes('ADMIN')
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return children
}

