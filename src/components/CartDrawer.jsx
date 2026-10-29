import React, { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useLang } from '../context/LangContext'
import { createOrder } from '../services/api'
import './CartDrawer.css'

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQty, clearCart, total, count } = useCart()
  const { t, lang } = useLang()
  const localizedName = item => lang === 'kg' ? item.nameKg || item.name : lang === 'en' ? item.nameEn || item.name : item.name
  const [ordering, setOrdering] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const [orderError, setOrderError] = useState('')

  const handleOrder = async () => {
    if (items.length === 0) return
    setOrdering(true)
    setOrderError('')
    try {
      await createOrder({
        items: items.map(i => ({ id: i.id, name: localizedName(i), qty: i.qty, price: i.price })),
        total,
        status: 'new',
        createdAt: new Date().toISOString(),
      })
      clearCart()
      setOrdered(true)
      setTimeout(() => { setOrdered(false); onClose() }, 2000)
    } catch (e) {
      setOrderError(t('orderFailed'))
    } finally {
      setOrdering(false)
    }
  }

  return (
    <>
      <div className={`cart-overlay ${open ? 'cart-overlay--open' : ''}`} onClick={onClose} />

      <aside className={`cart-drawer ${open ? 'cart-drawer--open' : ''}`}>
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">🛒 {t('cartTitle')} ({count})</h2>
          <button className="cart-drawer__close" onClick={onClose} aria-label={t('close')}>✕</button>
        </div>

        <div className="cart-drawer__body">
          {ordered ? (
            <div className="cart-drawer__success">
              <span>✅</span>
              <p>{t('orderSent')}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="cart-drawer__empty">
              <span className="cart-drawer__empty-icon">🍽️</span>
              <p>{t('cartEmpty')}</p>
            </div>
          ) : (
            <ul className="cart-drawer__list">
              {items.map(item => (
                <li key={item.id} className="cart-drawer__item">
                  <img src={item.img} alt={localizedName(item)} className="cart-drawer__img" loading="lazy" decoding="async" />
                  <div className="cart-drawer__info">
                    <p className="cart-drawer__name">{localizedName(item)}</p>
                    <p className="cart-drawer__price">{item.price} KGS</p>
                  </div>
                  <div className="cart-drawer__qty">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <button className="cart-drawer__remove" onClick={() => removeItem(item.id)}>✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && !ordered && (
          <div className="cart-drawer__footer">
            {orderError && <p className="cart-drawer__error">{orderError}</p>}
            <div className="cart-drawer__total">
              <span>{t('total')}:</span>
              <span className="cart-drawer__total-sum">{total.toLocaleString('ru-RU')} KGS</span>
            </div>
            <button
              className="btn-gold cart-drawer__order"
              onClick={handleOrder}
              disabled={ordering}
            >
              {ordering ? t('orderSending') : t('order')}
            </button>
            <button className="btn-dark cart-drawer__clear" onClick={clearCart}>
              {t('clear')}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
