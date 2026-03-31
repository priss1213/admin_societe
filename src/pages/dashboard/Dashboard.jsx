// src/pages/dashboard/Dashboard.jsx
import React from 'react'
import Card from '../../components/ui/Card'
import { PromoItem } from '../../components/ui/PromoItem'
import { ReservationItem } from '../../components/ui/ReservationItem'
import { useApp } from '../../context/AppContext'

export default function Dashboard() {
  const { promos, reservations, subscription } = useApp()

  const activeCount = promos.filter((p) => p.active).length
  const views = promos.reduce((s, p) => s + (p.views || 0), 0)
  const reservationsCount = reservations.length
  const favorites = 0
  const quotaTotal = subscription?.promoQuota ?? 10

  const recentPromos = promos.slice(0, 3)
  const recentReservations = reservations.slice(0, 3)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card title="Promos actives" value={String(activeCount)} />
        <Card title="Vues" value={String(views)} />
        <Card title="Réservations" value={String(reservationsCount)} />
        <Card title="Favoris clients" value={String(favorites)} />
      </div>

      {/* Quota */}
      <div className="bg-blue-600 text-white p-4 rounded-lg mb-6 flex justify-between">
        <span>Quota promos : {activeCount}/{quotaTotal} utilisés</span>
        <button className="bg-white text-blue-600 px-4 py-1 rounded">Voir les plans</button>
      </div>

      {/* Promotions + Réservations */}
      <div className="grid grid-cols-2 gap-6">

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold mb-3">Mes promotions</h2>

          <div className="space-y-3">
            {recentPromos.map((p) => (
              <PromoItem key={p.id} title={p.title} status={p.active ? 'Active' : (p.status === 'finished' ? "Terminée" : 'À venir')} />
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold mb-3">Réservations récentes</h2>

          {recentReservations.map((r) => (
            <ReservationItem key={r.id} code={r.code} status={r.status} />
          ))}
        </div>

      </div>
    </div>
  )
}