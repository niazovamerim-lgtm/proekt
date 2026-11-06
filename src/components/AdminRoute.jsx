import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import { useLang } from '../context/LangContext'

export default function AdminRoute({ children }) {
  const { isAdmin, loading } = useAdmin()
  const { t } = useLang()
  if (loading) return <div className="admin-loading">{t('adminCheckAccess')}</div>
  return isAdmin ? children : <Navigate to="/admin/login" replace />
}
