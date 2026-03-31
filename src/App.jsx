import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import './index.css'
import { AppProvider } from './context/AppContext'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Topbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/promos" element={<Promos />} />
              <Route path="/promos/new" element={<NewPromo />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/analytics/promo/:id" element={<PromoDetail />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/subscription" element={<Subscription />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}

