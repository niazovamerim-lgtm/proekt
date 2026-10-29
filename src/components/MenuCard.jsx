import React from 'react'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useLang } from '../context/LangContext'
import './MenuCard.css'

function optimizeImageUrl(src) {
  if (!src) return src
  try {
    const image = new URL(src, window.location.href)
    if (image.hostname !== 'images.unsplash.com') return src
    image.searchParams.set('auto', 'format')
    image.searchParams.set('fit', 'crop')
    image.searchParams.set('w', '640')
    image.searchParams.set('q', '75')
    return image.href
  } catch {
    return src
  }
}

export default function MenuCard({ item }) {
  const { addItem, items } = useCart()
  const { toggle, isFav } = useFavorites()
  const { t, lang } = useLang()
  const name = lang === 'kg' ? item.nameKg || item.name : lang === 'en' ? item.nameEn || item.name : item.name
  const desc = lang === 'kg' ? item.descKg || item.desc : lang === 'en' ? item.descEn || item.desc : item.desc
  const localizedItem = { ...item, name, desc }
  const image = optimizeImageUrl(item.img)

  const inCart = items.some(i => i.id === item.id)
  const fav = isFav(item.id)

  return (
    <div className="menu-card">
      <div className="menu-card__img-wrap">
        <img
          src={image}
          alt={name}
          className="menu-card__img"
          loading="lazy"
          decoding="async"
          width="640"
          height="420"
        />
        <button
          className={`menu-card__fav ${fav ? 'menu-card__fav--active' : ''}`}
          onClick={() => toggle(localizedItem)}
          aria-label={t('addToFavorites')}
        >
          {fav ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="menu-card__body">
        <h3 className="menu-card__name">{name}</h3>
        <p className="menu-card__desc">{desc}</p>
        <div className="menu-card__footer">
          <span className="menu-card__price">{item.price} KGS</span>
          <button
            className={inCart ? 'btn-dark menu-card__btn' : 'btn-gold menu-card__btn'}
            onClick={() => addItem(localizedItem)}
          >
            {inCart ? `✓ ${t('added')}` : t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  )
}
