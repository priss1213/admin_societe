import React, { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export default function Topbar() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const { companyProfile, subscription } = useApp()

  // Détection du type de société (harmonisé avec Dashboard.jsx)
  const isPharmacy = (companyProfile?.category || '').toLowerCase().includes('pharm')
  const hasServiceSpace = companyProfile?.companyType === 'service' || companyProfile?.companyType === 'both' || isPharmacy
  const isServiceOnly = hasServiceSpace && companyProfile?.companyType !== 'both'

  function submitSearch(e) {
    e?.preventDefault()
    navigate(`/promos${q ? `?q=${encodeURIComponent(q)}` : ''}`)
  }

  // Libellé de la barre selon le type
  const subtitle = isPharmacy
    ? 'Gestion de la pharmacie et des gardes'
    : isServiceOnly
      ? 'Gestion du service et des réservations'
      : 'Gestion des promotions et réservations'

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold">{companyProfile?.name || 'Tableau de bord'}</h1>
        <div className="text-sm text-gray-500">Plan {subscription.plan} · {subtitle}</div>
      </div>

      <div className="flex items-center gap-3">
        {/* Barre de recherche uniquement pour les commerces avec promos */}
        {!isServiceOnly && (
          <form onSubmit={submitSearch} className="flex items-center gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une promotion..." className="px-3 py-2 rounded border" />
            <button type="submit" className="flex items-center gap-2 px-3 py-2 bg-white border rounded shadow-sm">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Rechercher</span>
            </button>
          </form>
        )}

        {/* Bouton d'action principal selon le type de société */}
        {isPharmacy ? null : isServiceOnly ? (
          <button onClick={() => navigate('/service')} className="px-4 py-2 bg-purple-600 text-white rounded font-medium">
            🔧 Mon service
          </button>
        ) : (
          <button onClick={() => navigate('/promos/new')} className="px-4 py-2 bg-blue-600 text-white rounded font-medium">
            + Nouvelle promo
          </button>
        )}
      </div>
    </div>
  )
}
