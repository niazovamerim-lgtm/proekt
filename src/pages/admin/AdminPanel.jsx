import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'
import {
  getMenu, createMenuItem, updateMenuItem, deleteMenuItem,
  getOrders, deleteOrder,
} from '../../services/api'
import './Admin.css'

const EMPTY_ITEM = { name: '', desc: '', price: '', category: 'hot', img: '' }

export default function AdminPanel() {
  const { logout } = useAdmin()
  const navigate = useNavigate()
  const [tab, setTab] = useState('menu')

  // ── MENU ──
  const [menuList, setMenuList] = useState([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [menuError, setMenuError] = useState('')
  const [form, setForm] = useState(EMPTY_ITEM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadMenu = useCallback(async () => {
    setMenuLoading(true)
    setMenuError('')
    try { setMenuList(await getMenu()) }
    catch (e) { setMenuError(e.message) }
    finally { setMenuLoading(false) }
  }, [])

  useEffect(() => { if (tab === 'menu') loadMenu() }, [tab, loadMenu])

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
      setForm(EMPTY_ITEM)
      setEditId(null)
    } catch (e) {
      setMenuError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item) => {
    setEditId(item.id)
    setForm({ name: item.name, desc: item.desc || '', price: item.price, category: item.category || 'hot', img: item.img || '' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Жок кылуу?')) return
    try {
      await deleteMenuItem(id)
      setMenuList(prev => prev.filter(i => i.id !== id))
    } catch (e) { setMenuError(e.message) }
  }

  // ── ORDERS ──
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true)
    setOrdersError('')
    try { setOrders(await getOrders()) }
    catch (e) { setOrdersError(e.message) }
    finally { setOrdersLoading(false) }
  }, [])

  useEffect(() => { if (tab === 'orders') loadOrders() }, [tab, loadOrders])

  const handleDeleteOrder = async (id) => {
    if (!confirm('Заказды жок кылуу?')) return
    try {
      await deleteOrder(id)
      setOrders(prev => prev.filter(o => o.id !== id))
    } catch (e) { setOrdersError(e.message) }
  }

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">⚙️ Admin</div>
        <nav className="admin-sidebar__nav">
          <button className={`admin-nav-btn ${tab === 'menu' ? 'active' : ''}`} onClick={() => setTab('menu')}>
            🍽️ Меню
          </button>
          <button className={`admin-nav-btn ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
            📦 Заказдар
          </button>
        </nav>
        <button className="admin-logout-btn" onClick={handleLogout}>🚪 Чыгуу</button>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* ── MENU TAB ── */}
        {tab === 'menu' && (
          <div>
            <h2 className="admin-section-title">Меню башкаруу</h2>
            {menuError && <p className="admin-error">{menuError}</p>}

            {/* Form */}
            <form className="admin-form" onSubmit={handleSave}>
              <h3 className="admin-form-title">{editId ? '✏️ Өзгөртүү' : '➕ Жаңы блюдо'}</h3>
              <div className="admin-form-grid">
                <div className="admin-field">
                  <label>Аты *</label>
                  <input className="admin-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Стейк Рибай" required />
                </div>
                <div className="admin-field">
                  <label>Баасы (KGS) *</label>
                  <input className="admin-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="1500" required />
                </div>
                <div className="admin-field">
                  <label>Категория</label>
                  <select className="admin-input admin-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="hot">Горячие</option>
                    <option value="cold">Холодные</option>
                    <option value="dessert">Десерт</option>
                    <option value="drink">Напитки</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label>Сүрөт (URL)</label>
                  <input className="admin-input" value={form.img} onChange={e => setForm({ ...form, img: e.target.value })} placeholder="https://..." />
                </div>
                <div className="admin-field admin-field--full">
                  <label>Сүрөттөмө</label>
                  <input className="admin-input" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Блюдо жөнүндө..." />
                </div>
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? 'Сакталууда...' : editId ? 'Сактоо' : 'Кошуу'}
                </button>
                {editId && (
                  <button type="button" className="admin-btn-secondary" onClick={() => { setEditId(null); setForm(EMPTY_ITEM) }}>
                    Жокко чыгаруу
                  </button>
                )}
              </div>
            </form>

            {/* Menu list */}
            {menuLoading ? (
              <p className="admin-loading">Жүктөлүүдө...</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Сүрөт</th>
                      <th>Аты</th>
                      <th>Категория</th>
                      <th>Баасы</th>
                      <th>Аракет</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuList.map(item => (
                      <tr key={item.id}>
                        <td>
                          {item.img
                            ? <img src={item.img} alt={item.name} className="admin-table__img" />
                            : <span className="admin-table__no-img">🍽️</span>
                          }
                        </td>
                        <td>
                          <p className="admin-table__name">{item.name}</p>
                          <p className="admin-table__desc">{item.desc}</p>
                        </td>
                        <td><span className="admin-badge">{item.category}</span></td>
                        <td className="admin-table__price">{item.price} KGS</td>
                        <td>
                          <div className="admin-table__actions">
                            <button className="admin-btn-edit" onClick={() => handleEdit(item)}>✏️</button>
                            <button className="admin-btn-delete" onClick={() => handleDelete(item.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {menuList.length === 0 && <p className="admin-empty">Меню бош</p>}
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div>
            <div className="admin-orders-header">
              <h2 className="admin-section-title">Заказдар</h2>
              <button className="admin-btn-secondary" onClick={loadOrders}>🔄 Жаңылоо</button>
            </div>
            {ordersError && <p className="admin-error">{ordersError}</p>}
            {ordersLoading ? (
              <p className="admin-loading">Жүктөлүүдө...</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Блюдолор</th>
                      <th>Жалпы</th>
                      <th>Статус</th>
                      <th>Убакыт</th>
                      <th>Аракет</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td className="admin-table__id">#{order.id}</td>
                        <td>
                          {Array.isArray(order.items)
                            ? order.items.map(i => `${i.name} x${i.qty}`).join(', ')
                            : '—'
                          }
                        </td>
                        <td className="admin-table__price">{order.total?.toLocaleString('ru-RU')} KGS</td>
                        <td>
                          <span className={`admin-badge admin-badge--${order.status === 'new' ? 'new' : 'done'}`}>
                            {order.status || 'new'}
                          </span>
                        </td>
                        <td className="admin-table__date">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('ru-RU') : '—'}
                        </td>
                        <td>
                          <button className="admin-btn-delete" onClick={() => handleDeleteOrder(order.id)}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && <p className="admin-empty">Заказдар жок</p>}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
