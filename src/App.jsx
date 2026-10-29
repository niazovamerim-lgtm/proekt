import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LangProvider } from './context/LangContext'
import { CartProvider } from './context/CartContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { AdminProvider } from './context/AdminContext'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import AdminRoute from './components/AdminRoute'
import Layout from './components/Layout'
import { useLang } from './context/LangContext'

const About = lazy(() => import('./pages/About'))
const Addresses = lazy(() => import('./pages/Addresses'))
const Menu = lazy(() => import('./pages/Menu'))
const Catering = lazy(() => import('./pages/Catering'))
const MasterClass = lazy(() => import('./pages/MasterClass'))
const Reviews = lazy(() => import('./pages/Reviews'))
const GiftCard = lazy(() => import('./pages/GiftCard'))
const Auth = lazy(() => import('./pages/Auth'))
const Favorites = lazy(() => import('./pages/Favorites'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'))
const Profile = lazy(() => import('./pages/Profile'))
const Reserve = lazy(() => import('./pages/Reserve'))

function RouteLoading() {
  const { t } = useLang()
  return <div className="app-route-loading" role="status">{t('loading')}</div>
}

function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <CartProvider>
          <FavoritesProvider>
            <AuthProvider>
              <AdminProvider>
                <ErrorBoundary>
                  <Suspense fallback={<RouteLoading />}>
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
                        <Route path="profile" element={<Profile />} />
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
                  </Suspense>
                </ErrorBoundary>
              </AdminProvider>
            </AuthProvider>
          </FavoritesProvider>
        </CartProvider>
      </LangProvider>
    </ThemeProvider>
  )
}

export default App
