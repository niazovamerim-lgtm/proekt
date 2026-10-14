const BASE = import.meta.env.VITE_API_URL

// ── MENU ──────────────────────────────────────────
export async function getMenu() {
  const res = await fetch(`${BASE}/menu`)
  if (!res.ok) throw new Error('Меню жүктөлгөн жок')
  return res.json()
}

export async function createMenuItem(data) {
  const res = await fetch(`${BASE}/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Кошуу катасы')
  return res.json()
}

export async function updateMenuItem(id, data) {
  const res = await fetch(`${BASE}/menu/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Жаңыртуу катасы')
  return res.json()
}

export async function deleteMenuItem(id) {
  const res = await fetch(`${BASE}/menu/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Жок кылуу катасы')
  return res.json()
}

// ── ORDERS ────────────────────────────────────────
export async function getOrders() {
  const res = await fetch(`${BASE}/orders`)
  if (!res.ok) throw new Error('Заказдар жүктөлгөн жок')
  return res.json()
}

export async function createOrder(data) {
  const res = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Заказ жиберүү катасы')
  return res.json()
}

export async function deleteOrder(id) {
  const res = await fetch(`${BASE}/orders/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Жок кылуу катасы')
  return res.json()
}
