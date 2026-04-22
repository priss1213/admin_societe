import React from 'react'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import Dashboard from './pages/dashboard/Dashboard'
import Promos from './pages/promotions/Promos'
import Reservations from './pages/reservations/Reservations'
import NewPromo from './pages/promotions/NewPromo'
import Analytics from './pages/analytics/Analytics'
import PromoDetail from './pages/analytics/PromoDetail'
import Statistics from './pages/analytics/Statistics'
import Reviews from './pages/analytics/Reviews'
import Profile from './pages/subscription/Profile'
import Subscription from './pages/subscription/Subscription'
import Catalogue from './pages/catalogue/Catalogue'
import ApiRoutes from './pages/ApiRoutes'
import LoginPage from './pages/auth/LoginPage'
import ChangePasswordPage from './pages/auth/ChangePasswordPage'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import { useApp } from './context/AppContext'
import MonMagasin from './pages/magasin/MonMagasin'
import MonService from './pages/service/MonService'
import ServiceStatistics from './pages/service/ServiceStatistics'

function ServiceRestrictedRoute({ children }) {
  const { companyProfile } = useApp()

  if (companyProfile?.companyType === 'service') {
    return <Navigate to="/service" replace />
  }

  return children
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <Topbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/promos" element={<ServiceRestrictedRoute><Promos /></ServiceRestrictedRoute>} />
          <Route path="/promos/new" element={<ServiceRestrictedRoute><NewPromo /></ServiceRestrictedRoute>} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/analytics" element={<ServiceRestrictedRoute><Analytics /></ServiceRestrictedRoute>} />
          <Route path="/analytics/promo/:id" element={<ServiceRestrictedRoute><PromoDetail /></ServiceRestrictedRoute>} />
          <Route path="/statistics" element={<ServiceRestrictedRoute><Statistics /></ServiceRestrictedRoute>} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/api-routes" element={<ApiRoutes />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/magasin" element={<MonMagasin />} />
          <Route path="/service" element={<MonService />} />
          <Route path="/service/statistics" element={<ServiceStatistics />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}
