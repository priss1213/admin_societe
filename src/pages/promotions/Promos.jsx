import React, { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  EyeIcon, HeartIcon, TicketIcon, ChartPieIcon,
  Squares2X2Icon, TableCellsIcon, PlusIcon, SparklesIcon,
  ChartBarIcon, PauseCircleIcon, PlayIcon,
} from '@heroicons/react/24/outline'
import { useApp } from '../../context/AppContext'
import PromoCard from '../../components/ui/PromoCard'
import KpiCard from '../../components/ui/KpiCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

export default function Promos() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { promos, togglePromo, subscription, categories, companyProfile } = useApp()
  const isPharmacy = (companyProfile?.category || '').toLowerCase().includes('pharm')
  const hasServiceSpace = companyProfile?.companyType === 'service' || companyProfile?.companyType === 'both' || isPharmacy
  const isServiceOnly = hasServiceSpace && companyProfile?.companyType !== 'both'
  const [filter, setFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [view, setView] = useState('tableau')
  const query = (searchParams.get('q') || '').toLowerCase()

  const filtered = useMemo(() => {
    let set = promos.slice()
    if (filter === 'active')   set = set.filter((p) => p.active)
    if (filter === 'draft')    set = set.filter((p) => p.status === 'draft')
    if (filter === 'coming')   set = set.filter((p) => p.status === 'planned')
    if (filter === 'paused')   set = set.filter((p) => p.active === false && p.reservations > 0)
    if (filter === 'finished') set = set.filter((p) => p.status === 'finished' || p.status === 'ended')
    if (categoryFilter && categoryFilter !== 'all') set = set.filter((p) => p.category === categoryFilter)
    if (query) set = set.filter((p) => `${p.title} ${p.description} ${p.category}`.toLowerCase().includes(query))
    return set
  }, [promos, filter, categoryFilter, query])

  const used = promos.filter((p) => p.active).length
  const quotaTotal = subscription?.promoQuota
  const quotaPercent = quotaTotal ? Math.min(100, Math.round((used / quotaTotal) * 100)) : 0
  const quotaBar = quotaPercent >= 90 ? 'bg-rose-500' : quotaPercent >= 70 ? 'bg-amber-500' : 'bg-gold-400'

  const totals = useMemo(() => ({
    vues: promos.reduce((s, p) => s + (p.views || 0), 0),
    aimes: promos.reduce((s, p) => s + (p.likes || 0), 0),
    reservations: promos.reduce((s, p) => s + (p.reservations || 0), 0),
    engagement: promos.length
      ? Math.round((promos.reduce((s, p) => s + (p.likes || 0) + (p.reservations || 0), 0) / Math.max(1, promos.reduce((s, p) => s + (p.views || 0), 0))) * 100)
      : 0,
  }), [promos])

  const draftCount    = promos.filter(p => p.status === 'draft').length
  const plannedCount  = promos.filter(p => p.status === 'planned').length
  const pausedCount   = promos.filter(p => !p.active && p.reservations > 0).length
  const finishedCount = promos.filter(p => p.status === 'finished' || p.status === 'ended').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Mes promotions</h1>
          <p className="text-sm text-ink-500 mt-1">
            Quota : <span className="font-medium text-ink-700">{used}</span> / {quotaTotal ?? '∞'} promos actives
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-white border border-ink-200 rounded-lg p-0.5 shadow-card">
            <button
              onClick={() => setView('tableau')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${view === 'tableau' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900'}`}
            >
              <TableCellsIcon className="w-4 h-4" /> Tableau
            </button>
            <button
              onClick={() => setView('grid')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${view === 'grid' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900'}`}
            >
              <Squares2X2Icon className="w-4 h-4" /> Grille
            </button>
          </div>
          {!isServiceOnly && (
            <Button variant="gold" onClick={() => navigate('/promos/new')}>
              <PlusIcon className="w-4 h-4" />
              Nouvelle promo
            </Button>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Vues totales" value={totals.vues.toLocaleString('fr-FR')} hint={`${used} promos actives`} icon={<EyeIcon className="w-5 h-5" />} accent="blue" />
        <KpiCard label="Aimes totaux" value={totals.aimes.toLocaleString('fr-FR')} hint="favoris mobile" icon={<HeartIcon className="w-5 h-5" />} accent="red" />
        <KpiCard label="Réservations" value={totals.reservations.toLocaleString('fr-FR')} hint="total cumulé" icon={<TicketIcon className="w-5 h-5" />} accent="green" />
        <KpiCard label="Engagement" value={`${totals.engagement}%`} hint="(aimes + rés.) / vues" icon={<ChartPieIcon className="w-5 h-5" />} accent="purple" />
      </div>

      {/* Bandeau quota premium */}
      <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 text-white">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-gold-500/15 blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-500 text-ink-950 flex items-center justify-center shadow-sm">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-ink-300 uppercase tracking-wide font-semibold">Plan {subscription?.plan}</div>
              <div className="text-base font-semibold mt-0.5">
                {quotaTotal == null ? `${used} promos actives` : `${used} / ${quotaTotal} promos actives`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${quotaBar}`}
                style={{ width: `${quotaTotal == null ? 100 : quotaPercent}%` }}
              />
            </div>
            <button onClick={() => navigate('/subscription')}
                    className="text-xs font-medium text-gold-300 hover:text-gold-200 whitespace-nowrap">
              Voir mon abonnement →
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-3 flex gap-2 items-center flex-wrap">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} count={promos.length}>
          Toutes
        </FilterChip>
        <FilterChip active={filter === 'active'} onClick={() => setFilter('active')} count={used} tone="success">
          Actives
        </FilterChip>
        <FilterChip active={filter === 'draft'} onClick={() => setFilter('draft')} count={draftCount} tone="neutral">
          Brouillons
        </FilterChip>
        <FilterChip active={filter === 'coming'} onClick={() => setFilter('coming')} count={plannedCount} tone="info">
          À venir
        </FilterChip>
        <FilterChip active={filter === 'paused'} onClick={() => setFilter('paused')} count={pausedCount} tone="warning">
          En pause
        </FilterChip>
        <FilterChip active={filter === 'finished'} onClick={() => setFilter('finished')} count={finishedCount} tone="neutral">
          Terminées
        </FilterChip>
        <div className="ml-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input text-xs py-1.5 w-auto"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => {
              const name = typeof c === 'object' ? c.name : c
              return <option key={name} value={name}>{name}</option>
            })}
          </select>
        </div>
      </div>

      {/* Content */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <PromoCard key={p.id} promo={p} onToggle={togglePromo} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full card py-12 text-center text-ink-400 text-sm">
              Aucune promotion trouvée.
            </div>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-50/60 text-[11px] text-ink-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-semibold">Titre</th>
                  <th className="px-4 py-3 text-left font-semibold">Catégorie</th>
                  <th className="px-4 py-3 text-left font-semibold">Statut</th>
                  <th className="px-4 py-3 text-right font-semibold">Vues</th>
                  <th className="px-4 py-3 text-right font-semibold">Aimes</th>
                  <th className="px-4 py-3 text-right font-semibold">Rés.</th>
                  <th className="px-4 py-3 text-right font-semibold">Taux</th>
                  <th className="px-4 py-3 text-left font-semibold">Expiration</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-ink-400">Aucune promotion trouvée</td></tr>
                ) : filtered.map((p) => (
                  <tr key={p.id} className="border-t border-ink-100 hover:bg-ink-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink-900 flex items-center gap-2">
                        {p.title}
                        {p.featured && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gold-50 text-gold-700 ring-1 ring-gold-200">
                            <SparklesIcon className="w-3 h-3" /> Vedette
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{p.category}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          p.active ? 'success'
                          : p.status === 'draft' ? 'neutral'
                          : p.status === 'planned' ? 'info'
                          : 'warning'
                        }
                        dot
                      >
                        {p.active ? 'Active'
                          : p.status === 'draft' ? 'Brouillon'
                          : p.status === 'planned' ? 'Planifié'
                          : p.status || 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sky-700 font-semibold tabular-nums">{(p.views || 0).toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right font-mono text-rose-600 font-semibold tabular-nums">{(p.likes || 0).toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-700 font-semibold tabular-nums">{(p.reservations || 0).toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right text-ink-500 tabular-nums">{p.clickRate || '—'}</td>
                    <td className="px-4 py-3 text-ink-500 text-xs">{p.expiresIn || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => navigate(`/analytics/promo/${p.id}`)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-colors"
                          title="Statistiques"
                        >
                          <ChartBarIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => togglePromo(p.id)}
                          className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                            p.active
                              ? 'text-amber-700 hover:bg-amber-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={p.active ? 'Pause' : 'Activer'}
                        >
                          {p.active ? <PauseCircleIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterChip({ active, onClick, count, children, tone = 'gold' }) {
  const activeStyles = {
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    info:    'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
    warning: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200',
    neutral: 'bg-ink-100 text-ink-800 ring-1 ring-inset ring-ink-200',
    gold:    'bg-gold-50 text-gold-700 ring-1 ring-inset ring-gold-200',
  }
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active ? (activeStyles[tone] || activeStyles.gold) : 'text-ink-600 hover:bg-ink-100'
      }`}
    >
      <span>{children}</span>
      <span className={`tabular-nums ${active ? '' : 'text-ink-400'}`}>({count})</span>
    </button>
  )
}
