const BASE = import.meta.env.VITE_API_URL
const REVIEWS_URL = 'https://6ae34074933120ae20f887e5.mockapi.io/Reviews'
const MASTER_CLASSES_URL = 'https://6ae34074933120ae20f887e5.mockapi.io/Master'
let menuCache
let menuRequest
let masterClassCache
let masterClassRequest
const CACHE_DURATION_MS = 30_000
let menuCacheAt = 0
let masterClassCacheAt = 0

function normalizeReview(review, source) {
  return {
    ...review,
    id: String(review.id),
    name: typeof review.name === 'string' ? review.name : '',
    rating: Number(review.rating) || 0,
    text: typeof review.text === 'string' ? review.text : '',
    createdAt: review.createdAt || review.created_at || '',
    source,
  }
}

function normalizeMasterClass(masterClass, source) {
  if (
    typeof masterClass.title !== 'string'
    || !/^\d{4}-\d{2}-\d{2}$/.test(masterClass.date)
    || !/^\d{2}:\d{2}$/.test(masterClass.time)
  ) return null

  return {
    ...masterClass,
    id: source === 'mockapi' ? String(masterClass.id) : masterClass.id,
    titleKg: masterClass.titleKg || '',
    titleEn: masterClass.titleEn || '',
    durationKg: masterClass.durationKg || '',
    durationEn: masterClass.durationEn || '',
    source,
  }
}

async function requestApi(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  let payload
  try {
    payload = await response.json()
  } catch {
    if (response.status >= 500) {
      throw new Error('API_SERVER_UNAVAILABLE')
    }
    if (!response.ok) {
      throw new Error(`Ошибка запроса (HTTP ${response.status})`)
    }
    throw new Error('Сервер вернул некорректный ответ')
  }
  if (!response.ok) {
    const error = new Error(payload.error || 'Не удалось выполнить запрос')
    error.status = response.status
    throw error
  }
  return payload
}

export async function registerAccount(data) {
  return requestApi('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function loginAccount(data) {
  return requestApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getCurrentAccount() {
  return requestApi('/api/auth/me')
}

export async function updateAccount(data) {
  return requestApi('/api/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function logoutAccount() {
  return requestApi('/api/auth/logout', { method: 'POST' })
}

export async function loginAdmin(data) {
  return requestApi('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getCurrentAdmin() {
  return requestApi('/api/admin/me')
}

export async function logoutAdmin() {
  return requestApi('/api/admin/logout', { method: 'POST' })
}

export async function getAdminUsers() {
  return requestApi('/api/admin/users')
}

// ── MENU ──────────────────────────────────────────
export async function getMenu() {
  if (menuCache && Date.now() - menuCacheAt < CACHE_DURATION_MS) return menuCache
  if (!menuRequest) {
    menuRequest = fetch(`${BASE}/menu`).then(async res => {
      if (!res.ok) throw new Error('Меню жүктөлгөн жок')
      const items = await res.json()
      if (!Array.isArray(items)) throw new Error('Меню жүктөлгөн жок')
      menuCache = items
      menuCacheAt = Date.now()
      return items
    })
  }
  try {
    return await menuRequest
  } finally {
    menuRequest = null
  }
}

export async function createMenuItem(data) {
  const res = await fetch(`${BASE}/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Кошуу катасы')
  const item = await res.json()
  if (menuCache) {
    menuCache = [...menuCache, item]
    menuCacheAt = Date.now()
  }
  return item
}

export async function updateMenuItem(id, data) {
  const res = await fetch(`${BASE}/menu/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Жаңыртуу катасы')
  const item = await res.json()
  if (menuCache) {
    menuCache = menuCache.map(existing => existing.id === item.id ? item : existing)
    menuCacheAt = Date.now()
  }
  return item
}

export async function deleteMenuItem(id) {
  const res = await fetch(`${BASE}/menu/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Жок кылуу катасы')
  const result = await res.json()
  if (menuCache) {
    menuCache = menuCache.filter(item => item.id !== id)
    menuCacheAt = Date.now()
  }
  return result
}

// ── ORDERS ────────────────────────────────────────
export async function getOrders() {
  const [storedOrders, legacyResponse] = await Promise.all([
    requestApi('/api/admin/orders'),
    fetch(`${BASE}/orders`),
  ])
  if (!legacyResponse.ok) throw new Error('Заказдар жүктөлгөн жок')
  const legacyOrders = await legacyResponse.json()
  if (!Array.isArray(legacyOrders)) throw new Error('Заказдар жүктөлгөн жок')
  return [
    ...storedOrders,
    ...legacyOrders.map(order => ({ ...order, source: 'legacy' })),
  ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
}

export async function createOrder(data) {
  return requestApi('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deleteOrder(id, source) {
  if (source === 'legacy') {
    const response = await fetch(`${BASE}/orders/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Жок кылуу катасы')
    return response.json()
  }
  return requestApi(`/api/admin/orders/${id}`, { method: 'DELETE' })
}

export async function createReservation(data) {
  return requestApi('/api/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function cancelReservation(id, manageToken) {
  return requestApi(`/api/reservations/${id}`, {
    method: 'DELETE',
    headers: { 'X-Reservation-Token': manageToken },
  })
}

export async function getAdminReservations() {
  return requestApi('/api/admin/reservations')
}

export async function updateAdminReservation(id, status) {
  return requestApi(`/api/admin/reservations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function createReview(data) {
  const response = await fetch(REVIEWS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, createdAt: new Date().toISOString() }),
  })
  if (!response.ok) throw new Error('Не удалось сохранить отзыв')
  const review = await response.json()
  return normalizeReview(review, 'mockapi')
}

export async function getReviews() {
  const [storedReviews, response] = await Promise.all([
    requestApi('/api/reviews'),
    fetch(REVIEWS_URL),
  ])
  if (!response.ok) throw new Error('Не удалось загрузить отзывы')
  const mockReviews = await response.json()
  if (!Array.isArray(mockReviews)) throw new Error('Сервер отзывов вернул некорректный список')
  return [
    ...mockReviews.map(review => normalizeReview(review, 'mockapi')),
    ...storedReviews.map(review => normalizeReview(review, 'sqlite')),
  ]
}

export async function getAdminReviews() {
  const [storedReviews, response] = await Promise.all([
    requestApi('/api/admin/reviews'),
    fetch(REVIEWS_URL),
  ])
  if (!response.ok) throw new Error('Не удалось загрузить отзывы')
  const mockReviews = await response.json()
  if (!Array.isArray(mockReviews)) throw new Error('Сервер отзывов вернул некорректный список')
  return [
    ...mockReviews.map(review => normalizeReview(review, 'mockapi')),
    ...storedReviews.map(review => normalizeReview(review, 'sqlite')),
  ]
}

export async function deleteAdminReview(id, source) {
  if (source === 'mockapi') {
    const response = await fetch(`${REVIEWS_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Не удалось удалить отзыв')
    return response.json()
  }
  return requestApi(`/api/admin/reviews/${id}`, { method: 'DELETE' })
}

export async function getMasterClasses() {
  if (masterClassCache && Date.now() - masterClassCacheAt < CACHE_DURATION_MS) return masterClassCache
  if (!masterClassRequest) {
    masterClassRequest = Promise.all([
      fetch(MASTER_CLASSES_URL),
      requestApi('/api/master-classes'),
    ]).then(async ([response, storedClasses]) => {
      if (!response.ok) throw new Error('Не удалось загрузить мастер-классы')
      const remoteClasses = await response.json()
      if (!Array.isArray(remoteClasses) || !Array.isArray(storedClasses)) {
        throw new Error('Сервер мастер-классов вернул некорректный список')
      }
      masterClassCache = [
        ...remoteClasses.map(item => normalizeMasterClass(item, 'mockapi')).filter(Boolean),
        ...storedClasses.map(item => normalizeMasterClass(item, 'sqlite')).filter(Boolean),
      ].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
      masterClassCacheAt = Date.now()
      return masterClassCache
    })
  }
  try {
    return await masterClassRequest
  } finally {
    masterClassRequest = null
  }
}

export async function createMasterClass(data) {
  const response = await fetch(MASTER_CLASSES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Не удалось сохранить мастер-класс')
  const masterClass = normalizeMasterClass(await response.json(), 'mockapi')
  if (!masterClass) throw new Error('MockAPI вернул некорректный мастер-класс')
  if (masterClassCache) {
    masterClassCache = [...masterClassCache, masterClass].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    masterClassCacheAt = Date.now()
  }
  return masterClass
}

export async function updateMasterClass(id, data, source = 'mockapi') {
  const response = source === 'sqlite'
    ? await requestApi(`/api/admin/master-classes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    : await fetch(`${MASTER_CLASSES_URL}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  if (source !== 'sqlite' && !response.ok) throw new Error('Не удалось обновить мастер-класс')
  const result = source === 'sqlite' ? response : await response.json()
  const masterClass = normalizeMasterClass(result, source)
  if (!masterClass) throw new Error('Не удалось обновить мастер-класс')
  if (masterClassCache) {
    masterClassCache = masterClassCache
      .map(item => item.id === masterClass.id ? masterClass : item)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    masterClassCacheAt = Date.now()
  }
  return masterClass
}

export async function deleteMasterClass(id, source = 'mockapi') {
  const result = source === 'sqlite'
    ? await requestApi(`/api/admin/master-classes/${id}`, { method: 'DELETE' })
    : await fetch(`${MASTER_CLASSES_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (source !== 'sqlite' && !result.ok) throw new Error('Не удалось удалить мастер-класс')
  const payload = source === 'sqlite' ? result : await result.json()
  if (masterClassCache) {
    masterClassCache = masterClassCache.filter(item => item.id !== id)
    masterClassCacheAt = Date.now()
  }
  return payload
}
