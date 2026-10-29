import React from 'react'
import { useLang } from '../context/LangContext'
import './SimplePage.css'

const packages = [
  { title: 'Базовый', guests: 'до 20 чел.', price: 15000, features: ['Холодные закуски', 'Горячие блюда', 'Напитки', 'Сервировка'] },
  { title: 'Стандарт', guests: 'до 50 чел.', price: 35000, features: ['Всё из Базового', 'Десерты', 'Торт на заказ', 'Официанты'] },
  { title: 'Премиум', guests: 'до 150 чел.', price: 80000, features: ['Всё из Стандарт', 'Десерты', 'Торт на заказ', 'VIP сервис'] },
]

export default function Catering() {
  const { t } = useLang()
  const packageLabels = ['packageBasic', 'packageStandard', 'packagePremium']
  const guestLabels = ['upTo20', 'upTo50', 'upTo150']
  const featureLabels = [
    ['coldSnacks', 'hotMeals', 'drinks', 'tableSetting'],
    ['everythingBasic', 'desserts', 'customCake', 'waiters'],
    ['everythingStandard', 'liveMusic', 'decor', 'photoZone', 'vipService'],
  ]
  return (
    <div className="page-bg">
      <div className="page-content">
        <h1 className="page-title">{t('catering')}</h1>
        <div className="page-title-divider" />

        <p className="simple-page__desc">
          {t('cateringDescription')}
        </p>

        <div className="simple-page__cards">
          {packages.map((pkg, index) => (
            <div key={pkg.title} className="card simple-page__pkg-card">
              <h3 className="simple-page__pkg-title">{t(packageLabels[index])}</h3>
              <p className="simple-page__pkg-guests">{t(guestLabels[index])}</p>
              <p className="simple-page__pkg-price">{t('from')} {pkg.price.toLocaleString('ru-RU')} KGS</p>
              <ul className="simple-page__pkg-features">
                {featureLabels[index].map((feature) => (
                  <li key={feature}>✓ {t(feature)}</li>
                ))}
              </ul>
              <button className="btn-gold simple-page__btn">{t('orderService')}</button>
            </div>
          ))}
        </div>

        <div className="card simple-page__contact">
          <h3 className="section-heading">{t('contactUs')}</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            {t('cateringContact')}
          </p>
          <div className="simple-page__form-row">
            <input type="text" placeholder={t('yourName')} className="form-input" />
            <input type="tel" placeholder="+996 ___-___-___" className="form-input" />
            <button className="btn-gold">{t('send')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
