import React, { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentAdmin, loginAdmin, logoutAdmin } from '../services/api'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getCurrentAdmin()
      .then(() => {
        if (active) setIsAdmin(true)
      })
      .catch((error) => {
        if (active && error.status !== 401) {
          console.error('Не удалось проверить сессию администратора:', error)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const login = async (username, password) => {
    await loginAdmin({ login: username, password })
    setIsAdmin(true)
  }

  const logout = async () => {
    await logoutAdmin()
    setIsAdmin(false)
  }

  return (
    <AdminContext.Provider value={{ isAdmin, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) throw new Error('useAdmin must be used within an AdminProvider')
  return context
}
