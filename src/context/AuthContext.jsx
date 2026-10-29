import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  getCurrentAccount,
  loginAccount,
  logoutAccount,
  registerAccount,
  updateAccount,
} from '../services/api'
import { useLang } from './LangContext'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { translateError } = useLang()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getCurrentAccount()
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser)
      })
      .catch((requestError) => {
        if (!active) return
        if (requestError.status !== 401) setError(translateError(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const login = async (credentials) => {
    const result = await loginAccount(credentials)
    setUser(result.user)
    setError('')
    return result.user
  }

  const register = async (details) => {
    const result = await registerAccount(details)
    setUser(result.user)
    setError('')
    return result.user
  }

  const updateProfile = async (details) => {
    const result = await updateAccount(details)
    setUser(result.user)
    return result.user
  }

  const logout = async () => {
    await logoutAccount()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
