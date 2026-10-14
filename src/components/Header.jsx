import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useLang } from '../context/LangContext'
import CartDrawer from './CartDrawer'
import ThemeToggle from './ThemeToggle'
import LangSwitcher from './LangSwitcher'
import './Header.css'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { count } = useCart()
  const { t } = useLang()
  const navigate = useNavigate()

  const navItems = [
    { labelKey: 'about', path: '/' },
    { labelKey: 'addresses', path: '/addresses' },
    { labelKey: 'menu', path: '/menu' },
    { labelKey: 'reserve', path: '/reserve' },
    { labelKey: 'catering', path: '/catering' },
    { labelKey: 'masterclass', path: '/masterclass' },
    { labelKey: 'reviews', path: '/reviews' },
    { labelKey: 'giftcard', path: '/giftcard' },
    { labelKey: 'favorites', path: '/favorites' },
    { labelKey: 'auth', path: '/auth' },
    { label: '⚙️ Admin', path: '/admin/login' },
  ]

  return (
    <>
      <header className="header">
        {/* Логотип + контролдор */}
        <div className="header__top">
          <div className="header__logo" onClick={() => navigate('/')}>
            <span className="header__logo-text">РЕСТИК</span>
            <div className="header__logo-underline" />
          </div>

          {/* Контролдор: тема, тил, корзина */}
          <div className="header__controls">
            <LangSwitcher />
            <ThemeToggle />
            <button
              className="header__cart-btn"
              onClick={() => setCartOpen(true)}
              aria-label="Корзина"
            >
              🛒
              {count > 0 && <span className="header__cart-badge">{count}</span>}
            </button>
          </div>

          {/* Бургер */}
          <button
            className={`header__burger ${menuOpen ? 'header__burger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Меню ач"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Навигация */}
        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          <ul className="header__nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="header__nav-item">
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    'header__nav-link' + (isActive ? ' header__nav-link--active' : '')
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label || t(item.labelKey)}
                </NavLink>
              </li>
            ))}
          </ul>
          <button
            className="btn-gold header__book-btn"
            onClick={() => { navigate('/reserve'); setMenuOpen(false) }}
          >
            {t('book')}
          </button>
        </nav>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
