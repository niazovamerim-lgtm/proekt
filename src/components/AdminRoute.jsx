import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'

export default function AdminRoute({ children }) {
  const { isAdmin, loading } = useAdmin()
  if (loading) return <div className="admin-loading">Проверяем доступ…</div>
  return isAdmin ? children : <Navigate to="/admin/login" replace />
}
