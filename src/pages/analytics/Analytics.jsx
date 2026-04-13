import React, { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { EyeIcon, HeartIcon, ChatBubbleLeftIcon, ShoppingCartIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function Statistics() {
  const { promos } = useApp()
  const [selectedPromoId, setSelectedPromoId] = useState(promos[0]?.id || null)

  const currentPromo = useMemo(
    () => promos.find((p) => p.id === selectedPromoId),
    [promos, selectedPromoId]
  )

  // Stats agrégées toutes promos
  const totalStats = useMemo(() => ({
    views:        promos.reduce((s, p) => s + (p.views || 0), 0),
    reservations: promos.reduce((s, p) => s + (p.clicks || 0), 0),
    likes:        promos.reduce((s, p) => s + (p.likes || 0), 0),
    comments:     promos.reduce((s, p) => s + (p.comments || 0), 0),
  }), [promos])

  // Stats promo sélectionnée
  const promoStats = useMemo(() => ({
    views:        currentPromo?.views || 0,
    reservations: currentPromo?.clicks || 0,
    likes:        currentPromo?.likes || 0,
    comments:     currentPromo?.comments || 0,
  }), [currentPromo])

  const engagementRate = promoStats.views
    ? Math.round(((promoStats.reservations + promoStats.likes + promoStats.comments) / promoStats.views) * 100)
    : 0

  const ctr = promoStats.views
    ? Math.round((promoStats.reservations / promoStats.views) * 100 * 100) / 100
    : 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Statistiques détaillées</h1>

      {promos.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-gray-600">
          Aucune donnée disponible tant qu'aucune promotion n'est publiée.
        </div>
      )}

      {/* Sélecteur produit */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-600">Produit :</span>
        <select
          value={selectedPromoId || ''}
          onChange={(e) => setSelectedPromoId(e.target.value)}
          className="border rounded px-4 py-2 text-sm"
        >
          {promos.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <span className="text-xs text-gray-400 ml-2">
          Stats en temps réel depuis le backend
        </span>
      </div>

      {/* Stats promo sélectionnée */}
      {currentPromo && (
        <>
          <h2 className="text-lg font-semibold text-gray-700">
            📊 {currentPromo.title}
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Vues</span>
                <EyeIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600">{promoStats.views}</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Réservations</span>
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600">{promoStats.reservations}</div>
              <div className="text-xs text-gray-500 mt-1">CTR: {ctr}%</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Aimes</span>
                <HeartIcon className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-red-600">{promoStats.likes}</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Engagement</span>
                <ChatBubbleLeftIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600">{engagementRate}%</div>
              <div className="text-xs text-gray-500 mt-1">{promoStats.comments} commentaires</div>
            </div>
          </div>

          {/* Barres de progression */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold mb-4">Détail des performances</h3>
            <div className="space-y-4">
              {[
                { label: 'Vues', value: promoStats.views, max: Math.max(promoStats.views, 1), color: 'bg-blue-500' },
                { label: 'Réservations', value: promoStats.reservations, max: Math.max(promoStats.views, 1), color: 'bg-green-500' },
                { label: 'Aimes', value: promoStats.likes, max: Math.max(promoStats.views, 1), color: 'bg-red-500' },
                { label: 'Commentaires', value: promoStats.comments, max: Math.max(promoStats.views, 1), color: 'bg-purple-500' },
              ].map(({ label, value, max, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full">
                    <div
                      className={`h-3 ${color} rounded-full transition-all`}
                      style={{ width: `${Math.min(100, Math.round((value / max) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Totaux toutes promos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold mb-4 text-lg">📦 Totaux — toutes promotions</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{totalStats.views}</div>
            <div className="text-sm text-gray-500">Vues totales</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{totalStats.reservations}</div>
            <div className="text-sm text-gray-500">Réservations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{totalStats.likes}</div>
            <div className="text-sm text-gray-500">Aimes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{totalStats.comments}</div>
            <div className="text-sm text-gray-500">Commentaires</div>
          </div>
        </div>
      </div>

      {/* Tableau produits */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b font-bold text-lg">
          Statistiques des produits (Ventes & Réservations)
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Vues</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Vendus</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Réservés</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aimes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Taux conversion</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((promo, i) => {
              const totalInteractions = (promo.sold || 0) + (promo.clicks || 0)
              const conversionRate = promo.views
                ? Math.round((totalInteractions / promo.views) * 100 * 100) / 100
                : 0
              return (
                <tr key={promo.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-3 text-sm font-medium">
                    <div>{promo.title}</div>
                    <div className="text-xs text-gray-500">{promo.category}</div>
                  </td>
                  <td className="px-6 py-3 text-sm text-blue-600 font-semibold">{promo.views || 0}</td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <ShoppingCartIcon className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-600">{promo.sold || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-600">{promo.clicks || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <HeartIcon className="w-4 h-4 text-red-500" />
                      <span className="font-semibold text-red-500">{promo.likes || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-orange-600">{conversionRate}%</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      promo.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {promo.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}