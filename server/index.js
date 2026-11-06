import { createServer } from 'node:http'
import { mkdirSync } from 'node:fs'
import { extname, resolve, sep } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto'
import { isValidPhoneNumber } from 'libphonenumber-js/max'

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const PORT = Number(process.env.PORT || 3001)
const ADMIN_LOGIN = process.env.ADMIN_LOGIN?.trim() || process.env.VITE_ADMIN_LOGIN?.trim() || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || process.env.VITE_ADMIN_PASSWORD?.trim() || 'adminpass'
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''
const RESERVATIONS_URL = 'https://6ae5cbae877d34ccafc2713a.mockapi.io/Reserve'
const PROFILES_URL = 'https://6ae5cbae877d34ccafc2713a.mockapi.io/Profile'
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000
const MAX_BODY_BYTES = 16 * 1024
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

const dataDirectory = resolve(process.env.DATA_DIR || './data')
mkdirSync(dataDirectory, { recursive: true })
const database = new DatabaseSync(resolve(dataDirectory, 'restik.sqlite'))
database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    phone TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_admin INTEGER NOT NULL DEFAULT 0,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    items_json TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    customer_name TEXT NOT NULL DEFAULT '',
    customer_phone TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    guests INTEGER NOT NULL,
    table_name TEXT NOT NULL DEFAULT '',
    contact TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    manage_token_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS gift_cards (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    amount INTEGER NOT NULL,
    recipient_name TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'demo',
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS master_classes (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    duration TEXT NOT NULL,
    price TEXT NOT NULL,
    seats INTEGER NOT NULL,
    img TEXT NOT NULL DEFAULT '',
    title_kg TEXT NOT NULL DEFAULT '',
    title_en TEXT NOT NULL DEFAULT '',
    duration_kg TEXT NOT NULL DEFAULT '',
    duration_en TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS catering_packages (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    title_kg TEXT NOT NULL DEFAULT '',
    title_en TEXT NOT NULL DEFAULT '',
    guests TEXT NOT NULL,
    guests_kg TEXT NOT NULL DEFAULT '',
    guests_en TEXT NOT NULL DEFAULT '',
    price INTEGER NOT NULL,
    features_json TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);
  CREATE INDEX IF NOT EXISTS users_created_at_idx ON users(created_at DESC);
  CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
  CREATE INDEX IF NOT EXISTS reservations_date_idx ON reservations(date DESC, time DESC);
  CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON reviews(created_at DESC);
`)
database.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now())

const initialCateringPackages = [
  {
    title: 'Базовый',
    titleKg: 'Баштапкы',
    titleEn: 'Basic',
    guests: 'до 20 чел.',
    guestsKg: '20 конокко чейин',
    guestsEn: 'up to 20 guests',
    price: 15000,
    features: {
      ru: ['Холодные закуски', 'Горячие блюда', 'Напитки', 'Сервировка'],
      kg: ['Муздак закускалар', 'Ысык тамактар', 'Суусундуктар', 'Дасторкон жасалгасы'],
      en: ['Cold appetizers', 'Hot dishes', 'Drinks', 'Table setting'],
    },
  },
  {
    title: 'Стандарт',
    titleKg: 'Стандарт',
    titleEn: 'Standard',
    guests: 'до 50 чел.',
    guestsKg: '50 конокко чейин',
    guestsEn: 'up to 50 guests',
    price: 35000,
    features: {
      ru: ['Всё из Базового', 'Десерты', 'Торт на заказ', 'Официанты'],
      kg: ['Баштапкы топтомдун баары', 'Десерттер', 'Буйрутма торт', 'Официанттар'],
      en: ['Everything in Basic', 'Desserts', 'Custom cake', 'Waiters'],
    },
  },
  {
    title: 'Премиум',
    titleKg: 'Премиум',
    titleEn: 'Premium',
    guests: 'до 150 чел.',
    guestsKg: '150 конокко чейин',
    guestsEn: 'up to 150 guests',
    price: 80000,
    features: {
      ru: ['Всё из Стандарт', 'Десерты', 'Торт на заказ', 'VIP сервис'],
      kg: ['Стандарт топтомунун баары', 'Десерттер', 'Буйрутма торт', 'VIP тейлөө'],
      en: ['Everything in Standard', 'Desserts', 'Custom cake', 'VIP service'],
    },
  },
]
if (database.prepare('SELECT COUNT(*) AS count FROM catering_packages').get().count === 0) {
  const insertCateringPackage = database.prepare(`
    INSERT INTO catering_packages (
      title, title_kg, title_en, guests, guests_kg, guests_en, price, features_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const cateringPackage of initialCateringPackages) {
    insertCateringPackage.run(
      cateringPackage.title,
      cateringPackage.titleKg,
      cateringPackage.titleEn,
      cateringPackage.guests,
      cateringPackage.guestsKg,
      cateringPackage.guestsEn,
      cateringPackage.price,
      JSON.stringify(cateringPackage.features),
      Date.now(),
    )
  }
}

const initialMasterClasses = [
  {
    title: 'Итальянская паста',
    titleKg: 'Италия пастасы',
    titleEn: 'Italian pasta',
    date: '2026-11-15',
    time: '14:00',
    duration: '3 часа',
    durationKg: '3 саат',
    durationEn: '3 hours',
    price: '2 500 KGS',
    seats: 8,
    img: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80',
  },
  {
    title: 'Французские десерты',
    titleKg: 'Француз десерттери',
    titleEn: 'French desserts',
    date: '2026-11-22',
    time: '11:00',
    duration: '4 часа',
    durationKg: '4 саат',
    durationEn: '4 hours',
    price: '3 000 KGS',
    seats: 6,
    img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
  },
  {
    title: 'Суши и роллы',
    titleKg: 'Суши жана роллдор',
    titleEn: 'Sushi and rolls',
    date: '2026-12-05',
    time: '16:00',
    duration: '3 часа',
    durationKg: '3 саат',
    durationEn: '3 hours',
    price: '2 800 KGS',
    seats: 10,
    img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80',
  },
]
const masterClassCount = database.prepare('SELECT COUNT(*) AS count FROM master_classes').get()
if (masterClassCount.count === 0) {
  const insertMasterClass = database.prepare(`
    INSERT INTO master_classes (
      title, title_kg, title_en, date, time, duration, duration_kg, duration_en,
      price, seats, img, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  database.exec('BEGIN IMMEDIATE')
  try {
    for (const masterClass of initialMasterClasses) {
      insertMasterClass.run(
        masterClass.title,
        masterClass.titleKg,
        masterClass.titleEn,
        masterClass.date,
        masterClass.time,
        masterClass.duration,
        masterClass.durationKg,
        masterClass.durationEn,
        masterClass.price,
        masterClass.seats,
        masterClass.img,
        Date.now(),
      )
    }
    database.exec('COMMIT')
  } catch (error) {
    database.exec('ROLLBACK')
    throw error
  }
}

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const rateLimits = new Map()

function getClientAddress(request) {
  return request.socket.remoteAddress || 'unknown'
}

function enforceRateLimit(request, bucket, maxRequests = 12) {
  const key = `${bucket}:${getClientAddress(request)}`
  const now = Date.now()
  const current = rateLimits.get(key)
  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return
  }
  if (current.count >= maxRequests) {
    throw new HttpError(429, 'Слишком много попыток. Попробуйте позже.')
  }
  current.count += 1
}

function sendJson(response, status, payload, headers = {}) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  })
  response.end(JSON.stringify(payload))
}

function getCookie(request, name) {
  const cookies = request.headers.cookie || ''
  for (const cookie of cookies.split(';')) {
    const [key, ...value] = cookie.trim().split('=')
    if (key === name) return value.join('=')
  }
  return ''
}

function sessionCookie(token, maxAge) {
  return [
    `restik_session=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
    IS_PRODUCTION ? 'Secure' : '',
  ].filter(Boolean).join('; ')
}

function createSession(response, { userId = null, isAdmin = false }) {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = Date.now() + SESSION_DURATION_MS
  database.prepare(`
    INSERT INTO sessions (token_hash, user_id, is_admin, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(createHash('sha256').update(token).digest('hex'), userId, Number(isAdmin), expiresAt)
  response.setHeader('Set-Cookie', sessionCookie(token, SESSION_DURATION_MS / 1000))
}

function destroySession(request, response) {
  const token = getCookie(request, 'restik_session')
  if (token) {
    database.prepare('DELETE FROM sessions WHERE token_hash = ?')
      .run(createHash('sha256').update(token).digest('hex'))
  }
  response.setHeader('Set-Cookie', sessionCookie('', 0))
}

function readSession(request) {
  const token = getCookie(request, 'restik_session')
  if (!token) return null
  const tokenHash = createHash('sha256').update(token).digest('hex')
  return database.prepare(`
    SELECT sessions.user_id AS userId, sessions.is_admin AS isAdmin,
    users.name AS name, users.email AS email, users.phone AS phone,
    users.created_at AS createdAt
    FROM sessions
    LEFT JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `).get(tokenHash, Date.now()) || null
}

function requireUser(request) {
  const session = readSession(request)
  if (!session || session.isAdmin || !session.userId) {
    throw new HttpError(401, 'Войдите в аккаунт')
  }
  return session
}

function requireAdmin(request) {
  const session = readSession(request)
  if (!session?.isAdmin) throw new HttpError(401, 'Требуется вход администратора')
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
  }
}

async function syncProfileToMockApi(user) {
  const profile = {
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    createdAt: new Date(Number(user.createdAt) || Date.now()).toISOString(),
    updatedAt: new Date().toISOString(),
  }

  try {
    const lookupUrl = new URL(PROFILES_URL)
    lookupUrl.searchParams.set('email', profile.email)
    const lookup = await fetch(lookupUrl, { signal: AbortSignal.timeout(8000) })
    if (!lookup.ok) throw new Error(`profile lookup returned HTTP ${lookup.status}`)
    const profiles = await lookup.json()
    if (!Array.isArray(profiles)) throw new Error('profile lookup returned an invalid response')

    const existing = profiles.find(item => (
      typeof item.email === 'string' && item.email.toLowerCase() === profile.email.toLowerCase()
    ))
    const response = await fetch(existing
      ? `${PROFILES_URL}/${encodeURIComponent(existing.id)}`
      : PROFILES_URL, {
      method: existing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error(`profile save returned HTTP ${response.status}`)
    return true
  } catch (error) {
    console.error('MockAPI profile sync failed:', error.message)
    return false
  }
}

function publicMasterClass(masterClass) {
  return {
    id: masterClass.id,
    title: masterClass.title,
    titleKg: masterClass.title_kg || '',
    titleEn: masterClass.title_en || '',
    date: masterClass.date,
    time: masterClass.time,
    duration: masterClass.duration,
    durationKg: masterClass.duration_kg || '',
    durationEn: masterClass.duration_en || '',
    price: masterClass.price,
    seats: masterClass.seats,
    img: masterClass.img,
    createdAt: masterClass.created_at,
  }
}

function publicCateringPackage(cateringPackage) {
  return {
    id: cateringPackage.id,
    title: cateringPackage.title,
    titleKg: cateringPackage.title_kg,
    titleEn: cateringPackage.title_en,
    guests: cateringPackage.guests,
    guestsKg: cateringPackage.guests_kg,
    guestsEn: cateringPackage.guests_en,
    price: cateringPackage.price,
    features: JSON.parse(cateringPackage.features_json),
  }
}

function validateCateringPackage(body) {
  const title = cleanText(body.title, 120)
  const titleKg = cleanText(body.titleKg, 120)
  const titleEn = cleanText(body.titleEn, 120)
  const guests = cleanText(body.guests, 80)
  const guestsKg = cleanText(body.guestsKg, 80)
  const guestsEn = cleanText(body.guestsEn, 80)
  const price = Number(body.price)
  const features = {}

  if (title.length < 2) throw new HttpError(400, 'Укажите название кейтеринг-пакета')
  if (!guests) throw new HttpError(400, 'Укажите количество гостей')
  if (!Number.isSafeInteger(price) || price < 0 || price > 100000000) {
    throw new HttpError(400, 'Укажите корректную стоимость')
  }
  for (const language of ['ru', 'kg', 'en']) {
    const values = body.features?.[language]
    if (!Array.isArray(values) || values.length > 20) {
      throw new HttpError(400, 'Проверьте список услуг')
    }
    features[language] = values
      .map(value => cleanText(value, 160))
      .filter(Boolean)
  }
  return { title, titleKg, titleEn, guests, guestsKg, guestsEn, price, features }
}

function validateMasterClass(body) {
  const title = cleanText(body.title, 120)
  const date = cleanText(body.date, 10)
  const time = cleanText(body.time, 5)
  const duration = cleanText(body.duration, 60)
  const price = cleanText(body.price, 40)
  const seats = Number(body.seats)
  const img = cleanText(body.img, 1000)
  const titleKg = cleanText(body.titleKg, 120)
  const titleEn = cleanText(body.titleEn, 120)
  const durationKg = cleanText(body.durationKg, 60)
  const durationEn = cleanText(body.durationEn, 60)
  if (title.length < 2) throw new HttpError(400, 'Укажите название мастер-класса')
  const parsedDate = new Date(`${date}T00:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    throw new HttpError(400, 'Укажите корректную дату мастер-класса')
  }
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new HttpError(400, 'Укажите корректное время мастер-класса')
  if (!duration || !price) throw new HttpError(400, 'Укажите длительность и стоимость')
  if (!Number.isInteger(seats) || seats < 1 || seats > 500) throw new HttpError(400, 'Проверьте количество мест')
  return { title, titleKg, titleEn, date, time, duration, durationKg, durationEn, price, seats, img }
}

function validateOrder(body) {
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
    throw new HttpError(400, 'Добавьте товары в заказ')
  }
  const items = body.items.map((item) => {
    const id = cleanText(String(item.id ?? ''), 80)
    const name = cleanText(item.name, 120)
    const qty = Number(item.qty)
    const price = Number(item.price)
    if (!id || !name || !Number.isInteger(qty) || qty < 1 || qty > 99 || !Number.isFinite(price) || price < 0 || price > 100000) {
      throw new HttpError(400, 'Проверьте состав заказа')
    }
    return { id, name, qty, price }
  })
  return {
    items,
    total: Math.round(items.reduce((sum, item) => sum + item.price * item.qty, 0) * 100) / 100,
  }
}

function publicReservation(reservation, includeManageToken = false) {
  return {
    id: reservation.id,
    date: reservation.date,
    time: reservation.time,
    guests: reservation.guests,
    table: reservation.table_name,
    contact: reservation.contact,
    status: reservation.status,
    createdAt: reservation.created_at,
    ...(includeManageToken ? { manageToken: reservation.manageToken } : {}),
  }
}

function hashPassword(password) {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, 64)
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
}

function verifyPassword(password, encoded) {
  const [algorithm, saltHex, hashHex] = encoded.split('$')
  if (algorithm !== 'scrypt' || !saltHex || !hashHex) return false
  const expected = Buffer.from(hashHex, 'hex')
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

function verifyAdminCredentials(login, password) {
  const compare = (candidate, expected) => {
    const candidateHash = createHash('sha256').update(candidate).digest()
    const expectedHash = createHash('sha256').update(expected).digest()
    return timingSafeEqual(candidateHash, expectedHash)
  }
  return compare(login, ADMIN_LOGIN) && compare(password, ADMIN_PASSWORD)
}

async function readJson(request) {
  let size = 0
  const chunks = []
  for await (const chunk of request) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw new HttpError(413, 'Слишком большой запрос')
    chunks.push(chunk)
  }
  let payload
  try {
    payload = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new HttpError(400, 'Некорректные данные запроса')
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new HttpError(400, 'Ожидался JSON-объект')
  }
  return payload
}

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function validatePhone(value, required = false) {
  const phone = cleanText(value, 40)
  if (!phone && !required) return ''
  if (!phone) throw new HttpError(400, 'Укажите контактный телефон')
  if (!isValidPhoneNumber(phone)) throw new HttpError(400, 'Укажите корректный номер телефона')
  return phone
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 256) {
    throw new HttpError(400, 'Пароль должен содержать от 8 до 256 символов')
  }
}

async function sendTelegramMessage(message, context) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false
  try {
    const result = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
      signal: AbortSignal.timeout(5000),
    })
    const payload = await result.json()
    if (!result.ok || !payload.ok) {
      console.error(`Telegram ${context} notification failed with status ${result.status}: ${payload.description || 'unknown error'}`)
      return false
    }
    return true
  } catch (error) {
    console.error(`Telegram ${context} notification failed:`, error.message)
    return false
  }
}

async function notifyTelegram(user) {
  const message = [
    'Новая регистрация на сайте Рестик',
    `Имя: ${user.name}`,
    `Email: ${user.email}`,
    `Телефон: ${user.phone || 'не указан'}`,
    `Дата: ${new Date(user.createdAt).toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' })}`,
  ].join('\n')
  return sendTelegramMessage(message, 'registration')
}

async function notifyReservation(reservation) {
  const tableNames = {
    window: 'у окна',
    center: 'в центре',
    corner: 'в углу',
    vip: 'VIP кабинет',
  }
  const message = [
    'Новая бронь столика на сайте Рестик',
    `Дата: ${reservation.date}`,
    `Время: ${reservation.time}`,
    `Гостей: ${reservation.guests}`,
    `Столик: ${tableNames[reservation.table] || 'не выбран'}`,
    `Телефон: ${reservation.contact}`,
  ].join('\n')
  return sendTelegramMessage(message, 'reservation')
}

async function notifyGiftCard(giftCard, recipientEmail) {
  const message = [
    'Создана демо-подарочная карта на сайте Рестик (оплата не подключена)',
    `Сумма: ${giftCard.amount.toLocaleString('ru-RU')} сом`,
    `Получатель: ${giftCard.recipientName}`,
    `Email получателя: ${recipientEmail}`,
    `Отправитель: ${giftCard.senderName}`,
    `Код карты: ${giftCard.code}`,
    `Пожелание: ${giftCard.message || 'не указано'}`,
  ].join('\n')
  return sendTelegramMessage(message, 'gift card')
}

function publicGiftCard(giftCard) {
  return {
    code: giftCard.code,
    amount: giftCard.amount,
    recipientName: giftCard.recipient_name,
    senderName: giftCard.sender_name,
    message: giftCard.message,
    status: giftCard.status,
    createdAt: giftCard.created_at,
  }
}

async function handleApi(request, response, pathname) {
  if (request.method === 'GET' && pathname === '/api/health') {
    return sendJson(response, 200, { ok: true })
  }

  if (request.method === 'POST' && pathname === '/api/gift-cards') {
    enforceRateLimit(request, 'gift-cards', 10)
    const body = await readJson(request)
    const amount = Number(body.amount)
    const recipientName = cleanText(body.recipientName, 100)
    const recipientEmail = cleanText(body.recipientEmail, 254).toLowerCase()
    const senderName = cleanText(body.senderName, 100)
    const message = cleanText(body.message, 500)
    if (!Number.isInteger(amount) || amount < 100 || amount > 100000) {
      throw new HttpError(400, 'Неверная сумма подарочной карты')
    }
    if (recipientName.length < 2) throw new HttpError(400, 'Укажите имя получателя')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      throw new HttpError(400, 'Укажите корректный email получателя')
    }
    if (senderName.length < 2) throw new HttpError(400, 'Укажите имя отправителя')

    const code = randomBytes(18).toString('base64url')
    const createdAt = Date.now()
    const inserted = database.prepare(`
      INSERT INTO gift_cards (code, amount, recipient_name, sender_name, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(code, amount, recipientName, senderName, message, createdAt)
    const giftCard = database.prepare('SELECT * FROM gift_cards WHERE id = ?').get(Number(inserted.lastInsertRowid))
    const telegramNotificationSent = await notifyGiftCard(publicGiftCard(giftCard), recipientEmail)
    return sendJson(response, 201, {
      ...publicGiftCard(giftCard),
      telegramNotificationSent,
    })
  }

  const giftCardMatch = pathname.match(/^\/api\/gift-cards\/([A-Za-z0-9_-]{24})$/)
  if (request.method === 'GET' && giftCardMatch) {
    enforceRateLimit(request, 'gift-card-lookups', 30)
    const giftCard = database.prepare('SELECT * FROM gift_cards WHERE code = ?').get(giftCardMatch[1])
    if (!giftCard) throw new HttpError(404, 'Подарочная карта не найдена')
    return sendJson(response, 200, publicGiftCard(giftCard))
  }

  if (request.method === 'POST' && pathname === '/api/orders') {
    enforceRateLimit(request, 'orders', 20)
    const body = await readJson(request)
    const order = validateOrder(body)
    const session = readSession(request)
    const customer = session && !session.isAdmin ? session : null
    const createdAt = Date.now()
    const inserted = database.prepare(`
      INSERT INTO orders (items_json, total, customer_name, customer_phone, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(JSON.stringify(order.items), order.total, customer?.name || '', customer?.phone || '', createdAt)
    return sendJson(response, 201, {
      id: Number(inserted.lastInsertRowid),
      ...order,
      status: 'new',
      customerName: customer?.name || '',
      customerPhone: customer?.phone || '',
      createdAt,
    })
  }

  if (request.method === 'POST' && pathname === '/api/mockapi-reservations') {
    enforceRateLimit(request, 'reservations', 20)
    const body = await readJson(request)
    if (body.type === 'catering') {
      const packageTitle = cleanText(body.packageTitle, 120)
      const guests = cleanText(body.guests, 80)
      const name = cleanText(body.name, 120)
      const contact = validatePhone(body.contact, true)
      if (packageTitle.length < 2 || !guests || name.length < 2) {
        throw new HttpError(400, 'Проверьте данные заявки на кейтеринг')
      }
      const payload = {
        type: 'catering',
        packageId: cleanText(String(body.packageId ?? ''), 80),
        packageTitle,
        guests,
        name,
        contact,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      const result = await fetch(RESERVATIONS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      })
      if (!result.ok) throw new HttpError(502, 'Не удалось сохранить заявку в MockAPI')
      return sendJson(response, 201, { ...await result.json(), source: 'mockapi' })
    }

    const date = cleanText(body.date, 10)
    const time = cleanText(body.time, 5)
    const guests = Number(body.guests)
    const table = cleanText(body.table, 40)
    const contact = validatePhone(body.contact, true)
    const parsedDate = new Date(`${date}T00:00:00Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
      throw new HttpError(400, 'Укажите корректную дату бронирования')
    }
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new HttpError(400, 'Укажите корректное время')
    if (!Number.isInteger(guests) || guests < 1 || guests > 30) throw new HttpError(400, 'Проверьте количество гостей')
    if (table && !['window', 'center', 'corner', 'vip'].includes(table)) {
      throw new HttpError(400, 'Выберите корректный столик')
    }
    const reservationData = {
      type: 'table',
      date,
      time,
      guests,
      table,
      contact,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    const result = await fetch(RESERVATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationData),
      signal: AbortSignal.timeout(8000),
    })
    if (!result.ok) throw new HttpError(502, 'Не удалось сохранить бронирование в MockAPI')
    const reservation = await result.json()
    const telegramNotificationSent = await notifyReservation(reservationData)
    return sendJson(response, 201, {
      ...reservation,
      source: 'mockapi',
      telegramNotificationSent,
    })
  }

  if (request.method === 'POST' && pathname === '/api/reservations') {
    enforceRateLimit(request, 'reservations', 20)
    const body = await readJson(request)
    const date = cleanText(body.date, 10)
    const time = cleanText(body.time, 5)
    const guests = Number(body.guests)
    const table = cleanText(body.table, 40)
    const contact = validatePhone(body.contact, true)
    const parsedDate = new Date(`${date}T00:00:00Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
      throw new HttpError(400, 'Укажите корректную дату бронирования')
    }
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new HttpError(400, 'Укажите корректное время')
    if (!Number.isInteger(guests) || guests < 1 || guests > 30) throw new HttpError(400, 'Проверьте количество гостей')
    const manageToken = randomBytes(32).toString('base64url')
    const createdAt = Date.now()
    const inserted = database.prepare(`
      INSERT INTO reservations (date, time, guests, table_name, contact, manage_token_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(date, time, guests, table, contact, createHash('sha256').update(manageToken).digest('hex'), createdAt)
    const reservation = database.prepare('SELECT * FROM reservations WHERE id = ?').get(Number(inserted.lastInsertRowid))
    const telegramNotificationSent = await notifyReservation({ date, time, guests, table, contact })
    return sendJson(response, 201, {
      ...publicReservation({ ...reservation, manageToken }, true),
      telegramNotificationSent,
    })
  }

  if (request.method === 'DELETE' && /^\/api\/reservations\/\d+$/.test(pathname)) {
    const id = Number(pathname.split('/').pop())
    const reservation = database.prepare('SELECT manage_token_hash FROM reservations WHERE id = ?').get(id)
    const token = request.headers['x-reservation-token']
    if (!reservation || typeof token !== 'string'
      || reservation.manage_token_hash !== createHash('sha256').update(token).digest('hex')) {
      throw new HttpError(404, 'Бронирование не найдено')
    }
    database.prepare('DELETE FROM reservations WHERE id = ?').run(id)
    return sendJson(response, 200, { ok: true })
  }

  if (request.method === 'POST' && pathname === '/api/reviews') {
    enforceRateLimit(request, 'reviews', 12)
    const body = await readJson(request)
    const name = cleanText(body.name, 100)
    const rating = Number(body.rating)
    const text = cleanText(body.text, 2000)
    if (name.length < 2) throw new HttpError(400, 'Укажите имя')
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, 'Проверьте оценку')
    if (text.length < 3) throw new HttpError(400, 'Отзыв слишком короткий')
    const createdAt = Date.now()
    const inserted = database.prepare(`
      INSERT INTO reviews (name, rating, text, created_at) VALUES (?, ?, ?, ?)
    `).run(name, rating, text, createdAt)
    return sendJson(response, 201, { id: Number(inserted.lastInsertRowid), name, rating, text, createdAt })
  }

  if (request.method === 'GET' && pathname === '/api/reviews') {
    const reviews = database.prepare(`
      SELECT id, name, rating, text, created_at AS createdAt
      FROM reviews ORDER BY created_at DESC LIMIT 100
    `).all()
    return sendJson(response, 200, reviews)
  }

  if (request.method === 'GET' && pathname === '/api/master-classes') {
    const classes = database.prepare('SELECT * FROM master_classes ORDER BY date, time').all()
    return sendJson(response, 200, classes.map(publicMasterClass))
  }

  if (request.method === 'GET' && pathname === '/api/catering-packages') {
    const packages = database.prepare('SELECT * FROM catering_packages ORDER BY id').all()
    return sendJson(response, 200, packages.map(publicCateringPackage))
  }

  if (request.method === 'POST' && pathname === '/api/auth/register') {
    enforceRateLimit(request, 'register', 6)
    const body = await readJson(request)
    const name = cleanText(body.name, 100)
    const email = cleanText(body.email, 254).toLowerCase()
    const phone = validatePhone(body.phone)
    const password = body.password
    if (name.length < 2) throw new HttpError(400, 'Имя должно содержать не менее 2 символов')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Укажите корректный email')
    validatePassword(password)
    const createdAt = Date.now()
    let inserted
    try {
      inserted = database.prepare(`
        INSERT INTO users (name, email, phone, password_hash, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(name, email, phone, hashPassword(password), createdAt)
    } catch (error) {
      if (String(error.message).includes('UNIQUE constraint failed')) {
        throw new HttpError(409, 'Аккаунт с таким email уже существует')
      }
      throw error
    }
    const user = publicUser({ id: Number(inserted.lastInsertRowid), name, email, phone, createdAt })
    createSession(response, { userId: user.id })
    void notifyTelegram(user)
    const profileSynced = await syncProfileToMockApi(user)
    return sendJson(response, 201, { user, profileSynced })
  }

  if (request.method === 'POST' && pathname === '/api/auth/login') {
    enforceRateLimit(request, 'login')
    const body = await readJson(request)
    const email = cleanText(body.email, 254).toLowerCase()
    const password = typeof body.password === 'string' ? body.password : ''
    const user = database.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user || !verifyPassword(password, user.password_hash)) {
      throw new HttpError(401, 'Email или пароль указаны неверно')
    }
    createSession(response, { userId: user.id })
    const account = publicUser({ ...user, createdAt: user.created_at })
    const profileSynced = await syncProfileToMockApi(account)
    return sendJson(response, 200, {
      user: account,
      profileSynced,
    })
  }

  if (request.method === 'GET' && pathname === '/api/auth/me') {
    const session = readSession(request)
    if (!session || session.isAdmin || !session.userId) {
      throw new HttpError(401, 'Войдите в аккаунт')
    }
    const user = publicUser({ ...session, id: session.userId })
    const profileSynced = await syncProfileToMockApi(user)
    return sendJson(response, 200, { user, profileSynced })
  }

  if (request.method === 'PATCH' && pathname === '/api/auth/profile') {
    const session = requireUser(request)
    const body = await readJson(request)
    const name = cleanText(body.name, 100)
    const phone = validatePhone(body.phone)
    if (name.length < 2) throw new HttpError(400, 'Имя должно содержать не менее 2 символов')

    if (body.newPassword) {
      validatePassword(body.newPassword)
      const user = database.prepare('SELECT password_hash FROM users WHERE id = ?').get(session.userId)
      if (!user || !verifyPassword(body.currentPassword || '', user.password_hash)) {
        throw new HttpError(400, 'Текущий пароль указан неверно')
      }
      database.prepare('UPDATE users SET name = ?, phone = ?, password_hash = ? WHERE id = ?')
        .run(name, phone, hashPassword(body.newPassword), session.userId)
    } else {
      database.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?')
        .run(name, phone, session.userId)
    }

    const updated = database.prepare(`
      SELECT id, name, email, phone, created_at AS createdAt FROM users WHERE id = ?
    `).get(session.userId)
    const user = publicUser(updated)
    const profileSynced = await syncProfileToMockApi(user)
    return sendJson(response, 200, { user, profileSynced })
  }

  if (request.method === 'POST' && pathname === '/api/auth/logout') {
    destroySession(request, response)
    return sendJson(response, 200, { ok: true })
  }

  if (request.method === 'POST' && pathname === '/api/admin/login') {
    enforceRateLimit(request, 'admin-login', 8)
    const body = await readJson(request)
    const login = typeof body.login === 'string' ? body.login : ''
    const password = typeof body.password === 'string' ? body.password : ''
    if (!verifyAdminCredentials(login, password)) {
      throw new HttpError(401, 'Логин или пароль указаны неверно')
    }
    createSession(response, { isAdmin: true })
    return sendJson(response, 200, { ok: true })
  }

  if (request.method === 'GET' && pathname === '/api/admin/me') {
    requireAdmin(request)
    return sendJson(response, 200, { isAdmin: true })
  }

  if (request.method === 'GET' && pathname === '/api/admin/orders') {
    requireAdmin(request)
    const orders = database.prepare(`
      SELECT id, items_json, total, status, customer_name AS customerName,
        customer_phone AS customerPhone, created_at AS createdAt
      FROM orders ORDER BY created_at DESC LIMIT 500
    `).all().map(order => ({ ...order, source: 'persistent', items: JSON.parse(order.items_json) }))
    return sendJson(response, 200, orders)
  }

  if (request.method === 'DELETE' && /^\/api\/admin\/orders\/\d+$/.test(pathname)) {
    requireAdmin(request)
    const id = Number(pathname.split('/').pop())
    const result = database.prepare('DELETE FROM orders WHERE id = ?').run(id)
    if (result.changes === 0) throw new HttpError(404, 'Заказ не найден')
    return sendJson(response, 200, { ok: true })
  }

  if (request.method === 'GET' && pathname === '/api/admin/reservations') {
    requireAdmin(request)
    const reservations = database.prepare(`
      SELECT id, date, time, guests, table_name, contact, status, created_at
      FROM reservations ORDER BY created_at DESC LIMIT 500
    `).all()
    return sendJson(response, 200, reservations.map(reservation => publicReservation(reservation)))
  }

  if (request.method === 'PATCH' && /^\/api\/admin\/reservations\/\d+$/.test(pathname)) {
    requireAdmin(request)
    const id = Number(pathname.split('/').pop())
    const body = await readJson(request)
    if (!['confirmed', 'cancelled'].includes(body.status)) throw new HttpError(400, 'Недопустимый статус бронирования')
    const result = database.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(body.status, id)
    if (result.changes === 0) throw new HttpError(404, 'Бронирование не найдено')
    return sendJson(response, 200, { ok: true })
  }

  if (request.method === 'GET' && pathname === '/api/admin/reviews') {
    requireAdmin(request)
    const reviews = database.prepare(`
      SELECT id, name, rating, text, created_at AS createdAt
      FROM reviews ORDER BY created_at DESC LIMIT 500
    `).all()
    return sendJson(response, 200, reviews)
  }

  if (request.method === 'DELETE' && /^\/api\/admin\/reviews\/\d+$/.test(pathname)) {
    requireAdmin(request)
    const id = Number(pathname.split('/').pop())
    const result = database.prepare('DELETE FROM reviews WHERE id = ?').run(id)
    if (result.changes === 0) throw new HttpError(404, 'Отзыв не найден')
    return sendJson(response, 200, { ok: true })
  }

  if (request.method === 'POST' && pathname === '/api/admin/catering-packages') {
    requireAdmin(request)
    const cateringPackage = validateCateringPackage(await readJson(request))
    const inserted = database.prepare(`
      INSERT INTO catering_packages (
        title, title_kg, title_en, guests, guests_kg, guests_en, price, features_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      cateringPackage.title,
      cateringPackage.titleKg,
      cateringPackage.titleEn,
      cateringPackage.guests,
      cateringPackage.guestsKg,
      cateringPackage.guestsEn,
      cateringPackage.price,
      JSON.stringify(cateringPackage.features),
      Date.now(),
    )
    const created = database.prepare('SELECT * FROM catering_packages WHERE id = ?')
      .get(Number(inserted.lastInsertRowid))
    return sendJson(response, 201, publicCateringPackage(created))
  }

  if (request.method === 'PATCH' && /^\/api\/admin\/catering-packages\/\d+$/.test(pathname)) {
    requireAdmin(request)
    const id = Number(pathname.split('/').pop())
    const cateringPackage = validateCateringPackage(await readJson(request))
    const result = database.prepare(`
      UPDATE catering_packages SET
        title = ?, title_kg = ?, title_en = ?, guests = ?, guests_kg = ?, guests_en = ?,
        price = ?, features_json = ?
      WHERE id = ?
    `).run(
      cateringPackage.title,
      cateringPackage.titleKg,
      cateringPackage.titleEn,
      cateringPackage.guests,
      cateringPackage.guestsKg,
      cateringPackage.guestsEn,
      cateringPackage.price,
      JSON.stringify(cateringPackage.features),
      id,
    )
    if (result.changes === 0) throw new HttpError(404, 'Кейтеринг-пакет не найден')
    const updated = database.prepare('SELECT * FROM catering_packages WHERE id = ?').get(id)
    return sendJson(response, 200, publicCateringPackage(updated))
  }

  if (request.method === 'DELETE' && /^\/api\/admin\/catering-packages\/\d+$/.test(pathname)) {
    requireAdmin(request)
    const id = Number(pathname.split('/').pop())
    const result = database.prepare('DELETE FROM catering_packages WHERE id = ?').run(id)
    if (result.changes === 0) throw new HttpError(404, 'Кейтеринг-пакет не найден')
    return sendJson(response, 200, { ok: true })
  }

  if (request.method === 'POST' && pathname === '/api/admin/master-classes') {
    requireAdmin(request)
    const masterClass = validateMasterClass(await readJson(request))
    const createdAt = Date.now()
    const inserted = database.prepare(`
      INSERT INTO master_classes (
        title, title_kg, title_en, date, time, duration, duration_kg, duration_en,
        price, seats, img, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      masterClass.title, masterClass.titleKg, masterClass.titleEn, masterClass.date,
      masterClass.time, masterClass.duration, masterClass.durationKg, masterClass.durationEn,
      masterClass.price, masterClass.seats, masterClass.img, createdAt,
    )
    const created = database.prepare('SELECT * FROM master_classes WHERE id = ?').get(Number(inserted.lastInsertRowid))
    return sendJson(response, 201, publicMasterClass(created))
  }

  if (request.method === 'PATCH' && /^\/api\/admin\/master-classes\/\d+$/.test(pathname)) {
    requireAdmin(request)
    const id = Number(pathname.split('/').pop())
    const masterClass = validateMasterClass(await readJson(request))
    const result = database.prepare(`
      UPDATE master_classes SET title = ?, title_kg = ?, title_en = ?, date = ?, time = ?,
        duration = ?, duration_kg = ?, duration_en = ?, price = ?, seats = ?, img = ?
      WHERE id = ?
    `).run(
      masterClass.title, masterClass.titleKg, masterClass.titleEn, masterClass.date,
      masterClass.time, masterClass.duration, masterClass.durationKg, masterClass.durationEn,
      masterClass.price, masterClass.seats, masterClass.img, id,
    )
    if (result.changes === 0) throw new HttpError(404, 'Мастер-класс не найден')
    const updated = database.prepare('SELECT * FROM master_classes WHERE id = ?').get(id)
    return sendJson(response, 200, publicMasterClass(updated))
  }

  if (request.method === 'DELETE' && /^\/api\/admin\/master-classes\/\d+$/.test(pathname)) {
    requireAdmin(request)
    const id = Number(pathname.split('/').pop())
    const result = database.prepare('DELETE FROM master_classes WHERE id = ?').run(id)
    if (result.changes === 0) throw new HttpError(404, 'Мастер-класс не найден')
    return sendJson(response, 200, { ok: true })
  }

  if (request.method === 'GET' && pathname === '/api/admin/users') {
    requireAdmin(request)
    const users = database.prepare(`
      SELECT id, name, email, phone, created_at AS createdAt
      FROM users ORDER BY created_at DESC LIMIT 100
    `).all()
    const { total } = database.prepare('SELECT COUNT(*) AS total FROM users').get()
    return sendJson(response, 200, { users, total })
  }

  if (request.method === 'POST' && pathname === '/api/admin/logout') {
    destroySession(request, response)
    return sendJson(response, 200, { ok: true })
  }

  throw new HttpError(404, 'Маршрут не найден')
}

function serveStatic(response, pathname) {
  const distDirectory = resolve('./dist')
  if (!existsSync(distDirectory)) {
    return sendJson(response, 404, { error: 'Сайт ещё не собран. Выполните npm run build.' })
  }
  const requestedPath = pathname === '/' ? '/index.html' : decodeURIComponent(pathname)
  const filePath = resolve(distDirectory, `.${requestedPath}`)
  if (filePath !== distDirectory && !filePath.startsWith(`${distDirectory}${sep}`)) {
    return sendJson(response, 400, { error: 'Некорректный путь' })
  }
  const target = existsSync(filePath) ? filePath : resolve(distDirectory, 'index.html')
  response.writeHead(200, {
    'Cache-Control': target.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
    'Content-Type': MIME_TYPES[extname(target)] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  })
  createReadStream(target).pipe(response)
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
    if (url.pathname.startsWith('/api/')) {
      await handleApi(request, response, url.pathname)
      return
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      throw new HttpError(405, 'Метод не поддерживается')
    }
    serveStatic(response, url.pathname)
  } catch (error) {
    if (response.headersSent) {
      response.destroy(error)
      return
    }
    const status = error instanceof HttpError ? error.status : 500
    if (status === 500) console.error('Request failed:', error)
    sendJson(response, status, {
      error: status === 500 ? 'Внутренняя ошибка сервера' : error.message,
    })
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Рестик API listening on port ${PORT}; database: ${resolve(dataDirectory, 'restik.sqlite')}`)
})
