import React, { createContext, useContext, useState } from 'react'

const ADMIN_LOGIN    = import.meta.env.VITE_ADMIN_LOGIN
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

const AdminContext = createContext()

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(
    () => sessionStorage.getItem('isAdmin') === 'true'
  )

  const login = (login, password) => {
    if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      setIsAdmin(true)
      sessionStorage.setItem('isAdmin', 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAdmin(false)
    sessionStorage.removeItem('isAdmin')
  }

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)
