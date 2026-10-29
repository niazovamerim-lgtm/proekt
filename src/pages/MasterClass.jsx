import React, { useEffect, useState } from 'react'
import { useLang } from '../context/LangContext'
import { getMasterClasses } from '../services/api'
import './SimplePage.css'

export default function MasterClass() {
  const { t, lang, translateError } = useLang()
  const [classes, setClasses] = useState([])
  const [enrolled, setEnrolled] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getMasterClasses()
      .then(savedClasses => {
        if (active) setClasses(savedClasses)
      })
      .catch(requestError => {
        if (active) setError(translateError(requestError))
      })
    return () => { active = false }
  }, [translateError])

  const enroll = (id) => {
    if (!enrolled.includes(id)) setEnrolled([...enrolled, id])
  }

  const locale = lang === 'kg' ? 'ky-KG' : lang === 'en' ? 'en-US' : 'ru-RU'

  return (
    <div className="page-bg">
      <div className="page-content">
        <h1 className="page-title">{t('masterclasses')}</h1>
        <div className="page-title-divider" />

        <p className="simple-page__desc">
          {t('masterclassDescription')}
        </p>

        {error && <p className="simple-page__error" role="alert">{error}</p>}
        {!error && classes.length === 0 && <p className="simple-page__booking-empty">{t('adminLoading')}</p>}

        <div className="simple-page__mc-grid">
          {classes.map((cls) => {
            const title = lang === 'kg' ? cls.titleKg || cls.title : lang === 'en' ? cls.titleEn || cls.title : cls.title
            const duration = lang === 'kg' ? cls.durationKg || cls.duration : lang === 'en' ? cls.durationEn || cls.duration : cls.duration
            const isEnrolled = enrolled.includes(cls.id)
            return (
              <div key={cls.id} className="card simple-page__mc-card">
                <div className="simple-page__mc-img-wrap">
                  <img
                    src={cls.img}
                    alt={title}
                    className="simple-page__mc-img"
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="260"
                  />
                </div>
                <div className="simple-page__mc-body">
                  <h3 className="simple-page__mc-title">{title}</h3>
                  <div className="simple-page__mc-meta">
                    <span>📅 {new Date(`${cls.date}T12:00:00`).toLocaleDateString(locale)}</span>
                    <span>🕐 {cls.time}</span>
                    <span>⏱ {duration}</span>
                    <span>👥 {t('seats')} {cls.seats}</span>
                  </div>
                  <p className="simple-page__mc-price">{cls.price}</p>
                  <button
                    className={isEnrolled ? 'btn-dark simple-page__btn' : 'btn-gold simple-page__btn'}
                    onClick={() => enroll(cls.id)}
                    disabled={isEnrolled}
                  >
                    {isEnrolled ? `✓ ${t('registered')}` : t('signUp')}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
