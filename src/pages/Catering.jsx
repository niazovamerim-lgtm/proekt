import React from 'react'
import './SimplePage.css'

const packages = [
  { title: 'Базовый', guests: 'до 20 чел.', price: 'от 15 000 KGS', features: ['Холодные закуски', 'Горячие блюда', 'Напитки', 'Сервировка'] },
  { title: 'Стандарт', guests: 'до 50 чел.', price: 'от 35 000 KGS', features: ['Всё из Базового', 'Десерты', 'Торт на заказ', 'Официанты'] },
  { title: 'Премиум', guests: 'до 150 чел.', price: 'от 80 000 KGS', features: ['Всё из Стандарт', 'Живая музыка', 'Декор', 'Фотозона', 'VIP сервис'] },
]

export default function Catering() {
  return (
    <div className="page-bg">
      <div className="page-content">
        <h1 className="page-title">Кейтеринг</h1>
        <div className="page-title-divider" />

        <p className="simple-page__desc">
          Мы организуем выездное обслуживание мероприятий любого масштаба — от камерного ужина
          до грандиозного банкета. Наши шефы привезут ресторанное качество прямо к вам.
        </p>

        <div className="simple-page__cards">
          {packages.map((pkg) => (
            <div key={pkg.title} className="card simple-page__pkg-card">
              <h3 className="simple-page__pkg-title">{pkg.title}</h3>
              <p className="simple-page__pkg-guests">{pkg.guests}</p>
              <p className="simple-page__pkg-price">{pkg.price}</p>
              <ul className="simple-page__pkg-features">
                {pkg.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <button className="btn-gold simple-page__btn">Заказать</button>
            </div>
          ))}
        </div>

        <div className="card simple-page__contact">
          <h3 className="section-heading">Связаться с нами</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Оставьте заявку и мы обсудим детали вашего мероприятия
          </p>
          <div className="simple-page__form-row">
            <input type="text" placeholder="Ваше имя" className="form-input" />
            <input type="tel" placeholder="+996 ___-___-___" className="form-input" />
            <button className="btn-gold">Отправить</button>
          </div>
        </div>
      </div>
    </div>
  )
}
