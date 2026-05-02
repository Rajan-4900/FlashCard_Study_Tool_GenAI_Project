import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'

export default function AdminRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen label="Checking permissions…" />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return <Outlet />
}

