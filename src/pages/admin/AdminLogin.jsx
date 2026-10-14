import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'
import './Admin.css'

export default function AdminLogin() {
  const { login } = useAdmin()
  const navigate = useNavigate()
  const [form, setForm] = useState({ login: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const ok = login(form.login, form.password)
    if (ok) navigate('/admin')
    else setError('Логин же пароль туура эмес')
  }

  return (
    <div className="admin-login-bg">
      <div className="admin-login-card">
        <h1 className="admin-login-title">🔐 Админ панель</h1>
        {error && <p className="admin-error">{error}</p>}
        <form onSubmit={handleSubmit} className="admin-login-form">
          <label>Логин</label>
          <input
            type="text"
            className="admin-input"
            value={form.login}
            onChange={e => setForm({ ...form, login: e.target.value })}
            placeholder="admin"
            required
          />
          <label>Пароль</label>
          <input
            type="password"
            className="admin-input"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            required
          />
          <button type="submit" className="admin-btn-primary">Кирүү</button>
        </form>
      </div>
    </div>
  )
}
