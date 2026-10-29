import React, { useState } from 'react'
import { useLang } from '../context/LangContext'
import './Addresses.css'

const addresses = [
  { id: 1, labelKey: 'addressKiev' },
  { id: 2, labelKey: 'addressChui' },
  { id: 3, labelKey: 'addressSadovaya' },
  { id: 4, labelKey: 'addressKoriolik' },
  { id: 5, labelKey: 'addressMira' },
]

// Пин позициялары (карта заглушкасы үчүн %)
const pinPositions = [
  { left: '22%', top: '38%' },
  { left: '42%', top: '25%' },
  { left: '35%', top: '55%' },
  { left: '60%', top: '42%' },
  { left: '55%', top: '65%' },
]

export default function Addresses() {
  const { t } = useLang()
  const [active, setActive] = useState(1)

  return (
    <div className="page-bg">
      <div className="page-content">
        <h1 className="page-title">{t('ourAddresses')}</h1>
        <div className="page-title-divider" />

        <div className="addresses__body">
          {/* Список адресов */}
          <ul className="addresses__list">
            {addresses.map((addr) => (
              <li
                key={addr.id}
                className={`addresses__item${active === addr.id ? ' addresses__item--active' : ''}`}
                onClick={() => setActive(addr.id)}
              >
                <span className="addresses__pin-icon">📍</span>
                {t(addr.labelKey)}
              </li>
            ))}
          </ul>

          {/* Карта — интерактивная заглушка */}
          <div className="addresses__map-wrap">
            <div className="addresses__map-header">
              <span className="addresses__map-badge">📍 {t('cityBishkek')}</span>
            </div>

            <div className="addresses__map-canvas">
              {/* Дорожная сетка */}
              <div className="addresses__map-grid" />

              {/* Пины */}
              {addresses.map((addr, i) => (
                <button
                  key={addr.id}
                  className={`addresses__map-pin${active === addr.id ? ' addresses__map-pin--active' : ''}`}
                  style={pinPositions[i]}
                  onClick={() => setActive(addr.id)}
                  title={t(addr.labelKey)}
                  aria-label={t(addr.labelKey)}
                >
                  <svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="addresses__pin-svg">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20C24 5.373 18.627 0 12 0z"
                      fill={active === addr.id ? 'var(--color-gold)' : 'var(--color-gold-dim)'} />
                    <circle cx="12" cy="12" r="4" fill="white" />
                  </svg>
                  {active === addr.id && (
                    <span className="addresses__pin-label">{t(addr.labelKey)}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Выбранный адрес */}
        <div className="addresses__selected card">
          <p className="addresses__selected-label">{t('selectedAddress')}</p>
          <p className="addresses__selected-value">
            {t(addresses.find((a) => a.id === active).labelKey)}, {t('cityBishkek')}
          </p>
          <a
            href={`https://2gis.ru/bishkek/search/${encodeURIComponent(
              t(addresses.find((a) => a.id === active).labelKey) + ' ' + t('cityBishkek')
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold addresses__btn"
          >
            {t('open2gis')}
          </a>
        </div>
      </div>
    </div>
  )
}
