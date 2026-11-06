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

export default function Addresses() {
  const { t } = useLang()
  const [active, setActive] = useState(1)
  const selectedAddress = addresses.find(address => address.id === active)
  const selectedAddressLabel = t(selectedAddress.labelKey)
  const searchQuery = `${selectedAddressLabel}, ${t('cityBishkek')}`
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&output=embed`
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`

  return (
    <div className="page-bg">
      <div className="page-content">
        <h1 className="page-title">{t('ourAddresses')}</h1>
        <div className="page-title-divider" />

        <div className="addresses__body">
          <ul className="addresses__list">
            {addresses.map(address => (
              <li key={address.id}>
                <button
                  type="button"
                  className={`addresses__item${active === address.id ? ' addresses__item--active' : ''}`}
                  onClick={() => setActive(address.id)}
                  aria-pressed={active === address.id}
                >
                  <svg className="addresses__pin-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
                    <circle cx="12" cy="10" r="2.4" />
                  </svg>
                  {t(address.labelKey)}
                </button>
              </li>
            ))}
          </ul>

          <section className="addresses__map-wrap" aria-label={t('mapAccessibleName')}>
            <div className="addresses__map-header">
              <span className="addresses__map-badge">
                <svg className="addresses__map-badge-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
                  <circle cx="12" cy="10" r="2.4" />
                </svg>
                {t('cityBishkek')}
              </span>
            </div>

            <div className="addresses__map-canvas">
              <iframe
                key={active}
                className="addresses__map-frame"
                src={mapUrl}
                title={`${t('mapAccessibleName')}: ${searchQuery}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <p className="addresses__map-note">{t('mapPointsPending')}</p>
          </section>
        </div>

        <div className="addresses__selected card">
          <p className="addresses__selected-label">{t('selectedAddress')}</p>
          <p className="addresses__selected-value">{searchQuery}</p>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold addresses__btn"
          >
            {t('openGoogleMaps')}
          </a>
        </div>
      </div>
    </div>
  )
}
