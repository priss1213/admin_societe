import React, { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { StarIcon, ShoppingCartIcon, HeartIcon, ChatBubbleLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function Reviews() {
  const { promos } = useApp()
  const [selectedPromo, setSelectedPromo] = useState(promos[0]?.id || null)
  const [filterRating, setFilterRating] = useState('all') // all, 5, 4, 3, 2, 1
  const [sortBy, setSortBy] = useState('recent') // recent, helpful

  const currentPromo = useMemo(() => {
    return promos.find((p) => p.id === selectedPromo)
  }, [promos, selectedPromo])

  // Filter comments
  const filteredComments = useMemo(() => {
    if (!currentPromo?.customer_comments) return []

    let filtered = [...currentPromo.customer_comments]

    if (filterRating !== 'all') {
      filtered = filtered.filter((c) => c.rating === parseInt(filterRating))
    }

    if (sortBy === 'helpful') {
      filtered.sort((a, b) => b.likes - a.likes)
    } else {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
    }

    return filtered
  }, [currentPromo, filterRating, sortBy])

  // Calculate stats
  const stats = useMemo(() => {
    if (!currentPromo) return {}

    const comments = currentPromo.customer_comments || []
    const avgRating = comments.length ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1) : 0
    const ratingDistribution = {
      5: comments.filter((c) => c.rating === 5).length,
      4: comments.filter((c) => c.rating === 4).length,
      3: comments.filter((c) => c.rating === 3).length,
      2: comments.filter((c) => c.rating === 2).length,
      1: comments.filter((c) => c.rating === 1).length,
    }

    return {
      sold: currentPromo.sold || 0,
      reserved: currentPromo.reserved_count || 0,
      total_interactions: (currentPromo.sold || 0) + (currentPromo.reserved_count || 0),
      avgRating,
      totalComments: comments.length,
      ratingDistribution,
    }
  }, [currentPromo])

  // Star rating component
  const StarRating = ({ rating, size = 'sm' }) => {
    const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
    const colorClass = rating >= 4 ? 'text-yellow-400' : rating >= 3 ? 'text-yellow-300' : 'text-gray-300'

    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`${sizeClass} ${i < rating ? colorClass : 'text-gray-300'}`}
            fill={i < rating ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Commentaires & Feedback</h1>

      {/* Product selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium mb-2">Sélectionnez un produit</label>
        <select
          value={selectedPromo}
          onChange={(e) => setSelectedPromo(e.target.value)}
          className="w-full border rounded px-4 py-2 text-lg font-medium"
        >
          {promos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {currentPromo && (
        <>
          {/* Product Performance Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Vendus</span>
                <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600">{stats.sold}</div>
              <p className="text-xs text-gray-500 mt-2">Nombre de produits vendus</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Réservés</span>
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600">{stats.reserved}</div>
              <p className="text-xs text-gray-500 mt-2">Nombre de réservations</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Note moyenne</span>
                <StarIcon className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-yellow-500">{stats.avgRating}</div>
              <p className="text-xs text-gray-500 mt-2">{stats.totalComments} avis</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total interactions</span>
                <HeartIcon className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-red-600">{stats.total_interactions}</div>
              <p className="text-xs text-gray-500 mt-2">Ventes + Réservations</p>
            </div>
          </div>

          {/* Rating distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Distribution des avis</h2>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = stats.ratingDistribution?.[stars] || 0
                const percentage = stats.totalComments ? (count / stats.totalComments) * 100 : 0
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-24">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${i < stars ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill={i < stars ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <div className="flex-1 bg-gray-200 h-6 rounded relative overflow-hidden">
                      <div className="bg-yellow-400 h-6 rounded flex items-center justify-end pr-2" style={{width: `${percentage}%`, minWidth: '40px'}}>
                        <span className="text-xs text-white font-semibold">{count}</span>
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm font-medium">{percentage.toFixed(0)}%</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Filters and sort */}
          <div className="flex items-center justify-between gap-4 bg-white rounded-lg shadow p-4">
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-700">Filtrer par note:</span>
              <button
                onClick={() => setFilterRating('all')}
                className={`px-3 py-1 rounded text-sm ${filterRating === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
              >
                Tous ({stats.totalComments})
              </button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(String(rating))}
                  className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                    filterRating === String(rating) ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                  }`}
                >
                  {rating}★ ({stats.ratingDistribution?.[rating] || 0})
                </button>
              ))}
            </div>

            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setSortBy('recent')}
                className={`px-3 py-1 rounded text-sm ${sortBy === 'recent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
              >
                Récents
              </button>
              <button
                onClick={() => setSortBy('helpful')}
                className={`px-3 py-1 rounded text-sm ${sortBy === 'helpful' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
              >
                Utiles
              </button>
            </div>
          </div>

          {/* Comments list */}
          <div className="space-y-4">
            {filteredComments.length > 0 ? (
              filteredComments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-400">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold">{comment.author}</p>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {new Date(comment.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <StarRating rating={comment.rating} size="sm" />
                    </div>
                    <div className="text-right">
                      {comment.status === 'approved' && (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          Approuvé
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 my-3">{comment.text}</p>

                  <div className="flex items-center gap-4 pt-3 border-t">
                    <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 text-sm">
                      <HeartIcon className="w-4 h-4" />
                      <span>{comment.likes}</span>
                    </button>
                    <button className="text-gray-500 hover:text-blue-500 text-sm">Répondre</button>
                    <button className="text-gray-500 hover:text-yellow-500 text-sm ml-auto">Signaler</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">Aucun avis avec ce filtre</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
