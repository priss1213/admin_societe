import React, { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export default function Topbar() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const { companyProfile, subscription } = useApp()

  function submitSearch(e) {
    e?.preventDefault()
    navigate(`/promos${q ? `?q=${encodeURIComponent(q)}` : ''}`)
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold">{companyProfile?.name || 'Tableau de bord'}</h1>
        <div className="text-sm text-gray-500">Plan {subscription.plan} · Gestion des promotions et réservations</div>
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une promotion..." className="px-3 py-2 rounded border" />
          <button type="submit" className="flex items-center gap-2 px-3 py-2 bg-white border rounded shadow-sm">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Rechercher</span>
          </button>
        </form>
        <button onClick={() => navigate('/promos/new')} className="px-4 py-2 bg-blue-600 text-white rounded font-medium">+ Nouvelle promo</button>
      </div>
    </div>
  )
}
