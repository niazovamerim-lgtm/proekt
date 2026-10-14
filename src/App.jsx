import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LangProvider } from './context/LangContext'
import { CartProvider } from './context/CartContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { AdminProvider } from './context/AdminContext'
import ErrorBoundary from './components/ErrorBoundary'
import AdminRoute from './components/AdminRoute'
import Layout from './components/Layout'
import About from './pages/About'
import Addresses from './pages/Addresses'
import Menu from './pages/Menu'
import Reserve from './pages/Reserve'
import Catering from './pages/Catering'
import MasterClass from './pages/MasterClass'
import Reviews from './pages/Reviews'
import GiftCard from './pages/GiftCard'
import Auth from './pages/Auth'
import Favorites from './pages/Favorites'
import AdminLogin from './pages/admin/AdminLogin'
import AdminPanel from './pages/admin/AdminPanel'

function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <CartProvider>
          <FavoritesProvider>
            <AdminProvider>
              <ErrorBoundary>
                <Routes>
                  {/* Сайт */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<About />} />
                    <Route path="addresses" element={<Addresses />} />
                    <Route path="menu" element={<Menu />} />
                    <Route path="reserve" element={<Reserve />} />
                    <Route path="catering" element={<Catering />} />
                    <Route path="masterclass" element={<MasterClass />} />
                    <Route path="reviews" element={<Reviews />} />
                    <Route path="giftcard" element={<GiftCard />} />
                    <Route path="favorites" element={<Favorites />} />
                    <Route path="auth" element={<Auth />} />
                  </Route>

                  {/* Админ */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminPanel />
                      </AdminRoute>
                    }
                  />
                </Routes>
              </ErrorBoundary>
            </AdminProvider>
          </FavoritesProvider>
        </CartProvider>
      </LangProvider>
    </ThemeProvider>
  )
}

export default App
