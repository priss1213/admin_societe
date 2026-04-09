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
  const [view, setView] = useState('tableau')
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

  const totals = useMemo(() => ({
    vues: promos.reduce((s, p) => s + (p.views || 0), 0),
    aimes: promos.reduce((s, p) => s + (p.likes || 0), 0),
    reservations: promos.reduce((s, p) => s + (p.reservations || 0), 0),
    engagement: promos.length
      ? Math.round((promos.reduce((s, p) => s + (p.likes || 0) + (p.reservations || 0), 0) / Math.max(1, promos.reduce((s, p) => s + (p.views || 0), 0))) * 100)
      : 0,
  }), [promos])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Mes promotions</h2>
          <div className="text-sm text-gray-500">Quota : {used} / {quotaTotal ?? '∞'} promos utilisées</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border rounded p-1">
            <button onClick={() => setView('tableau')} className={`px-2 py-1 text-sm rounded ${view === 'tableau' ? 'bg-gray-200 font-medium' : ''}`}>Tableau</button>
            <button onClick={() => setView('grid')} className={`px-2 py-1 text-sm rounded ${view === 'grid' ? 'bg-gray-200 font-medium' : ''}`}>Grille</button>
          </div>
          <button onClick={() => navigate('/promos/new')} className="px-4 py-2 bg-orange-600 text-white rounded">+ Nouvelle promo</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">👁️ Vues totales</div>
          <div className="text-2xl font-bold text-blue-600">{totals.vues.toLocaleString('fr-FR')}</div>
          <div className="text-xs text-gray-400 mt-1">{promos.filter(p => p.active).length} promos actives</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">❤️ Aimes totaux</div>
          <div className="text-2xl font-bold text-red-500">{totals.aimes.toLocaleString('fr-FR')}</div>
          <div className="text-xs text-gray-400 mt-1">favoris mobile</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">🛒 Réservations</div>
          <div className="text-2xl font-bold text-green-600">{totals.reservations.toLocaleString('fr-FR')}</div>
          <div className="text-xs text-gray-400 mt-1">total cumulé</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">📊 Taux engagement</div>
          <div className="text-2xl font-bold text-purple-600">{totals.engagement}%</div>
          <div className="text-xs text-gray-400 mt-1">(aimes + réservations) / vues</div>
        </div>
      </div>

      {/* Quota bar */}
      <div className="bg-green-700 text-white rounded p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="font-medium">
            {quotaTotal == null ? `${used} promos actives — Plan ${subscription?.plan}` : `${used}/${quotaTotal} promos actives — Plan ${subscription?.plan}`}
          </div>
          <button onClick={() => navigate('/subscription')} className="ml-2 px-3 py-1 bg-white text-green-700 rounded text-sm">Voir mon abonnement ↗</button>
        </div>
        <div className="w-64 bg-green-600/30 h-2 rounded">
          <div style={{ width: `${quotaTotal == null ? 100 : Math.min(100, (used / Math.max(1, quotaTotal)) * 100)}%` }} className="h-2 bg-white rounded" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded text-sm ${filter==='all'?'bg-orange-100 text-orange-700 font-medium':'bg-gray-100'}`}>Toutes ({promos.length})</button>
        <button onClick={() => setFilter('active')} className={`px-3 py-1 rounded text-sm ${filter==='active'?'bg-green-100 text-green-700 font-medium':'bg-gray-100'}`}>Actives ({promos.filter(p=>p.active).length})</button>
        <button onClick={() => setFilter('coming')} className={`px-3 py-1 rounded text-sm ${filter==='coming'?'bg-blue-100 text-blue-700 font-medium':'bg-gray-100'}`}>À venir ({promos.filter(p=>!p.active && p.reservations===0).length})</button>
        <button onClick={() => setFilter('paused')} className={`px-3 py-1 rounded text-sm ${filter==='paused'?'bg-yellow-100 text-yellow-700 font-medium':'bg-gray-100'}`}>En pause ({promos.filter(p=>!p.active && p.reservations>0).length})</button>
        <button onClick={() => setFilter('finished')} className={`px-3 py-1 rounded text-sm ${filter==='finished'?'bg-gray-200 font-medium':'bg-gray-100'}`}>Terminées ({promos.filter(p=>p.status==='finished').length})</button>
        <div className="ml-auto">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
            <option value="all">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {view === 'grid' ? (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PromoCard key={p.id} promo={p} onEdit={() => {}} onToggle={togglePromo} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-400">Aucune promotion trouvée</div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Titre</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Catégorie</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Statut</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">👁️ Vues</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">❤️ Aimes</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">🛒 Réservations</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">📊 Taux clics</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Expiration</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">Aucune promotion trouvée</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.title}</div>
                    {p.featured && <span className="text-xs text-orange-600">⭐ Vedette</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.active ? 'Active' : p.status || 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-blue-600 font-semibold">{(p.views || 0).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3 text-right font-mono text-red-500 font-semibold">{(p.likes || 0).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3 text-right font-mono text-green-600 font-semibold">{(p.reservations || 0).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{p.clickRate || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.expiresIn || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => navigate(`/analytics/promo/${p.id}`)} className="px-2 py-1 border rounded text-xs hover:bg-gray-100" title="Statistiques détaillées">📊</button>
                      <button onClick={() => togglePromo(p.id)} className={`px-2 py-1 border rounded text-xs hover:bg-gray-100 ${p.active ? 'text-yellow-700' : 'text-green-700'}`}>
                        {p.active ? '⏸ Pause' : '▶ Activer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
