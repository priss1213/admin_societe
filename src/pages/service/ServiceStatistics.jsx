import React, { useCallback, useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function apiFetch(path, options = {}) {
  const token = localStorage.getItem('societe_token')
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  }).then(async r => {
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data.detail || `Erreur ${r.status}`)
    return data
  })
}

function StatCard({ emoji, label, value, hint }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-gray-600">{label}</div>
        <div className="text-xl">{emoji}</div>
      </div>
      <div className="text-3xl font-extrabold text-gray-900">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  )
}

export default function ServiceStatistics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    apiFetch('/api/services/me/stats')
      .then(r => {
        setStats(r.data ?? r)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="min-h-[260px] flex items-center justify-center text-gray-500">
        Chargement des statistiques service...
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
        {error}
      </div>
    )
  }

  if (!stats) return null

  const views = stats.views_count ?? 0
  const contacts = stats.contacts_count ?? 0
  const rating = stats.rating > 0 ? stats.rating.toFixed(1) : '—'
  const conversion = views > 0 ? `${Math.round((contacts / views) * 100)}%` : '0%'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Statistiques Service</h1>
          <p className="text-sm text-gray-500 mt-1">
            Performance de votre fiche prestataire visible dans l'application mobile.
          </p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
        >
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard emoji="👁️" label="Vues du profil" value={views} hint="Nombre de visites de votre fiche" />
        <StatCard emoji="📞" label="Contacts reçus" value={contacts} hint="Actions de contact effectuées" />
        <StatCard emoji="⭐" label="Note moyenne" value={rating} hint="Note affichée aux clients" />
        <StatCard emoji="📈" label="Taux contact / vue" value={conversion} hint="Indicateur de conversion" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-base font-bold text-gray-900 mb-2">Informations visibles sur mobile</h2>
        <p className="text-sm text-gray-600">
          Ces statistiques apparaissent sur la fiche prestataire de l'application mobile et sont mises à jour via le backend.
        </p>
      </div>
    </div>
  )
}
