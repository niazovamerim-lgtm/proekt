import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LangContext'
import './ThemeToggle.css'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLang()

  return (
    <button
      className={`theme-toggle ${theme === 'light' ? 'theme-toggle--light' : ''}`}
      onClick={toggleTheme}
      aria-label={t('toggleTheme')}
      title={theme === 'dark' ? t('themeDay') : t('themeNight')}
    >
      <span className="theme-toggle__icon">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  )
}
