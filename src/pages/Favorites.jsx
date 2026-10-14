import React from 'react'
import { useFavorites } from '../context/FavoritesContext'
import { useLang } from '../context/LangContext'
import MenuCard from '../components/MenuCard'
import './Menu.css'

export default function Favorites() {
  const { favorites } = useFavorites()
  const { t } = useLang()

  return (
    <div className="page-bg">
      <div className="page-content menu-page__content">
        <h1 className="page-title">❤️ {t('favorites')}</h1>
        <div className="page-title-divider" />

        {favorites.length === 0 ? (
          <div className="menu-page__empty">
            <span>🤍</span>
            <p>Сүйүктүүлөрдүн тизмеси бош</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Меню баракчасынан жүрөкчөнү басыңыз
            </p>
          </div>
        ) : (
          <>
            <p className="menu-page__count">
              Сүйүктүүлөр: <strong>{favorites.length}</strong>
            </p>
            <div className="menu-page__grid">
              {favorites.map(item => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
