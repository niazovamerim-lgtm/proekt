import React, { useState } from 'react'
import './SimplePage.css'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (mode === 'register') {
      if (form.password !== form.confirm) {
        setError('Пароли не совпадают')
        return
      }
      if (form.password.length < 6) {
        setError('Пароль должен быть не менее 6 символов')
        return
      }
    }
    setSuccess(mode === 'login' ? 'Вы успешно вошли!' : 'Аккаунт создан!')
  }

  return (
    <div className="page-bg">
      <div className="page-content simple-page__auth-wrap">
        <div className="card simple-page__auth-card">
          {/* Переключатель */}
          <div className="simple-page__auth-tabs">
            <button
              className={`simple-page__auth-tab${mode === 'login' ? ' simple-page__auth-tab--active' : ''}`}
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
            >
              Вход
            </button>
            <button
              className={`simple-page__auth-tab${mode === 'register' ? ' simple-page__auth-tab--active' : ''}`}
              onClick={() => { setMode('register'); setError(''); setSuccess('') }}
            >
              Регистрация
            </button>
          </div>

          <h2 className="simple-page__auth-title">
            {mode === 'login' ? 'Добро пожаловать!' : 'Создать аккаунт'}
          </h2>

          {success && <p className="simple-page__success">{success}</p>}
          {error && <p className="simple-page__error">{error}</p>}

          <form className="simple-page__auth-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="simple-page__auth-field">
                <label>Имя</label>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Ваше имя" className="form-input" required />
              </div>
            )}

            <div className="simple-page__auth-field">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="example@mail.ru" className="form-input" required />
            </div>

            {mode === 'register' && (
              <div className="simple-page__auth-field">
                <label>Телефон</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="+996 ___-___-___" className="form-input" />
              </div>
            )}

            <div className="simple-page__auth-field">
              <label>Пароль</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="••••••••" className="form-input" required />
            </div>

            {mode === 'register' && (
              <div className="simple-page__auth-field">
                <label>Подтвердите пароль</label>
                <input type="password" name="confirm" value={form.confirm} onChange={handleChange}
                  placeholder="••••••••" className="form-input" required />
              </div>
            )}

            <button type="submit" className="btn-gold simple-page__auth-submit">
              {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>

          <p className="simple-page__auth-switch">
            {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
            <button
              className="simple-page__auth-switch-btn"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}
            >
              {mode === 'login' ? 'Создать' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
