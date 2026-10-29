import React, { useState } from 'react'
import { useLang } from '../context/LangContext'
import { cancelReservation as cancelReservationRequest, createReservation } from '../services/api'
import './SimplePage.css'

const STORAGE_KEY = 'restik-reservations'

function loadReservations() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(saved)
      ? saved.filter(reservation => (
        reservation
        && (typeof reservation.id === 'string' || typeof reservation.id === 'number')
        && /^\d{4}-\d{2}-\d{2}$/.test(reservation.date)
        && /^\d{2}:\d{2}$/.test(reservation.time)
        && Number(reservation.guests) > 0
      ))
      : []
  } catch {
    return []
  }
}

export default function Reserve() {
  const { t, lang, translateError } = useLang()
  const [form, setForm] = useState({ date: '', time: '', guests: '', table: '', contact: '' })
  const [reservations, setReservations] = useState(loadReservations)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const updateReservations = (next) => {
    setReservations(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const reservation = await createReservation({ ...form, guests: Number(form.guests) })
      updateReservations([reservation, ...reservations])
      setForm({ date: '', time: '', guests: '', table: '', contact: '' })
      setMessage(t('bookingSuccess'))
    } catch (requestError) {
      setError(translateError(requestError))
    } finally {
      setSaving(false)
    }
  }

  const cancelReservation = async (reservation) => {
    setError('')
    try {
      if (reservation.manageToken) {
        await cancelReservationRequest(reservation.id, reservation.manageToken)
      }
      updateReservations(reservations.filter(item => item.id !== reservation.id))
    } catch (requestError) {
      setError(translateError(requestError))
    }
  }

  return (
    <div className="page-bg">
      <div className="page-content simple-page__booking-wrap">
        <h1 className="page-title">{t('booking')}</h1>
        <div className="page-title-divider" />

        <div className="simple-page__booking-grid">
          <section className="card simple-page__booking-card">
            <h2 className="section-heading">{t('makeBooking')}</h2>
            {message && <p className="simple-page__success" role="status">{message}</p>}
            {error && <p className="simple-page__error" role="alert">{error}</p>}
            <form className="simple-page__auth-form" onSubmit={handleSubmit}>
              <div className="simple-page__auth-field">
                <label htmlFor="booking-date">{t('bookingDate')}</label>
                <input id="booking-date" className="form-input" type="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} required />
              </div>
              <div className="simple-page__auth-field">
                <label htmlFor="booking-time">{t('bookingTime')}</label>
                <input id="booking-time" className="form-input" type="time" value={form.time} onChange={event => setForm({ ...form, time: event.target.value })} required />
              </div>
              <div className="simple-page__auth-field">
                <label htmlFor="booking-guests">{t('bookingGuests')}</label>
                <select id="booking-guests" className="form-input" value={form.guests} onChange={event => setForm({ ...form, guests: event.target.value })} required>
                  <option value="">{t('choose')}</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(count => (
                    <option key={count} value={count}>
                      {count} {count === 1 ? t('guest') : lang === 'ru' && count < 5 ? t('guestsFew') : t('guests')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="simple-page__auth-field">
                <label htmlFor="booking-table">{t('bookingTable')}</label>
                <select id="booking-table" className="form-input" value={form.table} onChange={event => setForm({ ...form, table: event.target.value })}>
                  <option value="">{t('chooseTable')}</option>
                  <option value="window">{t('tableWindow')}</option>
                  <option value="center">{t('tableCenter')}</option>
                  <option value="corner">{t('tableCorner')}</option>
                  <option value="vip">{t('vipRoom')}</option>
                </select>
              </div>
              <div className="simple-page__auth-field">
                <label htmlFor="booking-contact">{t('bookingContact')}</label>
                <input id="booking-contact" className="form-input" type="tel" value={form.contact} onChange={event => setForm({ ...form, contact: event.target.value })} placeholder="+996 ___-___-___" required />
              </div>
              <button type="submit" className="btn-gold simple-page__auth-submit" disabled={saving}>{saving ? t('saving') : t('bookTable')}</button>
            </form>
          </section>

          <section className="card simple-page__booking-card">
            <h2 className="section-heading">{t('currentBookings')}</h2>
            {reservations.length === 0 ? (
              <p className="simple-page__booking-empty">{t('noBookings')}</p>
            ) : (
              <ul className="simple-page__booking-list">
                {reservations.map(reservation => (
                  <li className="simple-page__booking-item" key={reservation.id}>
                    <div>
                      <strong>{reservation.date} · {reservation.time}</strong>
                      <p>{t('people')} {reservation.guests}</p>
                      {reservation.table && <p>{t({
                        window: 'tableWindow',
                        center: 'tableCenter',
                        corner: 'tableCorner',
                        vip: 'vipRoom',
                      }[reservation.table])}</p>}
                      <span className="simple-page__booking-status">{t('pending')}</span>
                    </div>
                    <button type="button" className="simple-page__profile-logout" onClick={() => cancelReservation(reservation)}>
                      {t('cancel')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
