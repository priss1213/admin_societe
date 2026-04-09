import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { ChatBubbleLeftIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Reviews() {
  const { promos } = useApp()
  const { token } = useAuth()
  const [selectedPromoId, setSelectedPromoId] = useState(promos[0]?.id || null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const currentPromo = useMemo(() => promos.find((p) => p.id === selectedPromoId), [promos, selectedPromoId])

  const loadComments = useCallback(async () => {
    if (!selectedPromoId) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/promos/${selectedPromoId}/comments`)
      if (res.ok) {
        const body = await res.json()
        setComments(body.data || [])
      }
    } catch (_) {
    } finally {
      setLoading(false)
    }
  }, [selectedPromoId])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  async function handleDelete(commentId) {
    if (!window.confirm('Supprimer ce commentaire ?')) return
    setDeleting(commentId)
    try {
      const res = await fetch(`${API_URL}/api/promos/${selectedPromoId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
      }
    } catch (_) {
    } finally {
      setDeleting(null)
    }
  }

  function formatDate(iso) {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch (_) { return iso }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Commentaires clients</h1>

      {/* Sélecteur de promo */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium mb-2">Promotion</label>
        <select
          value={selectedPromoId || ''}
          onChange={(e) => setSelectedPromoId(e.target.value)}
          className="w-full border rounded px-4 py-2 text-sm"
        >
          {promos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} — {p.comments} commentaire{p.comments !== 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      {currentPromo && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">👁️ Vues</div>
            <div className="text-2xl font-bold text-blue-600">{currentPromo.views || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">❤️ Aimes</div>
            <div className="text-2xl font-bold text-red-500">{currentPromo.likes || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">💬 Commentaires</div>
            <div className="text-2xl font-bold text-purple-600">{comments.length}</div>
          </div>
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Commentaires ({comments.length})</h2>
          {loading && <span className="text-xs text-gray-400">Chargement…</span>}
        </div>

        {!loading && comments.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <ChatBubbleLeftIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucun commentaire pour cette promotion.</p>
          </div>
        )}

        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-3 p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {(c.author_name || 'A')[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{c.author_name || 'Anonyme'}</span>
                  <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 ml-9">{c.text}</p>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deleting === c.id}
                className="shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Supprimer"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
