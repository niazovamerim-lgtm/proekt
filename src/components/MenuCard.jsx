import React from 'react'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useLang } from '../context/LangContext'
import './MenuCard.css'

export default function MenuCard({ item }) {
  const { addItem, items } = useCart()
  const { toggle, isFav } = useFavorites()
  const { t } = useLang()

  const inCart = items.some(i => i.id === item.id)
  const fav = isFav(item.id)

  return (
    <div className="menu-card">
      <div className="menu-card__img-wrap">
        <img src={item.img} alt={item.name} className="menu-card__img" loading="lazy" />
        <button
          className={`menu-card__fav ${fav ? 'menu-card__fav--active' : ''}`}
          onClick={() => toggle(item)}
          aria-label="Сүйүктүүлөргө кош"
        >
          {fav ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="menu-card__body">
        <h3 className="menu-card__name">{item.name}</h3>
        <p className="menu-card__desc">{item.desc}</p>
        <div className="menu-card__footer">
          <span className="menu-card__price">{item.price} KGS</span>
          <button
            className={inCart ? 'btn-dark menu-card__btn' : 'btn-gold menu-card__btn'}
            onClick={() => addItem(item)}
          >
            {inCart ? '✓ Добавлено' : t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  )
}
