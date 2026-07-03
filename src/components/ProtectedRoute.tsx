import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import type { ReactNode } from 'react'
import type { Role } from '../types'

export function ProtectedRoute({ children, role }: { children: ReactNode; role?: Role }) {
  const { user, loading } = useApp()
  const location = useLocation()
  if (loading) return <div className="center-page"><div className="spinner" /><p>Cargando...</p></div>
  if (!user) return <Navigate to="/acceso" replace state={{ from: location.pathname }} />
  if (role && user.role !== role) {
    const destination = user.role === 'admin' ? '/admin' : user.role === 'doctor' ? '/medico' : '/panel'
    return <Navigate to={destination} replace />
  }
  return children
}
