import React, { useState } from 'react'
import './SimplePage.css'

const amounts = [1000, 2000, 3000, 5000, 10000]

export default function GiftCard() {
  const [selected, setSelected] = useState(3000)
  const [custom, setCustom] = useState('')
  const [form, setForm] = useState({ recipientName: '', recipientEmail: '', message: '', senderName: '' })

  const finalAmount = custom ? Number(custom) : selected

  return (
    <div className="page-bg">
      <div className="page-content">
        <h1 className="page-title">Подарочная карта</h1>
        <div className="page-title-divider" />

        <div className="simple-page__giftcard-layout">
          {/* Превью карты */}
          <div className="simple-page__giftcard-preview">
            <div className="simple-page__giftcard-card">
              <div className="simple-page__giftcard-logo">РЕСТИК</div>
              <div className="simple-page__giftcard-divider" />
              <p className="simple-page__giftcard-label">Подарочная карта</p>
              <p className="simple-page__giftcard-amount">{finalAmount.toLocaleString('ru-RU')} KGS</p>
              {form.recipientName && (
                <p className="simple-page__giftcard-recipient">Для: {form.recipientName}</p>
              )}
              {form.message && (
                <p className="simple-page__giftcard-msg">«{form.message}»</p>
              )}
            </div>
          </div>

          {/* Форма */}
          <div className="card simple-page__giftcard-form">
            <h3 className="section-heading">Настройте карту</h3>

            <p className="simple-page__form-label">Сумма</p>
            <div className="simple-page__amounts">
              {amounts.map((a) => (
                <button
                  key={a}
                  className={`simple-page__amount-btn${selected === a && !custom ? ' simple-page__amount-btn--active' : ''}`}
                  onClick={() => { setSelected(a); setCustom('') }}
                >
                  {a.toLocaleString('ru-RU')} ₸
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Другая сумма (KGS)"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="form-input"
              style={{ marginBottom: '16px' }}
            />

            <p className="simple-page__form-label">Получатель</p>
            <input type="text" placeholder="Имя получателя" value={form.recipientName}
              onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
              className="form-input" style={{ marginBottom: '10px' }} />
            <input type="email" placeholder="Email получателя" value={form.recipientEmail}
              onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
              className="form-input" style={{ marginBottom: '10px' }} />
            <textarea placeholder="Персональное пожелание..." value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="simple-page__textarea" rows={2}
              style={{ marginBottom: '10px' }} />
            <input type="text" placeholder="Ваше имя" value={form.senderName}
              onChange={(e) => setForm({ ...form, senderName: e.target.value })}
              className="form-input" style={{ marginBottom: '16px' }} />

            <button className="btn-gold simple-page__btn">
              Купить карту за {finalAmount.toLocaleString('ru-RU')} KGS
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
