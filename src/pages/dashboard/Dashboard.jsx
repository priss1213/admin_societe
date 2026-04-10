import React from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import { PromoItem } from '../../components/ui/PromoItem'
import { ReservationItem } from '../../components/ui/ReservationItem'
import { useApp } from '../../context/AppContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { promos, reservations, subscription, companyProfile } = useApp()

  const activeCount = promos.filter((p) => p.active).length
  const views = promos.reduce((s, p) => s + (p.views || 0), 0)
  const reservationsCount = reservations.length
  const confirmedReservations = reservations.filter((r) => r.status === 'confirmed')
  const pendingCount = reservations.filter((r) => r.status === 'pending').length
  const totalCommission = confirmedReservations.reduce((s, r) => s + Number(r.commissionAmount || 0), 0)
  const quotaTotal = subscription?.promoQuota ?? null
  const reservationLimit = subscription?.monthlyLimit ?? null

  const formatMoney = (n) => `${Math.round(n).toLocaleString('fr-FR')} F`

  const recentPromos = promos.slice(0, 3)
  const recentReservations = reservations.slice(0, 3)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Tableau de bord</h1>
      <p className="text-sm text-gray-500 mb-6">
        {companyProfile?.name || 'Ma société'} · période actuelle {subscription.currentPeriodLabel}
      </p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card title="Promos actives" value={String(activeCount)} />
        <Card title="Vues" value={String(views)} />
        <Card title="Réservations" value={String(reservationsCount)} />
        <Card title="Validées" value={String(confirmedReservations.length)} />
      </div>

      {/* Bloc réservations + commissions */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-sm text-amber-700 font-medium">⏳ En attente de validation</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">{pendingCount}</div>
          <button
            onClick={() => navigate('/reservations')}
            className="mt-2 text-xs text-amber-600 hover:underline"
          >
            Valider maintenant →
          </button>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700 font-medium">✅ Validées ce mois</div>
          <div className="text-2xl font-bold text-green-800 mt-1">{confirmedReservations.length}</div>
          <div className="text-xs text-green-600 mt-1">réservations confirmées</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-700 font-medium">💰 Commissions prélevées</div>
          <div className="text-2xl font-bold text-orange-800 mt-1">{formatMoney(totalCommission)}</div>
          <div className="text-xs text-orange-600 mt-1">sur réservations validées</div>
        </div>
      </div>

      {subscription.alerts?.length > 0 && (
        <div className="space-y-3 mb-6">
          {subscription.alerts.map((alert) => (
            <div
              key={alert.title}
              className={`rounded-lg p-4 ${alert.level === 'danger' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}
            >
              <div className="font-semibold">{alert.title}</div>
              <div className="text-sm">{alert.message}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-600 text-white p-4 rounded-lg mb-6 flex justify-between items-center">
        <div>
          <div>Plan {subscription.plan}</div>
          <div className="text-sm text-blue-100">
            Promotions actives: {quotaTotal == null ? `${activeCount} / illimité` : `${activeCount} / ${quotaTotal}`} ·
            Réservations ce mois: {reservationLimit == null ? `${reservationsCount} / illimité` : `${reservationsCount} / ${reservationLimit}`}
          </div>
        </div>
        <button onClick={() => navigate('/subscription')} className="bg-white text-blue-600 px-4 py-1 rounded">
          Voir l’abonnement
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold mb-3">Mes promotions</h2>
          <div className="space-y-3">
            {recentPromos.length > 0 ? recentPromos.map((p) => (
              <PromoItem key={p.id} title={p.title} status={p.active ? 'Active' : (p.status === 'finished' ? "Terminée" : 'À venir')} />
            )) : <div className="text-sm text-gray-500">Aucune promotion pour le moment.</div>}
          </div>
          <button onClick={() => navigate('/promos')} className="mt-4 text-sm text-blue-600 hover:underline">Gérer mes promotions</button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold mb-3">Réservations récentes</h2>
          {recentReservations.length > 0 ? recentReservations.map((r) => (
            <ReservationItem key={r.id} code={r.code} status={r.status} />
          )) : <div className="text-sm text-gray-500">Aucune réservation pour le moment.</div>}
          <button onClick={() => navigate('/reservations')} className="mt-4 text-sm text-blue-600 hover:underline">Voir toutes les réservations</button>
        </div>
      </div>
    </div>
  )
}
