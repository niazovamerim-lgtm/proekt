import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import './SimplePage.css'

export default function Auth() {
  const { login, register, error: sessionError } = useAuth()
  const { t, translateError } = useLang()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (mode === 'register') {
      if (form.password !== form.confirm) {
        setError(t('passwordMismatch'))
        return
      }
      if (form.password.length < 8) {
        setError(t('passwordMin'))
        return
      }
    }
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password })
      } else {
        await register({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        })
      }
      navigate('/profile', { replace: true })
    } catch (requestError) {
      setError(translateError(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-bg">
      <div className="page-content simple-page__auth-wrap">
        <div className="card simple-page__auth-card">
          {/* Переключатель */}
          <div className="simple-page__auth-tabs">
            <button
              className={`simple-page__auth-tab${mode === 'login' ? ' simple-page__auth-tab--active' : ''}`}
              onClick={() => { setMode('login'); setError('') }}
            >
              {t('login')}
            </button>
            <button
              className={`simple-page__auth-tab${mode === 'register' ? ' simple-page__auth-tab--active' : ''}`}
              onClick={() => { setMode('register'); setError('') }}
            >
              {t('register')}
            </button>
          </div>

          <h2 className="simple-page__auth-title">
            {mode === 'login' ? t('welcome') : t('createAccount')}
          </h2>

          {(error || sessionError) && <p className="simple-page__error" role="alert">{error || sessionError}</p>}

          <form className="simple-page__auth-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="simple-page__auth-field">
                <label>{t('yourName')}</label>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder={t('yourName')} className="form-input" required />
              </div>
            )}

            <div className="simple-page__auth-field">
              <label>{t('email')}</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="example@mail.ru" className="form-input" required />
            </div>

            {mode === 'register' && (
              <div className="simple-page__auth-field">
                <label>{t('phone')}</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="+996 ___-___-___" className="form-input" />
              </div>
            )}

            <div className="simple-page__auth-field">
              <label>{t('password')}</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} minLength={8}
                placeholder="••••••••" className="form-input" required />
            </div>

            {mode === 'register' && (
              <div className="simple-page__auth-field">
                <label>{t('confirmPassword')}</label>
                <input type="password" name="confirm" value={form.confirm} onChange={handleChange}
                  placeholder="••••••••" className="form-input" required />
              </div>
            )}

            <button type="submit" className="btn-gold simple-page__auth-submit" disabled={submitting}>
              {submitting ? t('pleaseWait') : mode === 'login' ? t('enter') : t('register')}
            </button>
          </form>

          <p className="simple-page__auth-switch">
            {mode === 'login' ? t('noAccount') : t('haveAccount')}
            <button
              className="simple-page__auth-switch-btn"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            >
              {mode === 'login' ? t('create') : t('enter')}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
