import React, { useEffect, useState } from 'react'
import { useLang } from '../context/LangContext'
import { createReview, getReviews } from '../services/api'
import './SimplePage.css'

const initialReviews = [
  { name: 'Анна М.', rating: 5, textKey: 'reviewOne', date: '2026-09-15T12:00:00' },
  { name: 'Дмитрий К.', rating: 5, textKey: 'reviewTwo', date: '2026-10-02T12:00:00' },
  { name: 'Айгуль Б.', rating: 4, textKey: 'reviewThree', date: '2026-09-28T12:00:00' },
  { name: 'Максим Р.', rating: 5, textKey: 'reviewFour', date: '2026-10-10T12:00:00' },
]

const Stars = ({ count }) => (
  <span className="simple-page__stars">
    {'★'.repeat(count)}{'☆'.repeat(5 - count)}
  </span>
)

export default function Reviews() {
  const { t, lang, translateError } = useLang()
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState({ name: '', rating: 5, text: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    getReviews()
      .then(savedReviews => {
        if (active) setReviews([...savedReviews, ...initialReviews])
      })
      .catch(requestError => {
        if (active) setError(translateError(requestError))
      })
    return () => { active = false }
  }, [translateError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const savedReview = await createReview(form)
      setReviews(current => [savedReview, ...current])
      setForm({ name: '', rating: 5, text: '' })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch (requestError) {
      setError(translateError(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-bg">
      <div className="page-content">
        <h1 className="page-title">{t('reviewsTitle')}</h1>
        <div className="page-title-divider" />

        {/* Форма */}
        <div className="card simple-page__review-form">
          <h3 className="section-heading">{t('leaveReview')}</h3>
          {submitted && <p className="simple-page__success">{t('reviewThanks')}</p>}
          {error && <p className="simple-page__error" role="alert">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="simple-page__form-grid">
              <input
                type="text"
                placeholder={t('yourName')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="form-input"
                required
              />
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="form-input"
              >
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </div>
            <textarea
              placeholder={t('tellVisit')}
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              className="simple-page__textarea"
              rows={3}
              required
            />
            <button type="submit" className="btn-gold simple-page__btn" disabled={saving}>{saving ? t('saving') : t('sendReview')}</button>
          </form>
        </div>

        {/* Список отзывов */}
        <div className="simple-page__reviews-grid">
          {reviews.map((r, i) => (
            <div key={r.id || `${r.name}-${i}`} className="card simple-page__review-card">
              <div className="simple-page__review-header">
                <div className="simple-page__review-avatar">{r.name[0]}</div>
                <div>
                  <p className="simple-page__review-name">{r.name}</p>
                  <p className="simple-page__review-date">
                    {r.dateKey ? t(r.dateKey) : Number.isNaN(new Date(r.createdAt || r.date).getTime())
                      ? '—'
                      : new Date(r.createdAt || r.date).toLocaleDateString(lang === 'kg' ? 'ky-KG' : lang === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <Stars count={Math.max(0, Math.min(5, r.rating))} />
              </div>
              <p className="simple-page__review-text">{r.textKey ? t(r.textKey) : r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
