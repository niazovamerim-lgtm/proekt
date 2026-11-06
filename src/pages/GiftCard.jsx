import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { createGiftCard, getGiftCard } from '../services/api'
import './SimplePage.css'

const amounts = [1000, 2000, 3000, 5000, 10000]

function getGiftCardShareLink(code) {
  const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim()
  const siteUrl = new URL(configuredSiteUrl || window.location.origin)
  const localHosts = new Set(['localhost', '127.0.0.1', '::1'])
  const isPublic = Boolean(configuredSiteUrl) || !localHosts.has(siteUrl.hostname)
  return {
    link: new URL(`/giftcard/${encodeURIComponent(code)}`, siteUrl.origin).toString(),
    isPublic,
  }
}

export default function GiftCard() {
  const { t, lang, translateError } = useLang()
  const { code } = useParams()
  const [selected, setSelected] = useState(3000)
  const [custom, setCustom] = useState('')
  const [form, setForm] = useState({ recipientName: '', recipientEmail: '', message: '', senderName: '' })
  const [purchasedCard, setPurchasedCard] = useState(null)
  const [giftCard, setGiftCard] = useState(null)
  const [loadingCard, setLoadingCard] = useState(Boolean(code))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const finalAmount = custom ? Number(custom) : selected
  const locale = lang === 'kg' ? 'ky-KG' : lang === 'en' ? 'en-US' : 'ru-RU'
  const resultCard = code ? giftCard : purchasedCard
  const share = resultCard ? getGiftCardShareLink(resultCard.code) : null
  const shareLink = share?.link || ''

  useEffect(() => {
    if (!code) {
      setGiftCard(null)
      setLoadingCard(false)
      setError('')
      return
    }

    let active = true
    setLoadingCard(true)
    setError('')
    getGiftCard(code)
      .then(card => {
        if (active) setGiftCard(card)
      })
      .catch(requestError => {
        if (active) setError(requestError.status === 404 ? t('giftCardNotFound') : translateError(requestError))
      })
      .finally(() => {
        if (active) setLoadingCard(false)
      })
    return () => { active = false }
  }, [code, t, translateError])

  const handlePurchase = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const card = await createGiftCard({ ...form, amount: finalAmount })
      setPurchasedCard(card)
      setCopied(false)
      setCopyError(false)
    } catch (requestError) {
      setError(translateError(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyLink = async () => {
    setCopied(false)
    setCopyError(false)
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
    } catch {
      setCopyError(true)
    }
  }

  const cardContent = resultCard && (
    <div className="simple-page__giftcard-layout">
      <div className="simple-page__giftcard-preview">
        <div className="simple-page__giftcard-card">
          <div className="simple-page__giftcard-logo">РЕСТИК</div>
          <div className="simple-page__giftcard-divider" />
          <p className="simple-page__giftcard-label">{t('giftCard')}</p>
          <p className="simple-page__giftcard-amount">{Number(resultCard.amount).toLocaleString(locale)} сом</p>
          {resultCard.recipientName && (
            <p className="simple-page__giftcard-recipient">{t('recipientPrefix')} {resultCard.recipientName}</p>
          )}
          {resultCard.message && (
            <p className="simple-page__giftcard-msg">«{resultCard.message}»</p>
          )}
        </div>
      </div>
      <section className="card simple-page__giftcard-form simple-page__giftcard-result">
        <h2 className="section-heading">{code ? t('giftCardReceived') : t('giftCardSuccess')}</h2>
        <p className="simple-page__giftcard-notice" role="status">{t('giftCardDemo')}</p>
        {!code && !resultCard.telegramNotificationSent && (
          <p className="simple-page__error" role="alert">{t('telegramGiftCardWarning')}</p>
        )}
        {!share?.isPublic && (
          <p className="simple-page__error" role="alert">{t('giftCardLocalLinkWarning')}</p>
        )}
        <p className="simple-page__form-label">{t('giftCardShareHint')}</p>
        <input className="form-input" type="url" readOnly value={shareLink} onFocus={event => event.target.select()} />
        <button className="btn-gold simple-page__btn" type="button" onClick={handleCopyLink} disabled={!share?.isPublic}>
          {copied ? t('giftCardCopied') : t('giftCardCopy')}
        </button>
        {copyError && <p className="simple-page__error" role="alert">{t('giftCardCopyFailed')}</p>}
      </section>
    </div>
  )

  return (
    <div className="page-bg">
      <div className="page-content">
        <h1 className="page-title">{t('giftCard')}</h1>
        <div className="page-title-divider" />

        {loadingCard ? (
          <p role="status">{t('loading')}</p>
        ) : error && code ? (
          <p className="simple-page__error" role="alert">{error}</p>
        ) : resultCard ? cardContent : (
          <form className="simple-page__giftcard-layout" onSubmit={handlePurchase}>
            <div className="simple-page__giftcard-preview">
              <div className="simple-page__giftcard-card">
                <div className="simple-page__giftcard-logo">РЕСТИК</div>
                <div className="simple-page__giftcard-divider" />
                <p className="simple-page__giftcard-label">{t('giftCard')}</p>
                <p className="simple-page__giftcard-amount">{finalAmount.toLocaleString(locale)} сом</p>
                {form.recipientName && (
                  <p className="simple-page__giftcard-recipient">{t('recipientPrefix')} {form.recipientName}</p>
                )}
                {form.message && (
                  <p className="simple-page__giftcard-msg">«{form.message}»</p>
                )}
              </div>
            </div>

          <div className="card simple-page__giftcard-form">
            <h3 className="section-heading">{t('giftCardCustomize')}</h3>
            <p className="simple-page__giftcard-notice">{t('giftCardDemo')}</p>

            <p className="simple-page__form-label">{t('amount')}</p>
            <div className="simple-page__amounts">
              {amounts.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`simple-page__amount-btn${selected === a && !custom ? ' simple-page__amount-btn--active' : ''}`}
                  onClick={() => { setSelected(a); setCustom('') }}
                >
                  {a.toLocaleString(locale)} сом
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder={t('otherAmount')}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="form-input"
              min="100"
              max="100000"
              step="1"
              style={{ marginBottom: '16px' }}
            />

            <p className="simple-page__form-label">{t('recipient')}</p>
            <input type="text" placeholder={t('recipientName')} value={form.recipientName} required maxLength={100}
              onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
              className="form-input" style={{ marginBottom: '10px' }} />
            <input type="email" placeholder={t('recipientEmail')} value={form.recipientEmail} required maxLength={254}
              onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
              className="form-input" style={{ marginBottom: '10px' }} />
            <textarea placeholder={t('personalMessage')} value={form.message} maxLength={500}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="simple-page__textarea" rows={2}
              style={{ marginBottom: '10px' }} />
            <input type="text" placeholder={t('senderName')} value={form.senderName} required maxLength={100}
              onChange={(e) => setForm({ ...form, senderName: e.target.value })}
              className="form-input" style={{ marginBottom: '16px' }} />
            {error && <p className="simple-page__error" role="alert">{error}</p>}
            <button className="btn-gold simple-page__btn" type="submit" disabled={submitting || !Number.isInteger(finalAmount) || finalAmount < 100 || finalAmount > 100000}>
              {submitting ? t('giftCardSubmit') : <>{t('buyCard')} {finalAmount.toLocaleString(locale)} сом</>}
            </button>
          </div>
          </form>
        )}
      </div>
    </div>
  )
}
