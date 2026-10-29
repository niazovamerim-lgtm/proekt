import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'
import { useLang } from '../../context/LangContext'
import {
  getMenu, createMenuItem, updateMenuItem, deleteMenuItem,
  getOrders, deleteOrder, getAdminUsers,
  getAdminReservations, updateAdminReservation, getAdminReviews, deleteAdminReview,
  getMasterClasses, createMasterClass, updateMasterClass, deleteMasterClass,
} from '../../services/api'
import './Admin.css'
import LangSwitcher from '../../components/LangSwitcher'

const EMPTY_ITEM = { name: '', nameKg: '', nameEn: '', desc: '', descKg: '', descEn: '', price: '', category: 'hot', img: '' }
const EMPTY_MASTER_CLASS = {
  title: '', titleKg: '', titleEn: '', date: '', time: '', duration: '', durationKg: '',
  durationEn: '', price: '', seats: '', img: '',
}

const CATEGORY_ICONS = { hot: '🔥', cold: '🧊', dessert: '🍰', drink: '🥤' }
const CATEGORY_LABEL_KEYS = { hot: 'categoryHot', cold: 'categoryCold', dessert: 'categoryDessert', drink: 'categoryDrink' }

export default function AdminPanel() {
  const { logout } = useAdmin()
  const { t, lang, translateError } = useLang()
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState('')
  const [logoutError, setLogoutError] = useState('')

  // ── MENU ──
  const [menuList, setMenuList] = useState([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [menuError, setMenuError] = useState('')
  const [form, setForm] = useState(EMPTY_ITEM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [masterClasses, setMasterClasses] = useState([])
  const [masterClassLoading, setMasterClassLoading] = useState(false)
  const [masterClassError, setMasterClassError] = useState('')
  const [masterClassForm, setMasterClassForm] = useState(EMPTY_MASTER_CLASS)
  const [masterClassEditId, setMasterClassEditId] = useState(null)
  const [masterClassEditSource, setMasterClassEditSource] = useState('mockapi')
  const [masterClassFormOpen, setMasterClassFormOpen] = useState(false)
  const [masterClassSaving, setMasterClassSaving] = useState(false)
  const [reservations, setReservations] = useState([])
  const [reservationsLoading, setReservationsLoading] = useState(false)
  const [reservationsError, setReservationsError] = useState('')
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState('')

  const loadMenu = useCallback(async () => {
    setMenuLoading(true)
    setMenuError('')
    try { setMenuList(await getMenu()) }
    catch (e) { setMenuError(translateError(e)) }
    finally { setMenuLoading(false) }
  }, [translateError])

  // ── ORDERS ──
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true)
    setOrdersError('')
    try { setOrders(await getOrders()) }
    catch (e) { setOrdersError(translateError(e)) }
    finally { setOrdersLoading(false) }
  }, [translateError])

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    setUsersError('')
    try {
      const result = await getAdminUsers()
      setUsers(result.users)
      setUsersTotal(result.total)
    } catch (e) {
      setUsersError(translateError(e))
    } finally {
      setUsersLoading(false)
    }
  }, [translateError])

  const loadReservations = useCallback(async () => {
    setReservationsLoading(true)
    setReservationsError('')
    try { setReservations(await getAdminReservations()) }
    catch (e) { setReservationsError(translateError(e)) }
    finally { setReservationsLoading(false) }
  }, [translateError])

  const loadReviews = useCallback(async () => {
    setReviewsLoading(true)
    setReviewsError('')
    try { setReviews(await getAdminReviews()) }
    catch (e) { setReviewsError(translateError(e)) }
    finally { setReviewsLoading(false) }
  }, [translateError])

  const loadMasterClasses = useCallback(async () => {
    setMasterClassLoading(true)
    setMasterClassError('')
    try { setMasterClasses(await getMasterClasses()) }
    catch (e) { setMasterClassError(translateError(e)) }
    finally { setMasterClassLoading(false) }
  }, [translateError])

  // Dashboard'та экөөсүн тең жүктөйбүз
  useEffect(() => {
    if (tab === 'dashboard') { loadMenu(); loadOrders(); loadUsers() }
    else if (tab === 'menu') loadMenu()
    else if (tab === 'orders') loadOrders()
    else if (tab === 'users') loadUsers()
    else if (tab === 'reservations') loadReservations()
    else if (tab === 'reviews') loadReviews()
    else if (tab === 'masterClasses') loadMasterClasses()
  }, [tab, loadMenu, loadOrders, loadUsers, loadReservations, loadReviews, loadMasterClasses])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price) }
      if (editId) {
        const updated = await updateMenuItem(editId, payload)
        setMenuList(prev => prev.map(i => i.id === editId ? updated : i))
      } else {
        const created = await createMenuItem(payload)
        setMenuList(prev => [...prev, created])
      }
      setForm(EMPTY_ITEM); setEditId(null); setShowForm(false)
    } catch (e) { setMenuError(translateError(e)) }
    finally { setSaving(false) }
  }

  const handleEdit = (item) => {
    setEditId(item.id)
    setForm({
      name: item.name || '', nameKg: item.nameKg || '', nameEn: item.nameEn || '',
      desc: item.desc || '', descKg: item.descKg || '', descEn: item.descEn || '',
      price: item.price, category: item.category || 'hot', img: item.img || '',
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm(t('deleteConfirm'))) return
    try { await deleteMenuItem(id); setMenuList(prev => prev.filter(i => i.id !== id)) }
    catch (e) { setMenuError(translateError(e)) }
  }

  const handleDeleteOrder = async (order) => {
    if (!confirm(t('deleteOrderConfirm'))) return
    try {
      await deleteOrder(order.id, order.source)
      setOrders(prev => prev.filter(item => item.id !== order.id || item.source !== order.source))
    } catch (e) { setOrdersError(translateError(e)) }
  }

  const handleReservationStatus = async (reservation, status) => {
    setReservationsError('')
    try {
      await updateAdminReservation(reservation.id, status)
      setReservations(current => current.map(item => item.id === reservation.id ? { ...item, status } : item))
    } catch (e) {
      setReservationsError(translateError(e))
    }
  }

  const handleDeleteReview = async (review) => {
    if (!confirm(t('deleteConfirm'))) return
    setReviewsError('')
    try {
      await deleteAdminReview(review.id, review.source)
      setReviews(current => current.filter(item => item.id !== review.id || item.source !== review.source))
    } catch (e) {
      setReviewsError(translateError(e))
    }
  }

  const handleMasterClassSave = async (event) => {
    event.preventDefault()
    setMasterClassSaving(true)
    setMasterClassError('')
    try {
      const payload = { ...masterClassForm, seats: Number(masterClassForm.seats) }
      if (masterClassEditId) {
        const updated = await updateMasterClass(masterClassEditId, payload, masterClassEditSource)
        setMasterClasses(current => current.map(item => item.id === updated.id && item.source === updated.source ? updated : item))
      } else {
        const created = await createMasterClass(payload)
        setMasterClasses(current => [...current, created].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)))
      }
      setMasterClassForm(EMPTY_MASTER_CLASS)
      setMasterClassEditId(null)
      setMasterClassEditSource('mockapi')
      setMasterClassFormOpen(false)
    } catch (e) {
      setMasterClassError(translateError(e))
    } finally {
      setMasterClassSaving(false)
    }
  }

  const handleMasterClassEdit = (item) => {
    setMasterClassEditId(item.id)
    setMasterClassEditSource(item.source || 'sqlite')
    setMasterClassForm({
      title: item.title || '', titleKg: item.titleKg || '', titleEn: item.titleEn || '',
      date: item.date || '', time: item.time || '', duration: item.duration || '',
      durationKg: item.durationKg || '', durationEn: item.durationEn || '',
      price: item.price || '', seats: String(item.seats || ''), img: item.img || '',
    })
    setMasterClassFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMasterClassDelete = async (masterClass) => {
    if (!confirm(t('deleteConfirm'))) return
    setMasterClassError('')
    try {
      await deleteMasterClass(masterClass.id, masterClass.source)
      setMasterClasses(current => current.filter(item => item.id !== masterClass.id || item.source !== masterClass.source))
    } catch (e) {
      setMasterClassError(translateError(e))
    }
  }

  const cancelMasterClassForm = () => {
    setMasterClassForm(EMPTY_MASTER_CLASS)
    setMasterClassEditId(null)
    setMasterClassEditSource('mockapi')
    setMasterClassFormOpen(false)
  }

  const cancelForm = () => { setEditId(null); setForm(EMPTY_ITEM); setShowForm(false) }
  const handleLogout = async () => {
    setLogoutError('')
    try {
      await logout()
      navigate('/')
    } catch (e) {
      setLogoutError(translateError(e))
    }
  }

  // Статистика
  const totalRevenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0)
  const newOrders = orders.filter(o => o.status === 'new').length
  const categoryCount = menuList.reduce((acc, i) => { acc[i.category] = (acc[i.category] || 0) + 1; return acc }, {})
  const averageOrder = orders.length ? totalRevenue / orders.length : 0
  const dateLocale = lang === 'kg' ? 'ky-KG' : lang === 'en' ? 'en-US' : 'ru-RU'
  const monthlyStats = Array.from({ length: 6 }, (_, index) => {
    const month = new Date()
    month.setDate(1)
    month.setMonth(month.getMonth() - 5 + index)
    const monthOrders = orders.filter(order => {
      if (!order.createdAt) return false
      const createdAt = new Date(order.createdAt)
      return !Number.isNaN(createdAt.getTime())
        && createdAt.getFullYear() === month.getFullYear()
        && createdAt.getMonth() === month.getMonth()
    })

    return {
      label: month.toLocaleDateString(dateLocale, { month: 'short' }).replace('.', ''),
      count: monthOrders.length,
      revenue: monthOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
    }
  })
  const maxMonthlyRevenue = Math.max(...monthlyStats.map(month => month.revenue), 1)
  const maxMonthlyOrders = Math.max(...monthlyStats.map(month => month.count), 1)
  const revenuePoints = monthlyStats
    .map((month, index) => `${10 + index * 116},${150 - (month.revenue / maxMonthlyRevenue) * 125}`)
    .join(' ')

  const navItems = [
    { key: 'dashboard', icon: '📊', label: 'adminOverview' },
    { key: 'menu',      icon: '🍽️', label: 'adminMenu' },
    { key: 'orders',    icon: '📦', label: 'adminOrders' },
    { key: 'reservations', icon: '🪑', label: 'adminBookings' },
    { key: 'reviews', icon: '⭐', label: 'adminReviews' },
    { key: 'masterClasses', icon: '👨‍🍳', label: 'adminMasterClasses' },
    { key: 'users',     icon: '👤', label: 'adminUsers' },
    { key: 'translations', icon: '🌐', label: 'adminTranslations' },
  ]

  return (
    <div className="adm-layout">
      {/* ── SIDEBAR ── */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar__brand">
          <span className="adm-sidebar__brand-icon">⚙️</span>
          <span className="adm-sidebar__brand-text">Рестик Admin</span>
        </div>

        <nav className="adm-nav">
          {navItems.map(n => (
            <button
              key={n.key}
              className={`adm-nav__item ${tab === n.key ? 'adm-nav__item--active' : ''}`}
              onClick={() => setTab(n.key)}
            >
              <span className="adm-nav__icon">{n.icon}</span>
              <span className="adm-nav__label">{t(n.label)}</span>
              {n.key === 'orders' && newOrders > 0 && (
                <span className="adm-nav__badge">{newOrders}</span>
              )}
              {n.key === 'users' && usersTotal > 0 && (
                <span className="adm-nav__badge">{usersTotal}</span>
              )}
              {n.key === 'reservations' && reservations.length > 0 && (
                <span className="adm-nav__badge">{reservations.length}</span>
              )}
              {n.key === 'reviews' && reviews.length > 0 && (
                <span className="adm-nav__badge">{reviews.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar__footer">
          <button className="adm-sidebar__site-btn" onClick={() => navigate('/')}>
            🌐 {t('adminGoSite')}
          </button>
          <button className="adm-sidebar__logout-btn" onClick={handleLogout}>
            🚪 {t('adminLogout')}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="adm-body">
        {/* Topbar */}
        <header className="adm-topbar">
          <h1 className="adm-topbar__title">
            {tab === 'dashboard' && `📊 ${t('adminOverview')}`}
            {tab === 'menu' && `🍽️ ${t('adminMenu')}`}
            {tab === 'orders' && `📦 ${t('adminOrders')}`}
            {tab === 'reservations' && `🪑 ${t('adminBookings')}`}
            {tab === 'reviews' && `⭐ ${t('adminReviews')}`}
            {tab === 'masterClasses' && `👨‍🍳 ${t('adminMasterClasses')}`}
            {tab === 'users' && `👤 ${t('adminUsers')}`}
            {tab === 'translations' && `🌐 ${t('adminTranslations')}`}
          </h1>
          <div className="adm-topbar__right">
            <LangSwitcher />
            <span className="adm-topbar__date">
              {new Date().toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <div className="adm-topbar__avatar">A</div>
          </div>
        </header>

        <main className="adm-main">
          {logoutError && <p className="adm-error" role="alert">{logoutError}</p>}

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <div className="adm-dashboard">
              {(menuError || ordersError) && (
                <div className="adm-dashboard__errors" role="alert">
                  {menuError && <p className="adm-error">{menuError}</p>}
                  {ordersError && <p className="adm-error">{ordersError}</p>}
                </div>
              )}

              <div className="adm-stats">
                <div className="adm-stat adm-stat--revenue">
                  <div className="adm-stat__body">
                    <p className="adm-stat__label">{t('adminRevenue')}</p>
                    <p className="adm-stat__value">{totalRevenue.toLocaleString(dateLocale)} <small>KGS</small></p>
                    <p className="adm-stat__hint">{t('adminAllTime')}</p>
                  </div>
                  <span className="adm-stat__symbol" aria-hidden="true">с</span>
                </div>
                <div className="adm-stat adm-stat--orders">
                  <div className="adm-stat__body">
                    <p className="adm-stat__label">{t('adminTotalOrders')}</p>
                    <p className="adm-stat__value">{orders.length}</p>
                    <p className="adm-stat__hint">{t('adminNew')} {newOrders}</p>
                  </div>
                  <span className="adm-stat__symbol" aria-hidden="true">↗</span>
                </div>
                <div className="adm-stat adm-stat--average">
                  <div className="adm-stat__body">
                    <p className="adm-stat__label">{t('adminAverage')}</p>
                    <p className="adm-stat__value">{Math.round(averageOrder).toLocaleString(dateLocale)} <small>KGS</small></p>
                    <p className="adm-stat__hint">{t('adminOneOrder')}</p>
                  </div>
                  <span className="adm-stat__symbol" aria-hidden="true">⌁</span>
                </div>
                <div className="adm-stat adm-stat--menu">
                  <div className="adm-stat__body">
                    <p className="adm-stat__label">{t('adminMenuItems')}</p>
                    <p className="adm-stat__value">{menuList.length}</p>
                    <p className="adm-stat__hint">{t('adminDishesDrinks')}</p>
                  </div>
                  <span className="adm-stat__symbol" aria-hidden="true">✳</span>
                </div>
                <div className="adm-stat adm-stat--users">
                  <div className="adm-stat__body">
                    <p className="adm-stat__label">{t('adminAccounts')}</p>
                    <p className="adm-stat__value">{usersTotal}</p>
                    <p className="adm-stat__hint">{t('adminRecentRegistrations')}</p>
                  </div>
                  <span className="adm-stat__symbol" aria-hidden="true">♙</span>
                </div>
              </div>

              <div className="adm-dashboard__charts">
                <section className="adm-card adm-chart-card">
                  <div className="adm-card__heading">
                    <div>
                      <p className="adm-card__eyebrow">{t('adminSales')}</p>
                      <h2 className="adm-card__title">{t('adminRevenueMonths')}</h2>
                    </div>
                    <span className="adm-chart-legend"><i /> {t('adminRevenueLegend')}</span>
                  </div>
                  {ordersLoading ? (
                    <p className="adm-chart-empty">{t('adminLoading')}</p>
                  ) : (
                    <div className="adm-line-chart">
                      <div className="adm-line-chart__axis" aria-hidden="true">
                        <span>{maxMonthlyRevenue.toLocaleString('ru-RU')}</span>
                        <span>{Math.round(maxMonthlyRevenue / 2).toLocaleString('ru-RU')}</span>
                        <span>0</span>
                      </div>
                      <div className="adm-line-chart__plot">
                        <div className="adm-chart-grid" aria-hidden="true"><i /><i /><i /></div>
                        <svg viewBox="0 0 600 170" preserveAspectRatio="none" role="img" aria-label={t('adminRevenueMonths')}>
                          <defs>
                            <linearGradient id="adm-revenue-fill" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#c5a36b" stopOpacity=".28" />
                              <stop offset="100%" stopColor="#c5a36b" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <polygon points={`10,160 ${revenuePoints} 590,160`} fill="url(#adm-revenue-fill)" />
                          <polyline points={revenuePoints} fill="none" stroke="#c5a36b" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                          {monthlyStats.map((month, index) => (
                            <circle
                              key={month.label}
                              cx={10 + index * 116}
                              cy={150 - (month.revenue / maxMonthlyRevenue) * 125}
                              r="4"
                              fill="#c5a36b"
                              stroke="#173326"
                              strokeWidth="2"
                            />
                          ))}
                        </svg>
                        <div className="adm-chart-months">
                          {monthlyStats.map((month, index) => (
                            <span key={`${month.label}-${index}`}>{month.label}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                <section className="adm-card adm-chart-card">
                  <div className="adm-card__heading">
                    <div>
                      <p className="adm-card__eyebrow">{t('adminActivity')}</p>
                      <h2 className="adm-card__title">{t('adminOrdersMonths')}</h2>
                    </div>
                    <span className="adm-chart-legend adm-chart-legend--purple"><i /> {t('adminOrdersLegend')}</span>
                  </div>
                  {ordersLoading ? (
                    <p className="adm-chart-empty">{t('adminLoading')}</p>
                  ) : (
                    <div className="adm-bar-chart">
                      <div className="adm-bar-chart__axis" aria-hidden="true">
                        <span>{maxMonthlyOrders}</span><span>{Math.round(maxMonthlyOrders / 2)}</span><span>0</span>
                      </div>
                      <div className="adm-bar-chart__plot">
                        <div className="adm-chart-grid" aria-hidden="true"><i /><i /><i /></div>
                        <div className="adm-bars">
                          {monthlyStats.map((month, index) => (
                            <div className="adm-bar-column" key={`${month.label}-${index}`}>
                              <span className="adm-bar-column__value">{month.count || ''}</span>
                              <div className="adm-bar-column__track">
                                <div
                                  className="adm-bar-column__bar"
                                  style={{ height: `${Math.max(month.count ? (month.count / maxMonthlyOrders) * 100 : 0, month.count ? 4 : 0)}%` }}
                                />
                              </div>
                              <span className="adm-bar-column__month">{month.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <div className="adm-dashboard__bottom">
                <section className="adm-card adm-category-card">
                  <div className="adm-card__heading">
                    <div>
                      <p className="adm-card__eyebrow">{t('adminAssortment')}</p>
                      <h2 className="adm-card__title">{t('adminMenuCategories')}</h2>
                    </div>
                    <button className="adm-card__link" onClick={() => setTab('menu')}>{t('adminOpenMenu')} <span>→</span></button>
                  </div>
                  {menuLoading ? (
                    <p className="adm-chart-empty">{t('adminLoading')}</p>
                  ) : menuList.length === 0 ? (
                    <p className="adm-chart-empty">{t('adminNoMenuItems')}</p>
                  ) : (
                    <div className="adm-cat-list">
                      {Object.entries(categoryCount).map(([cat, count]) => (
                        <div key={cat} className="adm-cat-item">
                          <span className="adm-cat-item__icon">{CATEGORY_ICONS[cat] || '🍴'}</span>
                          <span className="adm-cat-item__name">{t(CATEGORY_LABEL_KEYS[cat] || cat)}</span>
                          <div className="adm-cat-item__bar-wrap">
                            <div className="adm-cat-item__bar" style={{ width: `${Math.round(count / menuList.length * 100)}%` }} />
                          </div>
                          <span className="adm-cat-item__count">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="adm-card adm-recent-card">
                  <div className="adm-card__heading">
                    <div>
                      <p className="adm-card__eyebrow">{t('adminRecentEvents')}</p>
                      <h2 className="adm-card__title">{t('adminRecentOrders')}</h2>
                    </div>
                    <button className="adm-card__link" onClick={() => setTab('orders')}>{t('adminAllOrders')} <span>→</span></button>
                  </div>
                  {ordersLoading ? (
                    <p className="adm-chart-empty">{t('adminLoading')}</p>
                  ) : orders.length === 0 ? (
                    <p className="adm-chart-empty">{t('adminNoOrders')}</p>
                  ) : (
                    <div className="adm-recent-orders">
                      {orders.slice(0, 5).map(order => (
                        <div key={`${order.source || 'legacy'}-${order.id}`} className="adm-recent-order">
                          <div className="adm-recent-order__mark">#</div>
                          <div className="adm-recent-order__info">
                            <p className="adm-recent-order__id">{t('adminOrder')} #{order.id}</p>
                            <p className="adm-recent-order__date">
                              {order.createdAt && !Number.isNaN(new Date(order.createdAt).getTime())
                                ? new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
                                : t('adminDateMissing')}
                            </p>
                          </div>
                          <div className="adm-recent-order__right">
                            <span className={`adm-badge adm-badge--${order.status === 'new' ? 'green' : 'gray'}`}>
                              {order.status === 'new' ? t('adminNewOrder') : order.status || t('statusPending')}
                            </span>
                            <p className="adm-recent-order__total">{Number(order.total || 0).toLocaleString(dateLocale)} KGS</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {/* ── MENU TAB ── */}
          {tab === 'menu' && (
            <div>
              {menuError && <p className="adm-error">{menuError}</p>}

              {/* Add button */}
              {!showForm && (
                <button className="adm-btn-primary adm-add-btn" onClick={() => setShowForm(true)}>
                  + {t('adminAddDish')}
                </button>
              )}

              {/* Form */}
              {showForm && (
                <div className="adm-card adm-form-card">
                  <h3 className="adm-card__title">{editId ? `✏️ ${t('adminEditDish')}` : `➕ ${t('adminNewDish')}`}</h3>
                  <form onSubmit={handleSave}>
                    <div className="adm-form-grid">
                      <div className="adm-field">
                        <label>{t('adminName')} *</label>
                        <input className="adm-input" value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          placeholder="Ribeye steak" required />
                      </div>
                      <div className="adm-field">
                        <label>{t('adminNameKg')}</label>
                        <input className="adm-input" value={form.nameKg}
                          onChange={e => setForm({ ...form, nameKg: e.target.value })}
                          placeholder="Кыргызча" />
                      </div>
                      <div className="adm-field">
                        <label>{t('adminNameEn')}</label>
                        <input className="adm-input" value={form.nameEn}
                          onChange={e => setForm({ ...form, nameEn: e.target.value })}
                          placeholder="English" />
                      </div>
                      <div className="adm-field">
                        <label>{t('adminPrice')} *</label>
                        <input className="adm-input" type="number" value={form.price}
                          onChange={e => setForm({ ...form, price: e.target.value })}
                          placeholder="1500" required />
                      </div>
                      <div className="adm-field">
                        <label>{t('adminCategory')}</label>
                        <select className="adm-input adm-select" value={form.category}
                          onChange={e => setForm({ ...form, category: e.target.value })}>
                          <option value="hot">🔥 {t('categoryHot')}</option>
                          <option value="cold">🧊 {t('categoryCold')}</option>
                          <option value="dessert">🍰 {t('categoryDessert')}</option>
                          <option value="drink">🥤 {t('categoryDrink')}</option>
                        </select>
                      </div>
                      <div className="adm-field">
                        <label>{t('adminImageUrl')}</label>
                        <input className="adm-input" value={form.img}
                          onChange={e => setForm({ ...form, img: e.target.value })}
                          placeholder="https://..." />
                      </div>
                      <div className="adm-field adm-field--full">
                        <label>{t('adminDescription')}</label>
                        <input className="adm-input" value={form.desc}
                          onChange={e => setForm({ ...form, desc: e.target.value })}
                          placeholder={t('adminDescription')} />
                      </div>
                      <div className="adm-field">
                        <label>{t('adminDescriptionKg')}</label>
                        <input className="adm-input" value={form.descKg}
                          onChange={e => setForm({ ...form, descKg: e.target.value })}
                          placeholder="Кыргызча" />
                      </div>
                      <div className="adm-field">
                        <label>{t('adminDescriptionEn')}</label>
                        <input className="adm-input" value={form.descEn}
                          onChange={e => setForm({ ...form, descEn: e.target.value })}
                          placeholder="English" />
                      </div>
                    </div>
                    {/* Image preview */}
                    {form.img && (
                      <div className="adm-img-preview">
                        <img src={form.img} alt="preview" loading="lazy" decoding="async" />
                      </div>
                    )}
                    <div className="adm-form-actions">
                      <button type="submit" className="adm-btn-primary" disabled={saving}>
                        {saving ? t('adminSaving') : editId ? t('adminSave') : t('adminAdd')}
                      </button>
                      <button type="button" className="adm-btn-secondary" onClick={cancelForm}>
                        {t('adminCancel')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Menu grid */}
              {menuLoading ? (
                <div className="adm-loading-wrap">
                  <div className="adm-spinner" />
                  <p>{t('adminLoading')}</p>
                </div>
              ) : (
                <div className="adm-menu-grid">
                  {menuList.map(item => (
                    <div key={item.id} className="adm-menu-card">
                      <div className="adm-menu-card__img-wrap">
                        {item.img
                          ? <img src={item.img} alt={item.name} className="adm-menu-card__img" loading="lazy" decoding="async" />
                          : <div className="adm-menu-card__no-img">{CATEGORY_ICONS[item.category] || '🍴'}</div>
                        }
                        <span className="adm-menu-card__cat-badge">
                          {CATEGORY_ICONS[item.category]} {t(CATEGORY_LABEL_KEYS[item.category])}
                        </span>
                      </div>
                      <div className="adm-menu-card__body">
                        <p className="adm-menu-card__name">{item.name}</p>
                        <p className="adm-menu-card__desc">{item.desc}</p>
                        <div className="adm-menu-card__footer">
                          <span className="adm-menu-card__price">{Number(item.price).toLocaleString('ru-RU')} KGS</span>
                          <div className="adm-menu-card__actions">
                            <button className="adm-icon-btn adm-icon-btn--edit" onClick={() => handleEdit(item)} title={t('adminEditDish')}>✏️</button>
                            <button className="adm-icon-btn adm-icon-btn--del" onClick={() => handleDelete(item.id)} title={t('remove')}>🗑️</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {menuList.length === 0 && <p className="adm-empty">{t('adminMenuEmpty')}</p>}
                </div>
              )}
            </div>
          )}

          {/* ── ORDERS TAB ── */}
          {tab === 'orders' && (
            <div>
              {ordersError && <p className="adm-error">{ordersError}</p>}
              <div className="adm-orders-toolbar">
                <p className="adm-orders-count">{t('adminTotal')} <strong>{orders.length}</strong> {t('adminOrders')}</p>
                <button className="adm-btn-secondary" onClick={loadOrders}>🔄 {t('adminRefresh')}</button>
              </div>

              {ordersLoading ? (
                <div className="adm-loading-wrap">
                  <div className="adm-spinner" />
                  <p>{t('adminLoading')}</p>
                </div>
              ) : (
                <div className="adm-orders-list">
                  {orders.map(order => (
                    <div key={`${order.source || 'legacy'}-${order.id}`} className="adm-order-card">
                      <div className="adm-order-card__header">
                        <span className="adm-order-card__id">{t('adminOrder')} #{order.id}</span>
                        <span className={`adm-badge adm-badge--${order.status === 'new' ? 'green' : 'gray'}`}>
                          {order.status === 'new' ? t('adminNewOrder') : t(order.status === 'confirmed' ? 'statusConfirmed' : order.status === 'cancelled' ? 'statusCancelled' : 'statusPending')}
                        </span>
                        <span className="adm-order-card__date">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString(dateLocale) : '—'}
                        </span>
                      </div>
                      <div className="adm-order-card__items">
                        {Array.isArray(order.items)
                          ? order.items.map((i, idx) => (
                              <span key={idx} className="adm-order-item-tag">
                                {i.name} × {i.qty}
                              </span>
                            ))
                          : <span className="adm-order-item-tag">—</span>
                        }
                      </div>
                      <div className="adm-order-card__footer">
                        {order.customerName && (
                          <span className="adm-order-card__customer">
                            {order.customerName}{order.customerPhone ? ` · ${order.customerPhone}` : ''}
                          </span>
                        )}
                        <span className="adm-order-card__total">
                          💰 {Number(order.total || 0).toLocaleString('ru-RU')} KGS
                        </span>
                        <button className="adm-icon-btn adm-icon-btn--del" onClick={() => handleDeleteOrder(order)}>
                          🗑️ {t('remove')}
                        </button>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="adm-empty">{t('adminOrdersEmpty')}</p>}
                </div>
              )}
            </div>
          )}

          {tab === 'reservations' && (
            <section className="adm-card adm-records-card">
              <div className="adm-card__heading">
                <h2 className="adm-card__title">{t('adminBookings')} ({reservations.length})</h2>
                <button className="adm-btn-secondary" onClick={loadReservations}>🔄 {t('adminRefresh')}</button>
              </div>
              {reservationsError && <p className="adm-error" role="alert">{reservationsError}</p>}
              {reservationsLoading ? (
                <div className="adm-loading-wrap"><div className="adm-spinner" /><p>{t('adminLoading')}</p></div>
              ) : reservations.length === 0 ? (
                <p className="adm-empty">{t('adminNoBookings')}</p>
              ) : (
                <div className="adm-orders-list">
                  {reservations.map(reservation => (
                    <article className="adm-record-row" key={reservation.id}>
                      <div className="adm-record-row__main">
                        <strong>{reservation.date} · {reservation.time}</strong>
                        <span>{t('people')} {reservation.guests}</span>
                        <span>{reservation.table ? t({
                          window: 'tableWindow',
                          center: 'tableCenter',
                          corner: 'tableCorner',
                          vip: 'vipRoom',
                        }[reservation.table] || 'bookingTable') : t('bookingTable') + ': —'}</span>
                        <a href={`tel:${reservation.contact}`}>{reservation.contact}</a>
                      </div>
                      <span className={`adm-badge ${reservation.status === 'confirmed' ? 'adm-badge--green' : 'adm-badge--gray'}`}>
                        {t(reservation.status === 'confirmed' ? 'statusConfirmed' : reservation.status === 'cancelled' ? 'statusCancelled' : 'statusPending')}
                      </span>
                      {reservation.status === 'pending' && (
                        <div className="adm-record-row__actions">
                          <button className="adm-btn-secondary" onClick={() => handleReservationStatus(reservation, 'confirmed')}>{t('adminConfirm')}</button>
                          <button className="adm-icon-btn adm-icon-btn--del" onClick={() => handleReservationStatus(reservation, 'cancelled')}>{t('statusCancelled')}</button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === 'reviews' && (
            <section className="adm-card adm-records-card">
              <div className="adm-card__heading">
                <h2 className="adm-card__title">{t('adminReviews')} ({reviews.length})</h2>
                <button className="adm-btn-secondary" onClick={loadReviews}>🔄 {t('adminRefresh')}</button>
              </div>
              {reviewsError && <p className="adm-error" role="alert">{reviewsError}</p>}
              {reviewsLoading ? (
                <div className="adm-loading-wrap"><div className="adm-spinner" /><p>{t('adminLoading')}</p></div>
              ) : reviews.length === 0 ? (
                <p className="adm-empty">{t('adminNoReviews')}</p>
              ) : (
                <div className="adm-orders-list">
                  {reviews.map(review => (
                    <article className="adm-record-row adm-review-row" key={`${review.source || 'sqlite'}-${review.id}`}>
                      <div className="adm-record-row__main">
                        <strong>{review.name} <span className="adm-review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span></strong>
                        <p>{review.text}</p>
                        <time>{review.createdAt && !Number.isNaN(new Date(review.createdAt).getTime())
                          ? new Date(review.createdAt).toLocaleString(dateLocale)
                          : '—'}</time>
                      </div>
                      <button className="adm-icon-btn adm-icon-btn--del" onClick={() => handleDeleteReview(review)}>{t('remove')}</button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === 'masterClasses' && (
            <div className="adm-master-classes">
              {masterClassError && <p className="adm-error" role="alert">{masterClassError}</p>}
              {!masterClassFormOpen && (
                <button className="adm-btn-primary adm-add-btn" onClick={() => setMasterClassFormOpen(true)}>
                  + {t('adminAddMasterClass')}
                </button>
              )}
              {masterClassFormOpen && (
                <section className="adm-card adm-form-card">
                  <h2 className="adm-card__title">{masterClassEditId ? t('adminEditMasterClass') : t('adminAddMasterClass')}</h2>
                  <form onSubmit={handleMasterClassSave}>
                    <div className="adm-form-grid">
                      <label className="adm-field">{t('adminName')} *
                        <input className="adm-input" value={masterClassForm.title} required maxLength={120}
                          onChange={event => setMasterClassForm({ ...masterClassForm, title: event.target.value })} />
                      </label>
                      <label className="adm-field">{t('adminNameKg')}
                        <input className="adm-input" value={masterClassForm.titleKg} maxLength={120}
                          onChange={event => setMasterClassForm({ ...masterClassForm, titleKg: event.target.value })} />
                      </label>
                      <label className="adm-field">{t('adminNameEn')}
                        <input className="adm-input" value={masterClassForm.titleEn} maxLength={120}
                          onChange={event => setMasterClassForm({ ...masterClassForm, titleEn: event.target.value })} />
                      </label>
                      <label className="adm-field">{t('bookingDate')} *
                        <input className="adm-input" type="date" value={masterClassForm.date} required
                          onChange={event => setMasterClassForm({ ...masterClassForm, date: event.target.value })} />
                      </label>
                      <label className="adm-field">{t('bookingTime')} *
                        <input className="adm-input" type="time" value={masterClassForm.time} required
                          onChange={event => setMasterClassForm({ ...masterClassForm, time: event.target.value })} />
                      </label>
                      <label className="adm-field">{t('adminDuration')} *
                        <input className="adm-input" value={masterClassForm.duration} required maxLength={60}
                          onChange={event => setMasterClassForm({ ...masterClassForm, duration: event.target.value })} />
                      </label>
                      <label className="adm-field">{t('adminDurationKg')}
                        <input className="adm-input" value={masterClassForm.durationKg} maxLength={60}
                          onChange={event => setMasterClassForm({ ...masterClassForm, durationKg: event.target.value })} />
                      </label>
                      <label className="adm-field">{t('adminDurationEn')}
                        <input className="adm-input" value={masterClassForm.durationEn} maxLength={60}
                          onChange={event => setMasterClassForm({ ...masterClassForm, durationEn: event.target.value })} />
                      </label>
                      <label className="adm-field">{t('adminPrice')} *
                        <input className="adm-input" value={masterClassForm.price} required maxLength={40}
                          onChange={event => setMasterClassForm({ ...masterClassForm, price: event.target.value })} />
                      </label>
                      <label className="adm-field">{t('seats')} *
                        <input className="adm-input" type="number" min="1" max="500" value={masterClassForm.seats} required
                          onChange={event => setMasterClassForm({ ...masterClassForm, seats: event.target.value })} />
                      </label>
                      <label className="adm-field adm-field--full">{t('adminImageUrl')}
                        <input className="adm-input" type="url" value={masterClassForm.img}
                          onChange={event => setMasterClassForm({ ...masterClassForm, img: event.target.value })} />
                      </label>
                    </div>
                    <div className="adm-form-actions">
                      <button type="submit" className="adm-btn-primary" disabled={masterClassSaving}>
                        {masterClassSaving ? t('adminSaving') : t('adminSave')}
                      </button>
                      <button type="button" className="adm-btn-secondary" onClick={cancelMasterClassForm}>{t('adminCancel')}</button>
                    </div>
                  </form>
                </section>
              )}
              <section className="adm-card adm-records-card">
                <div className="adm-card__heading">
                  <h2 className="adm-card__title">{t('adminMasterClasses')} ({masterClasses.length})</h2>
                  <button className="adm-btn-secondary" onClick={loadMasterClasses}>🔄 {t('adminRefresh')}</button>
                </div>
                {masterClassLoading ? (
                  <div className="adm-loading-wrap"><div className="adm-spinner" /><p>{t('adminLoading')}</p></div>
                ) : masterClasses.length === 0 ? (
                  <p className="adm-empty">{t('adminNoMasterClasses')}</p>
                ) : (
                  <div className="adm-menu-grid">
                    {masterClasses.map(masterClass => (
                      <article className="adm-card adm-master-class-card" key={masterClass.id}>
                        {masterClass.img && <img src={masterClass.img} alt={masterClass.title} loading="lazy" decoding="async" />}
                        <h3>{masterClass.title}</h3>
                        <p>{masterClass.titleKg || masterClass.title} · {masterClass.titleEn || masterClass.title}</p>
                        <p>{masterClass.date} · {masterClass.time} · {masterClass.duration}</p>
                        <p>{masterClass.price} · {t('seats')} {masterClass.seats}</p>
                        <div className="adm-record-row__actions">
                          <button className="adm-btn-secondary" onClick={() => handleMasterClassEdit(masterClass)}>{t('adminEditDish')}</button>
                          <button className="adm-icon-btn adm-icon-btn--del" onClick={() => handleMasterClassDelete(masterClass)}>{t('remove')}</button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {tab === 'users' && (
            <section className="adm-card adm-users-card">
              <div className="adm-card__heading">
                <div>
                  <p className="adm-card__eyebrow">{t('adminRegistrations')}</p>
                  <h2 className="adm-card__title">{t('adminUserAccounts')} ({usersTotal})</h2>
                </div>
                <button className="adm-card__link" onClick={loadUsers}>{t('adminUpdate')} <span>↻</span></button>
              </div>
              {usersError && <p className="adm-error" role="alert">{usersError}</p>}
              {usersLoading ? (
                <div className="adm-loading-wrap"><div className="adm-spinner" /><p>{t('adminLoading')}</p></div>
              ) : users.length === 0 ? (
                <p className="adm-empty">{t('adminNoUsers')}</p>
              ) : (
                <div className="adm-users-list">
                  {users.map(user => (
                    <article className="adm-user-row" key={user.id}>
                      <div className="adm-user-row__avatar" aria-hidden="true">
                        {user.name.trim().charAt(0).toLocaleUpperCase()}
                      </div>
                      <div className="adm-user-row__identity">
                        <strong>{user.name}</strong>
                        <a href={`mailto:${user.email}`}>{user.email}</a>
                      </div>
                      <a className="adm-user-row__phone" href={user.phone ? `tel:${user.phone}` : undefined}>
                        {user.phone || t('adminPhoneMissing')}
                      </a>
                      <time className="adm-user-row__date" dateTime={new Date(user.createdAt).toISOString()}>
                        {new Date(user.createdAt).toLocaleString(dateLocale)}
                      </time>
                    </article>
                  ))}
                  {usersTotal > users.length && (
                    <p className="adm-users-note">
                      {t('adminShowingUsers')} {users.length} / {usersTotal}
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {tab === 'translations' && (
            <section className="adm-card adm-translations-card">
              <p className="adm-card__eyebrow">{t('adminTranslations')}</p>
              <h2 className="adm-card__title">{t('adminTranslationTitle')}</h2>
              <p className="adm-translations-card__description">{t('adminTranslationDescription')}</p>
              <p className="adm-translations-card__note">{t('adminTranslationNote')}</p>
              <LangSwitcher />
            </section>
          )}

        </main>
      </div>
    </div>
  )
}
