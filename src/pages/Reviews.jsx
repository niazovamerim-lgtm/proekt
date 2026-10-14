import React, { useState } from 'react'
import './SimplePage.css'

const initialReviews = [
  { name: 'Анна М.', rating: 5, text: 'Потрясающая атмосфера и невероятная кухня! Стейк Рибай был просто великолепен. Обязательно вернёмся!', date: '15 сентября 2026' },
  { name: 'Дмитрий К.', rating: 5, text: 'Отмечали годовщину. Персонал очень внимательный, всё прошло идеально. Спасибо Рестику за незабываемый вечер!', date: '2 октября 2026' },
  { name: 'Айгуль Б.', rating: 4, text: 'Вкусная еда, красивый интерьер. Немного долго ждали заказ, но в целом всё понравилось.', date: '28 сентября 2026' },
  { name: 'Максим Р.', rating: 5, text: 'Лучший ресторан в городе! Каждый раз открываю для себя что-то новое в меню. Карри просто бомба!', date: '10 октября 2026' },
]

const Stars = ({ count }) => (
  <span className="simple-page__stars">
    {'★'.repeat(count)}{'☆'.repeat(5 - count)}
  </span>
)

export default function Reviews() {
  const [reviews, setReviews] = useState(initialReviews)
  const [form, setForm] = useState({ name: '', rating: 5, text: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.text) return
    setReviews([{ ...form, date: 'Только что' }, ...reviews])
    setForm({ name: '', rating: 5, text: '' })
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="page-bg">
      <div className="page-content">
        <h1 className="page-title">Отзывы</h1>
        <div className="page-title-divider" />

        {/* Форма */}
        <div className="card simple-page__review-form">
          <h3 className="section-heading">Оставить отзыв</h3>
          {submitted && <p className="simple-page__success">Спасибо за ваш отзыв!</p>}
          <form onSubmit={handleSubmit}>
            <div className="simple-page__form-grid">
              <input
                type="text"
                placeholder="Ваше имя"
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
              placeholder="Расскажите о вашем визите..."
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              className="simple-page__textarea"
              rows={3}
              required
            />
            <button type="submit" className="btn-gold simple-page__btn">Отправить отзыв</button>
          </form>
        </div>

        {/* Список отзывов */}
        <div className="simple-page__reviews-grid">
          {reviews.map((r, i) => (
            <div key={i} className="card simple-page__review-card">
              <div className="simple-page__review-header">
                <div className="simple-page__review-avatar">{r.name[0]}</div>
                <div>
                  <p className="simple-page__review-name">{r.name}</p>
                  <p className="simple-page__review-date">{r.date}</p>
                </div>
                <Stars count={r.rating} />
              </div>
              <p className="simple-page__review-text">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
