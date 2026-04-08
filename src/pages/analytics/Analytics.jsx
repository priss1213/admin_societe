import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { EyeIcon, HandRaisedIcon, HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

export default function Analytics() {
  const { promos } = useApp()
  const navigate = useNavigate()
  const [selectedPromo, setSelectedPromo] = useState(null)
  const [sortBy, setSortBy] = useState('views')

  // Calculate total engagement metrics
  const totalMetrics = useMemo(() => {
    return {
      views: promos.reduce((sum, p) => sum + (p.views || 0), 0),
      clicks: promos.reduce((sum, p) => sum + (p.clicks || 0), 0),
      likes: promos.reduce((sum, p) => sum + (p.likes || 0), 0),
      comments: promos.reduce((sum, p) => sum + (p.comments || 0), 0),
    }
  }, [promos])

  // Calculate engagement rate for each promo
  const engagementData = useMemo(() => {
    return promos.map((p) => {
      const clicks = p.clicks || 0
      const likes = p.likes || 0
      const comments = p.comments || 0
      const engagementRate = p.views ? Math.round(((clicks + likes + comments) / p.views) * 100) : 0
      return {
        ...p,
        clicks,
        likes,
        comments,
        engagementRate,
        ctr: p.views ? Math.round((clicks / p.views) * 100 * 100) / 100 : 0,
      }
    })
  }, [promos])

  // Sort data
  const sortedData = useMemo(() => {
    const copy = [...engagementData]
    if (sortBy === 'views') copy.sort((a, b) => b.views - a.views)
    if (sortBy === 'engagement') copy.sort((a, b) => b.engagementRate - a.engagementRate)
    if (sortBy === 'clicks') copy.sort((a, b) => b.clicks - a.clicks)
    if (sortBy === 'likes') copy.sort((a, b) => b.likes - a.likes)
    if (sortBy === 'comments') copy.sort((a, b) => b.comments - a.comments)
    return copy
  }, [engagementData, sortBy])

  const selectedPromoData = selectedPromo 
    ? engagementData.find((p) => p.id === selectedPromo)
    : null

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vues & Clics</h1>
      {promos.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-gray-600">Aucune promotion publiée pour le moment.</div>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Vues totales</span>
            <EyeIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">{totalMetrics.views}</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Clics totaux</span>
            <HandRaisedIcon className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold">{totalMetrics.clicks}</div>
          <div className="text-xs text-gray-500 mt-1">
            CTR: {totalMetrics.views ? Math.round((totalMetrics.clicks / totalMetrics.views) * 100 * 100) / 100 : 0}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Aimes</span>
            <HeartIcon className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold">{totalMetrics.likes}</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Commentaires</span>
            <ChatBubbleLeftIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold">{totalMetrics.comments}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: List of promos */}
        <div className="col-span-2 bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Statistiques par produit</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setSortBy('views')} 
                className={`px-3 py-1 text-sm rounded ${sortBy === 'views' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
              >
                Vues
              </button>
              <button 
                onClick={() => setSortBy('clicks')} 
                className={`px-3 py-1 text-sm rounded ${sortBy === 'clicks' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
              >
                Clics
              </button>
              <button 
                onClick={() => setSortBy('engagement')} 
                className={`px-3 py-1 text-sm rounded ${sortBy === 'engagement' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}
              >
                Engagement
              </button>
              <button 
                onClick={() => setSortBy('likes')} 
                className={`px-3 py-1 text-sm rounded ${sortBy === 'likes' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}
              >
                Aimes
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {sortedData.map((promo) => (
              <div
                key={promo.id}
                onClick={() => setSelectedPromo(promo.id)}
                className={`p-3 rounded cursor-pointer transition ${
                  selectedPromo === promo.id 
                    ? 'bg-blue-50 border-2 border-blue-500' 
                    : 'bg-gray-50 border border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">{promo.title}</p>
                    <p className="text-xs text-gray-500">{promo.category}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    promo.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {promo.active ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-5 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4 text-blue-600" />
                    <span>{promo.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HandRaisedIcon className="w-4 h-4 text-green-600" />
                    <span>{promo.clicks} ({promo.ctr}%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HeartIcon className="w-4 h-4 text-red-600" />
                    <span>{promo.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChatBubbleLeftIcon className="w-4 h-4 text-purple-600" />
                    <span>{promo.comments}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{promo.engagementRate}% engagement</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Detail panel */}
        {selectedPromoData ? (
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-bold mb-1">{selectedPromoData.title}</h3>
                <p className="text-xs text-gray-500">{selectedPromoData.category}</p>
              </div>
              <button 
                onClick={() => navigate(`/analytics/promo/${selectedPromoData.id}`)}
                className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Voir les détails
              </button>
            </div>

            {/* Chart/Graph area */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-600 mb-4">Les métriques disponibles sont calculées à partir des vues et réservations enregistrées dans le backend.</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded bg-blue-50 p-3">
                  <div className="text-gray-600">Vues</div>
                  <div className="text-xl font-bold text-blue-700">{selectedPromoData.views}</div>
                </div>
                <div className="rounded bg-green-50 p-3">
                  <div className="text-gray-600">Réservations / clics</div>
                  <div className="text-xl font-bold text-green-700">{selectedPromoData.clicks}</div>
                </div>
              </div>

              {/* Engagement breakdown */}
              <div className="border-t pt-4 space-y-3">
                <p className="font-medium text-sm">Engagement</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taux de clics</span>
                    <span className="font-medium">{selectedPromoData.ctr}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded">
                    <div className="h-2 bg-green-600 rounded" style={{width: `${selectedPromoData.ctr}%`}}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taux d'engagement</span>
                    <span className="font-medium">{selectedPromoData.engagementRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded">
                    <div className="h-2 bg-purple-600 rounded" style={{width: `${selectedPromoData.engagementRate}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center col-span-1 flex items-center justify-center">
            <p className="text-gray-600">Sélectionnez une promotion pour voir les détails</p>
          </div>
        )}
      </div>
    </div>
  )
}
