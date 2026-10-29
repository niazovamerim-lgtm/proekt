import React, { useState, useMemo } from 'react'
import { useLang } from '../context/LangContext'
import { useFetch } from '../hooks/useFetch'
import { getMenu } from '../services/api'
import MenuCard from '../components/MenuCard'
import { SkeletonList } from '../components/Skeleton'
import { useNavigate } from 'react-router-dom'
import './Menu.css'

const CATEGORIES = [
  { key: 'all', labelKey: 'filterAll' },
  { key: 'hot', labelKey: 'filterHot' },
  { key: 'cold', labelKey: 'filterCold' },
  { key: 'dessert', labelKey: 'filterDessert' },
  { key: 'drink', labelKey: 'filterDrink' },
]

// "admin" деп жазылса admin панелине алып кетет
const ADMIN_KEYWORDS = ['admin', 'админ', 'Admin', 'Админ', 'ADMIN', 'АДМИН']

export default function Menu() {
  const { t, lang, translateError } = useLang()
  const navigate = useNavigate()
  const { data: items, loading, error } = useFetch(getMenu, [])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const handleSearch = (value) => {
    if (ADMIN_KEYWORDS.includes(value.trim())) {
      navigate('/admin/login')
      return
    }
    setSearch(value)
  }

  const filtered = useMemo(() => {
    if (!items) return []
    return items.filter(item => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory
      const name = lang === 'kg' ? item.nameKg || item.name : lang === 'en' ? item.nameEn || item.name : item.name
      const desc = lang === 'kg' ? item.descKg || item.desc : lang === 'en' ? item.descEn || item.desc : item.desc
      const matchSearch = name?.toLowerCase().includes(search.toLowerCase()) ||
        desc?.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [items, search, activeCategory, lang])

  return (
    <div className="page-bg">
      <div className="page-content menu-page__content">
        <h1 className="page-title">{t('menu')}</h1>
        <div className="page-title-divider" />

        <div className="menu-page__search-wrap">
          <span className="menu-page__search-icon">🔍</span>
          <input
            type="text"
            className="menu-page__search"
            placeholder={t('search') + '...'}
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
          {search && (
            <button className="menu-page__search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <div className="menu-page__filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`menu-page__filter-btn ${activeCategory === cat.key ? 'menu-page__filter-btn--active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {t(cat.labelKey)}
            </button>
          ))}
        </div>

        {loading && <SkeletonList count={6} />}
        {error && <div className="menu-page__error">⚠️ {translateError(new Error(error))}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="menu-page__empty">
            <span>🍽️</span>
            <p>{t('noResults')}</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="menu-page__count">
              {t('found')} <strong>{filtered.length}</strong>
            </p>
            <div className="menu-page__grid">
              {filtered.map(item => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
