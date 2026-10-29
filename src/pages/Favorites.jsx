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
            <p>{t('favoriteListEmpty')}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {t('favoriteHint')}
            </p>
          </div>
        ) : (
          <>
            <p className="menu-page__count">
              {t('favoritesCount')} <strong>{favorites.length}</strong>
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
