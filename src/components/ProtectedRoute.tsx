import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import type { ReactNode } from 'react'

export function ProtectedRoute({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, loading } = useApp()
  const location = useLocation()
  if (loading) return <div className="center-page"><div className="spinner" /><p>Cargando...</p></div>
  if (!user) return <Navigate to="/acceso" replace state={{ from: location.pathname }} />
  if (admin && user.role !== 'admin') return <Navigate to="/panel" replace />
  return children
}
