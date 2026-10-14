import React, { useState } from 'react'
import './Reserve.css'

const myReservations = [
  { date: '2024-11-15', time: '19:00', guests: 4, status: 'Подтверждено' },
  { date: '2024-11-18', time: '20:30', guests: 2, status: 'В ожидании' },
]

export default function Reserve() {
  const [activeTab, setActiveTab] = useState('new')
  const [form, setForm] = useState({
    date: '',
    time: '',
    guests: '',
    table: '',
    contact: '',
  })
  const [reservations, setReservations] = useState(myReservations)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.date || !form.time || !form.guests) return
    setReservations([
      ...reservations,
      { ...form, status: 'В ожидании' },
    ])
    setForm({ date: '', time: '', guests: '', table: '', contact: '' })
    setActiveTab('my')
  }

  const cancelReservation = (index) => {
    setReservations(reservations.filter((_, i) => i !== index))
  }

  const statusClass = (status) => {
    if (status === 'Подтверждено') return 'reserve__status--confirmed'
    if (status === 'Отменено') return 'reserve__status--cancelled'
    return 'reserve__status--pending'
  }

  return (
    <div className="page-bg">
      <div className="page-content reserve__content">
        {/* Tabs */}
        <div className="reserve__tabs">
          <button
            className={`reserve__tab${activeTab === 'new' ? ' reserve__tab--active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            1. РЕЗЕРВЫ
          </button>
          <button
            className={`reserve__tab${activeTab === 'my' ? ' reserve__tab--active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            2. МОИ РЕЗЕРВЫ
          </button>
        </div>

        <div className="reserve__panels">
          {/* Панель бронирования */}
          <div className={`reserve__panel card${activeTab === 'new' ? ' reserve__panel--active' : ''}`}>
            <h2 className="reserve__panel-title">СДЕЛАТЬ НОВОЕ БРОНИРОВАНИЕ</h2>
            <form className="reserve__form" onSubmit={handleSubmit}>
              <div className="reserve__field">
                <label className="reserve__label">
                  <span className="reserve__field-icon">📅</span> Дата
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="form-input reserve__input"
                  required
                />
              </div>

              <div className="reserve__field">
                <label className="reserve__label">
                  <span className="reserve__field-icon">🕐</span> Время
                </label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className="form-input reserve__input"
                  required
                />
              </div>

              <div className="reserve__field">
                <label className="reserve__label">
                  <span className="reserve__field-icon">👥</span> Количество гостей
                </label>
                <select
                  name="guests"
                  value={form.guests}
                  onChange={handleChange}
                  className="form-input reserve__input"
                  required
                >
                  <option value="">Выберите</option>
                  {[1,2,3,4,5,6,7,8,10,12].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}</option>
                  ))}
                </select>
              </div>

              <div className="reserve__field">
                <label className="reserve__label">
                  <span className="reserve__field-icon">👤</span> Количество мест
                </label>
                <select
                  name="table"
                  value={form.table}
                  onChange={handleChange}
                  className="form-input reserve__input"
                >
                  <option value="">Выберите столик</option>
                  <option value="1">Столик №1 (у окна)</option>
                  <option value="2">Столик №2 (в центре)</option>
                  <option value="3">Столик №3 (в углу)</option>
                  <option value="4">VIP кабинет</option>
                </select>
              </div>

              <div className="reserve__field">
                <label className="reserve__label">
                  <span className="reserve__field-icon">📞</span> Контактная информация
                </label>
                <input
                  type="text"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="+996 ___-___-___"
                  className="form-input reserve__input"
                />
              </div>

              <button type="submit" className="btn-gold reserve__submit">
                ЗАБРОНИРОВАТЬ СТОЛИК
              </button>
            </form>
          </div>

          {/* Мои резервы */}
          <div className={`reserve__panel card${activeTab === 'my' ? ' reserve__panel--active' : ''}`}>
            <h2 className="reserve__panel-title">ВАШИ ТЕКУЩИЕ БРОНИРОВАНИЯ</h2>
            {reservations.length === 0 ? (
              <p className="reserve__empty">Нет активных бронирований</p>
            ) : (
              <ul className="reserve__list">
                {reservations.map((r, i) => (
                  <li key={i} className="reserve__item">
                    <div className="reserve__item-info">
                      <span className="reserve__item-date">{r.date} | {r.time} | Человек: {r.guests}</span>
                      <span className={`reserve__status ${statusClass(r.status)}`}>[{r.status}]</span>
                    </div>
                    <div className="reserve__item-actions">
                      <button className="reserve__action-btn" onClick={() => {}}>Отметить</button>
                      <button className="reserve__action-btn reserve__action-btn--cancel" onClick={() => cancelReservation(i)}>Отменить</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
