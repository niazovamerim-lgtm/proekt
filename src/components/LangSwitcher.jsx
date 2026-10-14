import React from 'react'
import { useLang } from '../context/LangContext'
import './LangSwitcher.css'

const langs = ['kg', 'ru', 'en']
const flags = { kg: '🇰🇬', ru: '🇷🇺', en: '🇬🇧' }

export default function LangSwitcher() {
  const { lang, changeLang } = useLang()

  return (
    <div className="lang-switcher">
      {langs.map(l => (
        <button
          key={l}
          className={`lang-switcher__btn ${lang === l ? 'lang-switcher__btn--active' : ''}`}
          onClick={() => changeLang(l)}
          title={l.toUpperCase()}
        >
          {flags[l]} {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
