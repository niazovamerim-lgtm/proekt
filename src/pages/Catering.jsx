import React, { useState } from 'react'
import { useLang } from '../context/LangContext'
import { useFetch } from '../hooks/useFetch'
import { createReservation, getCateringPackages } from '../services/api'
import PhoneInput from '../components/PhoneInput'
import './SimplePage.css'

function localizedValue(item, field, lang) {
  return item[`${field}${lang === 'kg' ? 'Kg' : lang === 'en' ? 'En' : ''}`] || item[field] || ''
}

export default function Catering() {
  const { t, lang, translateError } = useLang()
  const { data: packages, loading, error } = useFetch(getCateringPackages, [])
  const [selectedPackageId, setSelectedPackageId] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const selectPackage = (pkg) => {
    setSelectedPackageId(String(pkg.id))
    document.getElementById('catering-contact')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const selectedPackage = packages?.find(pkg => String(pkg.id) === selectedPackageId)
    if (!selectedPackage) {
      setSubmitError(t('cateringChoosePackage'))
      return
    }

    setSaving(true)
    setSubmitError('')
    setSubmitted(false)
    try {
      await createReservation({
        type: 'catering',
        packageId: selectedPackage.id,
        packageTitle: localizedValue(selectedPackage, 'title', lang),
        guests: localizedValue(selectedPackage, 'guests', lang),
        name: name.trim(),
        contact: contact.trim(),
      })
      setSubmitted(true)
      setName('')
      setContact('')
    } catch (requestError) {
      setSubmitError(translateError(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-bg">
      <div className="page-content">
        <h1 className="page-title">{t('catering')}</h1>
        <div className="page-title-divider" />

        <p className="simple-page__desc">{t('cateringDescription')}</p>

        {loading && <p role="status">{t('adminLoading')}</p>}
        {error && <p className="simple-page__error" role="alert">{translateError(new Error(error))}</p>}
        {!loading && !error && (
          <div className="simple-page__cards">
            {packages.map((pkg) => {
              const features = pkg.features?.[lang]?.length ? pkg.features[lang] : pkg.features?.ru || []
              return (
                <div key={pkg.id} className="card simple-page__pkg-card">
                  <h3 className="simple-page__pkg-title">{localizedValue(pkg, 'title', lang)}</h3>
                  <p className="simple-page__pkg-guests">{localizedValue(pkg, 'guests', lang)}</p>
                  <p className="simple-page__pkg-price">
                    {t('from')} {Number(pkg.price).toLocaleString(lang === 'kg' ? 'ky-KG' : lang === 'en' ? 'en-US' : 'ru-RU')} сом
                  </p>
                  <ul className="simple-page__pkg-features">
                    {features.map((feature, index) => <li key={`${pkg.id}-${index}`}>✓ {feature}</li>)}
                  </ul>
                  <button type="button" className="btn-gold simple-page__btn" onClick={() => selectPackage(pkg)}>
                    {t('orderService')}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div id="catering-contact" className="card simple-page__contact">
          <h3 className="section-heading">{t('contactUs')}</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            {t('cateringContact')}
          </p>
          {submitted && <p className="simple-page__success" role="status">{t('cateringRequestSuccess')}</p>}
          {submitError && <p className="simple-page__error" role="alert">{submitError}</p>}
          <form className="simple-page__form-row" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder={t('yourName')}
              className="form-input"
              value={name}
              onChange={event => setName(event.target.value)}
              maxLength={100}
              required
            />
            <PhoneInput id="catering-contact-phone" name="contact" value={contact}
              onChange={setContact} required t={t} lang={lang} />
            <select
              className="form-input"
              value={selectedPackageId}
              onChange={event => setSelectedPackageId(event.target.value)}
              required
              aria-label={t('cateringChoosePackage')}
            >
              <option value="">{t('cateringChoosePackage')}</option>
              {(packages || []).map(pkg => (
                <option key={pkg.id} value={pkg.id}>{localizedValue(pkg, 'title', lang)}</option>
              ))}
            </select>
            <button type="submit" className="btn-gold" disabled={saving || loading || Boolean(error)}>
              {saving ? t('saving') : t('send')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
