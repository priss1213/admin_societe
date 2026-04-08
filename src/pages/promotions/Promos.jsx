import React, { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import PromoCard from '../../components/ui/PromoCard'

export default function Promos() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { promos, togglePromo, subscription, categories } = useApp()
  const [filter, setFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [view, setView] = useState('grid')
  const query = (searchParams.get('q') || '').toLowerCase()

  const filtered = useMemo(() => {
    let set = promos.slice()
    if (filter === 'active') set = set.filter((p) => p.active)
    if (filter === 'coming') set = set.filter((p) => p.active === false && p.reservations === 0)
    if (filter === 'paused') set = set.filter((p) => p.active === false && p.reservations > 0)
    if (filter === 'finished') set = set.filter((p) => p.status === 'finished' || p.status === 'ended')
    if (categoryFilter && categoryFilter !== 'all') set = set.filter((p) => p.category === categoryFilter)
    if (query) set = set.filter((p) => `${p.title} ${p.description} ${p.category}`.toLowerCase().includes(query))
    return set
  }, [promos, filter, categoryFilter, query])

  const used = promos.filter((p) => p.active).length
  const quotaTotal = subscription?.promoQuota

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Mes promotions</h2>
          <div className="text-sm text-gray-500">Quota : {used} / {quotaTotal} promos utilisées</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border rounded p-1">
            <button onClick={() => setView('list')} className={`px-2 py-1 ${view === 'list' ? 'bg-gray-200' : ''}`}>Liste</button>
            <button onClick={() => setView('grid')} className={`px-2 py-1 ${view === 'grid' ? 'bg-gray-200' : ''}`}>Grille</button>
          </div>
          <button onClick={() => navigate('/promos/new')} className="px-4 py-2 bg-orange-600 text-white rounded">+ Nouvelle promo</button>
        </div>
      </div>

      <div className="bg-green-700 text-white rounded p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="font-medium">
            {quotaTotal == null ? `${used} promos actives — Plan ${subscription?.plan}` : `${used}/${quotaTotal} promos actives — Plan ${subscription?.plan}`}
          </div>
          <button onClick={() => navigate('/subscription')} className="ml-2 px-3 py-1 bg-white text-green-700 rounded">Voir mon abonnement ↗</button>
        </div>
        <div className="w-64 bg-green-600/30 h-2 rounded relative">
          <div style={{ width: `${quotaTotal == null ? 100 : Math.min(100, (used / Math.max(1, quotaTotal)) * 100)}%` }} className="h-2 bg-white rounded"></div>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter==='all'?'bg-gray-100':''}`}>Toutes ({promos.length})</button>
        <button onClick={() => setFilter('active')} className={`px-3 py-1 rounded ${filter==='active'?'bg-gray-100':''}`}>Actives ({promos.filter(p=>p.active).length})</button>
        <button onClick={() => setFilter('coming')} className={`px-3 py-1 rounded ${filter==='coming'?'bg-gray-100':''}`}>À venir ({promos.filter(p=>!p.active && p.reservations===0).length})</button>
        <button onClick={() => setFilter('paused')} className={`px-3 py-1 rounded ${filter==='paused'?'bg-gray-100':''}`}>En pause ({promos.filter(p=>!p.active && p.reservations>0).length})</button>
        <button onClick={() => setFilter('finished')} className={`px-3 py-1 rounded ${filter==='finished'?'bg-gray-100':''}`}>Terminées ({promos.filter(p=>p.status==='finished').length})</button>

        <div className="ml-auto">
          <label className="mr-2 text-sm text-gray-600">Toutes catégories</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border rounded px-2 py-1">
            <option value="all">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PromoCard key={p.id} promo={p} onEdit={() => {}} onToggle={togglePromo} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white p-3 rounded shadow-sm flex justify-between">
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-gray-500">{p.category} · {p.views} vues · {p.reservations} réservations</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded ${p.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{p.active? 'Active' : 'Inactive'}</div>
                <button onClick={() => navigate(`/analytics/promo/${p.id}`)} className="px-2 py-1 border rounded">Stats</button>
                <button onClick={() => togglePromo(p.id)} className="px-2 py-1 border rounded">{p.active? 'Pause' : 'Activer'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
