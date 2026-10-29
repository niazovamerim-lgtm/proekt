import React from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import './About.css'

export default function About() {
  const { t } = useLang()
  return (
    <div className="page-bg about-page">
      <div className="page-content about-page__content">
        <section className="about-hero">
          <div className="about-hero__content">
            <p className="about-hero__eyebrow">{t('restaurantBishkek')}</p>
            <h1 className="about-hero__title">{t('heroTitle')}</h1>
            <p className="about-hero__description">
              {t('heroDescription')}
            </p>
            <Link to="/menu" className="btn-gold about-hero__button">
              {t('openMenu')} <span aria-hidden="true">↗</span>
            </Link>
            <div className="about-hero__note">
              <span className="about-hero__note-mark" aria-hidden="true">✳</span>
              <span>{t('cookingSince')}<br /><strong>{t('since2018')}</strong></span>
            </div>
          </div>
          <div className="about-hero__image-wrap">
            <div className="about-hero__image-ring">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=720&q=75"
                alt={t('freshDaily')}
                className="about-hero__image"
                width="720"
                height="720"
                sizes="(max-width: 760px) 90vw, 610px"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <span className="about-hero__image-caption">{t('freshDaily')}</span>
          </div>
        </section>

        <section className="about-story">
          <div className="about-story__heading">
            <p className="about-story__eyebrow">{t('ourStory')}</p>
            <h2 className="about__subtitle">{t('storyTitle')}</h2>
          </div>
          <div className="about__body">
            <div className="about__text-col">
              <section className="about__section">
                <h3 className="section-heading">{t('ourStart')}</h3>
                <p className="about__paragraph">
                  {t('storyBeginning')}
                </p>
              </section>
              <section className="about__section">
                <h3 className="section-heading">{t('beginning')}</h3>
                <p className="about__paragraph">
                  {t('storyVision')}
                </p>
                <p className="about__paragraph">
                  {t('storyPhilosophy')}
                </p>
              </section>
              <section className="about__section">
                <h3 className="section-heading">{t('values')}</h3>
                <p className="about__paragraph">
                  {t('valuesText')}
                </p>
              </section>
            </div>
            <div className="about__photo-col">
              <div className="about__photo-frame">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=520&q=75"
                  alt={t('cozyAtmosphere')}
                  className="about__photo"
                  loading="lazy"
                  decoding="async"
                  width="520"
                  height="520"
                  sizes="(max-width: 760px) 80vw, 390px"
                />
              </div>
              <p className="about__photo-caption">{t('cozyAtmosphere')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
