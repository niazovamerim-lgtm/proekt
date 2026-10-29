import React, { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import './SimplePage.css'

export default function Profile() {
  const { user, loading, error: sessionError, updateProfile, logout } = useAuth()
  const { t, translateError } = useLang()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', currentPassword: '', newPassword: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    if (user) setForm(current => ({ ...current, name: user.name, phone: user.phone || '' }))
  }, [user])

  if (loading) {
    return <div className="page-bg"><div className="page-content">{t('loadingProfile')}</div></div>
  }
  if (!user) return <Navigate to="/auth" replace />

  const handleChange = (event) => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (Boolean(form.currentPassword) !== Boolean(form.newPassword)) {
      setError(t('passwordPairRequired'))
      return
    }
    setSaving(true)
    try {
      const data = { name: form.name, phone: form.phone }
      if (form.newPassword) {
        data.currentPassword = form.currentPassword
        data.newPassword = form.newPassword
      }
      await updateProfile(data)
      setForm(current => ({ ...current, currentPassword: '', newPassword: '' }))
      setMessage(t('profileSaved'))
    } catch (requestError) {
      setError(translateError(requestError))
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    setError('')
    setLoggingOut(true)
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(translateError(requestError))
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="page-bg">
      <div className="page-content simple-page__profile-wrap">
        <section className="card simple-page__profile-card">
          <div className="simple-page__profile-heading">
            <div className="simple-page__profile-avatar" aria-hidden="true">
              {user.name.trim().charAt(0).toLocaleUpperCase()}
            </div>
            <div>
              <p className="simple-page__profile-eyebrow">{t('profileCabinet')}</p>
              <h1 className="simple-page__profile-title">{t('profileTitle')}</h1>
            </div>
          </div>

          {(error || sessionError) && <p className="simple-page__error" role="alert">{error || sessionError}</p>}
          {message && <p className="simple-page__success" role="status">{message}</p>}

          <form className="simple-page__auth-form" onSubmit={handleSubmit}>
            <div className="simple-page__auth-field">
              <label htmlFor="profile-name">{t('yourName')}</label>
              <input id="profile-name" className="form-input" name="name" value={form.name} onChange={handleChange} required minLength={2} />
            </div>
            <div className="simple-page__auth-field">
              <label htmlFor="profile-email">{t('email')}</label>
              <input id="profile-email" className="form-input" type="email" value={user.email} disabled />
            </div>
            <div className="simple-page__auth-field">
              <label htmlFor="profile-phone">{t('phone')}</label>
              <input id="profile-phone" className="form-input" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+996 ___-___-___" />
            </div>

            <div className="simple-page__profile-password">
              <h2>{t('changePassword')}</h2>
              <p>{t('passwordOptional')}</p>
              <div className="simple-page__auth-field">
                <label htmlFor="profile-current-password">{t('currentPassword')}</label>
                <input id="profile-current-password" className="form-input" type="password" name="currentPassword" autoComplete="current-password" value={form.currentPassword} onChange={handleChange} />
              </div>
              <div className="simple-page__auth-field">
                <label htmlFor="profile-new-password">{t('newPassword')}</label>
                <input id="profile-new-password" className="form-input" type="password" name="newPassword" autoComplete="new-password" minLength={8} value={form.newPassword} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" className="btn-gold simple-page__auth-submit" disabled={saving}>
              {saving ? t('saving') : t('saveChanges')}
            </button>
          </form>

          <div className="simple-page__profile-support">
            <h2>{t('needHelp')}</h2>
            <a href="https://t.me/mskjv023" target="_blank" rel="noreferrer">{t('telegramSupport')}</a>
            <a href="tel:+996709014259">{t('callUs')}</a>
          </div>

          <button type="button" className="simple-page__profile-logout" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? t('loggingOut') : t('logoutAccount')}
          </button>
        </section>
      </div>
    </div>
  )
}
