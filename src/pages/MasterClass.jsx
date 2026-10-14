import React, { useState } from 'react'
import './SimplePage.css'

const classes = [
  {
    title: 'Итальянская паста',
    date: '2026-10-15',
    time: '14:00',
    duration: '3 часа',
    price: '2 500 KGS',
    seats: 8,
    img: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80',
  },
  {
    title: 'Французские десерты',
    date: '2026-10-22',
    time: '11:00',
    duration: '4 часа',
    price: '3 000 KGS',
    seats: 6,
    img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
  },
  {
    title: 'Суши и роллы',
    date: '2026-11-05',
    time: '16:00',
    duration: '3 часа',
    price: '2 800 KGS',
    seats: 10,
    img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80',
  },
]

export default function MasterClass() {
  const [enrolled, setEnrolled] = useState([])

  const enroll = (title) => {
    if (!enrolled.includes(title)) setEnrolled([...enrolled, title])
  }

  return (
    <div className="page-bg">
      <div className="page-content">
        <h1 className="page-title">Мастер-классы</h1>
        <div className="page-title-divider" />

        <p className="simple-page__desc">
          Научитесь готовить шедевры под руководством наших шеф-поваров.
          Каждый мастер-класс — это уникальный опыт, который вы унесёте с собой.
        </p>

        <div className="simple-page__mc-grid">
          {classes.map((cls) => (
            <div key={cls.title} className="card simple-page__mc-card">
              <div className="simple-page__mc-img-wrap">
                <img src={cls.img} alt={cls.title} className="simple-page__mc-img" />
              </div>
              <div className="simple-page__mc-body">
                <h3 className="simple-page__mc-title">{cls.title}</h3>
                <div className="simple-page__mc-meta">
                  <span>📅 {cls.date}</span>
                  <span>🕐 {cls.time}</span>
                  <span>⏱ {cls.duration}</span>
                  <span>👥 Мест: {cls.seats}</span>
                </div>
                <p className="simple-page__mc-price">{cls.price}</p>
                <button
                  className={enrolled.includes(cls.title) ? 'btn-dark simple-page__btn' : 'btn-gold simple-page__btn'}
                  onClick={() => enroll(cls.title)}
                  disabled={enrolled.includes(cls.title)}
                >
                  {enrolled.includes(cls.title) ? '✓ Записан' : 'Записаться'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
