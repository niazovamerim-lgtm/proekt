import React, { useEffect, useRef, useState } from 'react'
import { useLang } from '../context/LangContext'
import './Addresses.css'

const BISHKEK_CENTER = [42.8746, 74.5698]
const YANDEX_MAPS_SCRIPT_URL = 'https://api-maps.yandex.ru/2.1/'

let yandexMapsPromise

function loadYandexMaps(apiKey) {
  if (window.ymaps) {
    return new Promise(resolve => window.ymaps.ready(() => resolve(window.ymaps)))
  }
  if (yandexMapsPromise) return yandexMapsPromise

  yandexMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const scriptUrl = new URL(YANDEX_MAPS_SCRIPT_URL)
    scriptUrl.searchParams.set('apikey', apiKey)
    scriptUrl.searchParams.set('lang', 'ru_RU')
    script.src = scriptUrl.href
    script.async = true
    script.onload = () => {
      if (!window.ymaps) {
        reject(new Error('Yandex Maps API loaded without its API'))
        return
      }
      window.ymaps.ready(() => resolve(window.ymaps))
    }
    script.onerror = () => reject(new Error('Failed to load Yandex Maps API'))
    document.head.appendChild(script)
  }).catch(error => {
    yandexMapsPromise = null
    throw error
  })

  return yandexMapsPromise
}

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
  const [mapStatus, setMapStatus] = useState('loading')
  const mapContainerRef = useRef(null)
  const mapApiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY?.trim()
  const selectedAddress = addresses.find(address => address.id === active)
  const selectedAddressLabel = t(selectedAddress.labelKey)
  const searchUrl = `https://yandex.com/maps/?text=${encodeURIComponent(
    `${selectedAddressLabel} ${t('cityBishkek')}`,
  )}`

  useEffect(() => {
    if (!mapApiKey) {
      setMapStatus('missing-key')
      return undefined
    }

    let disposed = false
    let map
    setMapStatus('loading')

    loadYandexMaps(mapApiKey)
      .then(ymaps => {
        if (disposed || !mapContainerRef.current) return
        map = new ymaps.Map('addresses__map_canvas', {
          center: BISHKEK_CENTER,
          zoom: 12,
          controls: ['zoomControl', 'typeSelector', 'fullscreenControl'],
          behaviors: ['drag', 'scrollZoom', 'dblClickZoom', 'multiTouch'],
        })
        setMapStatus('ready')
      })
      .catch(error => {
        if (disposed) return
        console.error('Unable to initialize the Yandex map:', error)
        setMapStatus('error')
      })

    return () => {
      disposed = true
      map?.destroy()
    }
  }, [mapApiKey])

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

            <div className="addresses__map-canvas" id="addresses__map_canvas" ref={mapContainerRef}>
              {mapStatus !== 'ready' && (
                <p className="addresses__map-state" role={mapStatus === 'error' ? 'alert' : 'status'}>
                  {mapStatus === 'missing-key'
                    ? t('mapKeyMissing')
                    : mapStatus === 'error'
                      ? t('mapLoadError')
                      : t('mapLoading')}
                </p>
              )}
            </div>

            <p className="addresses__map-note">{t('mapPointsPending')}</p>
          </section>
        </div>

        <div className="addresses__selected card">
          <p className="addresses__selected-label">{t('selectedAddress')}</p>
          <p className="addresses__selected-value">
            {selectedAddressLabel}, {t('cityBishkek')}
          </p>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold addresses__btn"
          >
            {t('openYandexMaps')}
          </a>
        </div>
      </div>
    </div>
  )
}
