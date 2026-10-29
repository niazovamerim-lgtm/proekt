import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'
import { useLang } from '../../context/LangContext'
import './Admin.css'
import LangSwitcher from '../../components/LangSwitcher'

export default function AdminLogin() {
  const { login } = useAdmin()
  const { t, translateError } = useLang()
  const navigate = useNavigate()
  const [form, setForm] = useState({ login: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(form.login, form.password)
      navigate('/admin', { replace: true })
    } catch (requestError) {
      setError(requestError.status === 401 ? t('adminLoginFailed') : translateError(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="adm-login-bg">
      <div className="adm-login-card">
        <div className="adm-login-languages"><LangSwitcher /></div>
        <div className="adm-login-brand">
          <span className="adm-login-brand__icon" aria-hidden="true">✳</span>
          <span>Рестик <span>Admin</span></span>
        </div>
        <p className="adm-login-eyebrow">{t('adminPanelEyebrow')}</p>
        <h1 className="adm-login-title">{t('adminLoginTitle')}</h1>
        <p className="adm-login-description">{t('adminLoginDescription')}</p>
        {error && <p className="adm-login-error" role="alert">{error}</p>}
        <form onSubmit={handleSubmit} className="adm-login-form">
          <label htmlFor="admin-login">{t('adminLoginLabel')}</label>
          <input
            id="admin-login"
            type="text"
            className="adm-input"
            value={form.login}
            onChange={e => setForm({ ...form, login: e.target.value })}
            placeholder="admin"
            required
          />
          <label htmlFor="admin-password">{t('password')}</label>
          <input
            id="admin-password"
            type="password"
            className="adm-input"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            required
          />
          <button type="submit" className="adm-btn-primary" disabled={submitting}>
            {submitting ? t('pleaseWait') : <>{t('adminLoginButton')} <span aria-hidden="true">→</span></>}
          </button>
        </form>
        <button type="button" className="adm-login-back" onClick={() => navigate('/')}>
          <span aria-hidden="true">←</span> {t('adminLoginBack')}
        </button>
      </div>
    </div>
  )
}
