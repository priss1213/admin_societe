import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { EyeIcon, HandRaisedIcon, HeartIcon, ChatBubbleLeftIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function PromoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { promos } = useApp()

  const promo = useMemo(() => {
    return promos.find((p) => p.id === id)
  }, [promos, id])

  if (!promo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Promotion non trouvée</p>
        <button
          onClick={() => navigate('/analytics')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Retour aux statistiques
        </button>
      </div>
    )
  }

  const ctr = promo.views ? Math.round((promo.clicks / promo.views) * 100 * 100) / 100 : 0
  const engagementRate = promo.views ? Math.round(((promo.clicks + promo.likes + promo.comments) / promo.views) * 100) : 0
  const likeRate = promo.views ? Math.round((promo.likes / promo.views) * 100 * 100) / 100 : 0
  const commentRate = promo.views ? Math.round((promo.comments / promo.views) * 100 * 100) / 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/analytics')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Retour</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold">{promo.title}</h1>
          <p className="text-gray-600">{promo.category}</p>
        </div>
      </div>

      {/* Status and info */}
      <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Description</p>
          <p className="font-medium">{promo.description}</p>
        </div>
        <div className={`px-4 py-2 rounded font-medium ${
          promo.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {promo.active ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Main metrics grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Vues</span>
            <EyeIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600">{promo.views}</div>
          <p className="text-xs text-gray-500 mt-2">Nombre de fois où la promo a été vue</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Clics</span>
            <HandRaisedIcon className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">{promo.clicks}</div>
          <p className="text-xs text-gray-500 mt-2">CTR: <span className="font-semibold">{ctr}%</span></p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Aimes</span>
            <HeartIcon className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600">{promo.likes}</div>
          <p className="text-xs text-gray-500 mt-2">Taux: <span className="font-semibold">{likeRate}%</span></p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Commentaires</span>
            <ChatBubbleLeftIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-600">{promo.comments}</div>
          <p className="text-xs text-gray-500 mt-2">Taux: <span className="font-semibold">{commentRate}%</span></p>
        </div>
      </div>

      {/* Charts and detailed metrics */}
      <div className="grid grid-cols-2 gap-6">
        {/* Engagement chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-4 text-lg">Graphiques - {promo.engagement?.date_range}</h2>
          
          {/* Views chart */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-3 text-blue-700">Vues par jour</p>
            <div className="space-y-2">
              {promo.engagement?.views?.map((v, i) => {
                const maxViews = Math.max.apply(null, promo.engagement.views)
                const percentage = (v / maxViews) * 100
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 text-sm font-medium text-gray-600">J{i+1}</div>
                    <div className="flex-1">
                      <div className="flex items-end h-8 bg-blue-50 rounded overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full transition-all" 
                          style={{width: `${percentage}%`}}
                        />
                      </div>
                    </div>
                    <div className="w-8 text-right text-sm font-medium">{v}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Clicks chart */}
          <div>
            <p className="text-sm font-medium mb-3 text-green-700">Clics par jour</p>
            <div className="space-y-2">
              {promo.engagement?.clicks?.map((c, i) => {
                const maxClicks = Math.max.apply(null, promo.engagement.clicks)
                const percentage = (c / maxClicks) * 100
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 text-sm font-medium text-gray-600">J{i+1}</div>
                    <div className="flex-1">
                      <div className="flex items-end h-8 bg-green-50 rounded overflow-hidden">
                        <div 
                          className="bg-green-500 h-full transition-all" 
                          style={{width: `${percentage}%`}}
                        />
                      </div>
                    </div>
                    <div className="w-8 text-right text-sm font-medium">{c}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Metrics breakdown */}
        <div className="space-y-4">
          {/* Engagement Rate */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-600"></div>
              Taux d'engagement global
            </h3>
            <div className="text-4xl font-bold text-purple-600 mb-2">{engagementRate}%</div>
            <p className="text-sm text-gray-600">
              ({promo.clicks + promo.likes + promo.comments} interactions sur {promo.views} vues)
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Clics ({promo.clicks})</span>
                  <span className="font-medium">{Math.round((promo.clicks / (promo.clicks + promo.likes + promo.comments)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div className="h-2 bg-green-500 rounded" style={{width: `${Math.round((promo.clicks / (promo.clicks + promo.likes + promo.comments)) * 100)}%`}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Aimes ({promo.likes})</span>
                  <span className="font-medium">{Math.round((promo.likes / (promo.clicks + promo.likes + promo.comments)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div className="h-2 bg-red-500 rounded" style={{width: `${Math.round((promo.likes / (promo.clicks + promo.likes + promo.comments)) * 100)}%`}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Commentaires ({promo.comments})</span>
                  <span className="font-medium">{Math.round((promo.comments / (promo.clicks + promo.likes + promo.comments)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div className="h-2 bg-purple-500 rounded" style={{width: `${Math.round((promo.comments / (promo.clicks + promo.likes + promo.comments)) * 100)}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Rates */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              Taux de conversion
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">CTR (Click Through Rate)</span>
                  <span className="text-sm font-bold text-green-600">{ctr}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div className="h-2 bg-green-500 rounded" style={{width: `${Math.min(100, ctr * 5)}%`}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Like Rate</span>
                  <span className="text-sm font-bold text-red-600">{likeRate}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div className="h-2 bg-red-500 rounded" style={{width: `${Math.min(100, likeRate * 5)}%`}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Comment Rate</span>
                  <span className="text-sm font-bold text-purple-600">{commentRate}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div className="h-2 bg-purple-500 rounded" style={{width: `${Math.min(100, commentRate * 5)}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold mb-4">Informations</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Réservations</span>
                <span className="font-medium">{promo.reservations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expire dans</span>
                <span className="font-medium">{promo.expiresIn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  promo.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {promo.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
