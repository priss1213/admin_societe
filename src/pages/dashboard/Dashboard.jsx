import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  EyeIcon, HeartIcon, TicketIcon, CheckBadgeIcon,
  PhoneIcon, StarIcon, ArrowTrendingUpIcon, ClockIcon,
  ArrowPathIcon, ChevronRightIcon, SparklesIcon,
} from '@heroicons/react/24/outline'
import KpiCard from '../../components/ui/KpiCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useApp } from '../../context/AppContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function fetchServiceStats() {
  const token =
    localStorage.getItem('societe_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('societe_token') ||
    sessionStorage.getItem('token')
  return fetch(`${API_URL}/api/services/me/stats`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  }).then(async (r) => {
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data.detail || `Erreur ${r.status}`)
    return data.data ?? data
  })
}

function StatusBadge({ status }) {
  const map = {
    confirmed: { label: 'Validée', variant: 'success' },
    expired:   { label: 'Expirée', variant: 'danger' },
    pending:   { label: 'En attente', variant: 'warning' },
    cancelled: { label: 'Annulée', variant: 'danger' },
  }
  const cfg = map[status] ?? { label: status || '—', variant: 'neutral' }
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
}

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    promos, reservations, subscription, companyProfile,
    reservationQuota, loadReservationQuota,
  } = useApp()
  const isPharmacy = (companyProfile?.category || '').toLowerCase().includes('pharm')
  const hasServiceSpace = companyProfile?.companyType === 'service' || companyProfile?.companyType === 'both' || isPharmacy
  const isServiceOnlyCompany = hasServiceSpace && companyProfile?.companyType !== 'both'

  const [serviceStats, setServiceStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const loadStats = useCallback(() => {
    if (!isServiceOnlyCompany) return
    setStatsLoading(true)
    fetchServiceStats()
      .then((data) => setServiceStats(data))
      .catch(() => setServiceStats(null))
      .finally(() => setStatsLoading(false))
  }, [isServiceOnlyCompany])

  useEffect(() => { loadReservationQuota() }, [loadReservationQuota])
  useEffect(() => { loadStats() }, [loadStats])

  const activeCount = promos.filter((p) => p.active).length
  const views = promos.reduce((s, p) => s + (p.views || 0), 0)
  const likes = promos.reduce((s, p) => s + (p.likes || 0), 0)
  const confirmedReservations = reservations.filter((r) => r.status === 'confirmed')
  const pendingCount = reservations.filter((r) => r.status === 'pending').length
  const totalCommission = confirmedReservations.reduce(
    (s, r) => s + Number(r.commissionAmount || 0), 0
  )
  const quotaTotal = subscription?.promoQuota ?? null

  const resUsed = reservationQuota.used ?? reservations.length
  const resQuota = reservationQuota.quota
  const resRemaining = reservationQuota.remaining

  const formatMoney = (n) => `${Math.round(n).toLocaleString('fr-FR')} F`
  const recentPromos = promos.slice(0, 4)

  const resPercent = resQuota ? Math.min(100, Math.round((resUsed / resQuota) * 100)) : 0
  const resBar = resPercent >= 90 ? 'bg-rose-500' : resPercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'

  const fmtDate = (ts) => ts ? new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'
  const fmtTime = (ts) => ts ? new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'

  const sviews = serviceStats?.views_count ?? 0
  const scontacts = serviceStats?.contacts_count ?? 0
  const srating = serviceStats?.rating > 0 ? serviceStats.rating.toFixed(1) : '—'
  const sconversion = sviews > 0 ? `${Math.round((scontacts / sviews) * 100)}%` : '0%'

  return (
    <div className="space-y-6">
      {/* Header de page */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-ink-900 flex items-center gap-2">
            {isPharmacy ? '⚕' : isServiceOnlyCompany ? '🔧' : <SparklesIcon className="w-5 h-5 text-gold-500" />}
            Vue d'ensemble
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            {companyProfile?.name || 'Ma société'} · {isPharmacy ? 'Pharmacie' : isServiceOnlyCompany ? 'Prestataire de service' : 'Commerce'} · {subscription.currentPeriodLabel}
          </p>
        </div>
        {isServiceOnlyCompany && (
          <Button variant="outline" size="sm" onClick={loadStats}>
            <ArrowPathIcon className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        )}
      </div>

      {/* KPI cards */}
      {isServiceOnlyCompany ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Vues du profil" value={sviews} hint="visites de votre fiche mobile" icon={<EyeIcon className="w-5 h-5" />} accent="blue" loading={statsLoading} />
          <KpiCard label="Contacts reçus" value={scontacts} hint="actions de contact" icon={<PhoneIcon className="w-5 h-5" />} accent="gold" loading={statsLoading} />
          <KpiCard label="Note moyenne" value={srating} hint="évaluation clients" icon={<StarIcon className="w-5 h-5" />} accent="green" loading={statsLoading} />
          <KpiCard label="Taux conversion" value={sconversion} hint="contacts / vues" icon={<ArrowTrendingUpIcon className="w-5 h-5" />} accent="purple" loading={statsLoading} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Promos actives" value={activeCount} hint={quotaTotal ? `sur ${quotaTotal} maximum` : 'aucune limite'} icon={<TicketIcon className="w-5 h-5" />} accent="gold" />
          <KpiCard label="Vues totales" value={views.toLocaleString('fr-FR')} hint="toutes promotions" icon={<EyeIcon className="w-5 h-5" />} accent="blue" />
          <KpiCard label="Aimés" value={likes.toLocaleString('fr-FR')} hint="favoris mobile" icon={<HeartIcon className="w-5 h-5" />} accent="red" />
          <KpiCard label="Réservations" value={reservations.length.toLocaleString('fr-FR')} hint={`${confirmedReservations.length} validées`} icon={<CheckBadgeIcon className="w-5 h-5" />} accent="green" />
        </div>
      )}

      {/* Alertes */}
      {subscription.alerts?.length > 0 && (
        <div className="grid gap-3">
          {subscription.alerts.map((alert) => (
            <div
              key={alert.title}
              className={`card p-4 flex items-start gap-3 border-l-4 ${
                alert.level === 'danger'
                  ? 'border-l-rose-500 bg-rose-50/50'
                  : 'border-l-amber-500 bg-amber-50/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${alert.level === 'danger' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                ⚠
              </div>
              <div className="min-w-0">
                <div className={`font-semibold text-sm ${alert.level === 'danger' ? 'text-rose-800' : 'text-amber-800'}`}>{alert.title}</div>
                <div className={`text-sm ${alert.level === 'danger' ? 'text-rose-700' : 'text-amber-700'}`}>{alert.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bandeau attente / validées / commissions (commerce) */}
      {!isServiceOnlyCompany && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5 flex items-center justify-between hover:shadow-card-hover transition-shadow">
            <div>
              <div className="flex items-center gap-2 text-amber-700">
                <ClockIcon className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">En attente</span>
              </div>
              <div className="text-2xl font-bold text-ink-900 mt-2 tabular-nums">{pendingCount}</div>
              <button onClick={() => navigate('/reservations')}
                      className="mt-1 text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1">
                Valider maintenant <ChevronRightIcon className="w-3 h-3" />
              </button>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center ring-1 ring-amber-100">
              <ClockIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="card p-5 flex items-center justify-between hover:shadow-card-hover transition-shadow">
            <div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckBadgeIcon className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Validées ce mois</span>
              </div>
              <div className="text-2xl font-bold text-ink-900 mt-2 tabular-nums">{confirmedReservations.length}</div>
              <div className="mt-1 text-xs text-ink-400">réservations confirmées</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-100">
              <CheckBadgeIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="card p-5 flex items-center justify-between hover:shadow-card-hover transition-shadow relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-50/40 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 text-gold-700">
                <SparklesIcon className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Commissions</span>
              </div>
              <div className="text-2xl font-bold text-ink-900 mt-2 tabular-nums">{formatMoney(totalCommission)}</div>
              <div className="mt-1 text-xs text-ink-400">sur réservations validées</div>
            </div>
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-gold-100 to-gold-200 text-gold-700 flex items-center justify-center ring-1 ring-gold-200">
              <span className="text-xl font-bold">F</span>
            </div>
          </div>
        </div>
      )}

      {/* Quota (commerce) */}
      {!isServiceOnlyCompany && (
        <div className="card p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 font-semibold text-sm text-ink-900">
                <TicketIcon className="w-4 h-4 text-gold-600" />
                Quota réservations ce mois
              </div>
              <div className="text-xs text-ink-500 mt-0.5">Plan <span className="font-medium text-gold-600">{reservationQuota.plan}</span></div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-ink-900 tabular-nums">
                {resUsed}<span className="text-base font-normal text-ink-400">{resQuota !== null ? ` / ${resQuota}` : ' / ∞'}</span>
              </div>
              {resRemaining !== null && (
                <Badge
                  variant={resRemaining === 0 ? 'danger' : resRemaining <= 10 ? 'warning' : 'success'}
                  dot
                  className="mt-1"
                >
                  {resRemaining === 0 ? 'Quota atteint' : `${resRemaining} restante${resRemaining > 1 ? 's' : ''}`}
                </Badge>
              )}
            </div>
          </div>
          {resQuota !== null && (
            <div className="w-full bg-ink-100 rounded-full h-2 overflow-hidden">
              <div className={`h-2 rounded-full transition-all duration-500 ${resBar}`} style={{ width: `${resPercent}%` }} />
            </div>
          )}
          {resRemaining === 0 && (
            <p className="text-xs text-rose-700 mt-2">Vous avez atteint votre quota mensuel. Passez à un plan supérieur.</p>
          )}
        </div>
      )}

      {/* Bandeau plan premium doré */}
      <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 text-white">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-gold-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-4 top-4 text-gold-400 opacity-50">
          <SparklesIcon className="w-16 h-16" />
        </div>
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge bg-gold-400/10 text-gold-300 ring-1 ring-gold-400/30">★ Plan actuel</span>
            </div>
            <div className="mt-2 text-xl font-bold flex items-center gap-2">
              <span className="bg-gradient-to-r from-gold-300 to-gold-400 bg-clip-text text-transparent">{subscription.plan}</span>
            </div>
            <div className="mt-1 text-sm text-ink-300">
              {isServiceOnlyCompany
                ? `Contacts ce mois : ${resQuota == null ? `${resUsed} / ∞` : `${resUsed} / ${resQuota}`}`
                : `Réservations : ${resQuota == null ? `${resUsed} / ∞` : `${resUsed} / ${resQuota}`} · Promotions actives : ${quotaTotal == null ? `${activeCount} / ∞` : `${activeCount} / ${quotaTotal}`}`
              }
            </div>
          </div>
          <Button variant="gold" onClick={() => navigate('/subscription')}>
            Gérer l'abonnement
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      {isServiceOnlyCompany ? (
        <div className="space-y-4">
          {/* Raccourci vers la fiche */}
          <div className="card p-5 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-semibold text-base text-ink-900 flex items-center gap-2">
                {isPharmacy ? '⚕' : '🔧'} {isPharmacy ? 'Ma pharmacie' : 'Mon service'}
              </h2>
              <p className="text-sm text-ink-500 mt-0.5">
                {isPharmacy ? 'Horaires, gardes et informations visibles sur mobile.' : 'Informations et disponibilités de votre service.'}
              </p>
            </div>
            <Button variant="primary" onClick={() => navigate('/service')}>
              {isPharmacy ? 'Gérer ma pharmacie' : 'Gérer mon service'}
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Tableau des contacts */}
          <div className="card">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h2 className="font-semibold text-base text-ink-900">Contacts clients</h2>
              <Badge variant="neutral">{reservations.length} total</Badge>
            </div>
            {reservations.length === 0 ? (
              <div className="px-5 py-12 text-center text-ink-400 text-sm">Aucun contact pour le moment.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-ink-50/60">
                    <tr className="text-[11px] text-ink-500 uppercase tracking-wide">
                      <th className="px-5 py-2.5 text-left font-semibold">Jour</th>
                      <th className="px-5 py-2.5 text-left font-semibold">Heure</th>
                      <th className="px-5 py-2.5 text-left font-semibold">Client</th>
                      <th className="px-5 py-2.5 text-left font-semibold">Objet</th>
                      <th className="px-5 py-2.5 text-left font-semibold">Code</th>
                      <th className="px-5 py-2.5 text-left font-semibold">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r.id} className="border-t border-ink-100 hover:bg-ink-50/60 transition-colors">
                        <td className="px-5 py-3 text-ink-700">{fmtDate(r.createdAt)}</td>
                        <td className="px-5 py-3 text-ink-500">{fmtTime(r.createdAt)}</td>
                        <td className="px-5 py-3 font-medium text-ink-900">{r.customer ?? 'Anonyme'}</td>
                        <td className="px-5 py-3 text-ink-500 max-w-[160px] truncate">{r.items?.join(', ') || '—'}</td>
                        <td className="px-5 py-3 text-xs font-mono text-ink-400">{r.code}</td>
                        <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-ink-900">Mes promotions</h2>
              <button onClick={() => navigate('/promos')} className="text-xs text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1">
                Voir tout <ChevronRightIcon className="w-3 h-3" />
              </button>
            </div>
            {recentPromos.length > 0 ? (
              <ul className="divide-y divide-ink-100">
                {recentPromos.map((p) => (
                  <li key={p.id} className="py-2.5 flex items-center justify-between">
                    <span className="text-sm text-ink-800 font-medium truncate">{p.title}</span>
                    <Badge
                      variant={p.active ? 'success' : p.status === 'finished' ? 'neutral' : 'info'}
                      dot
                    >
                      {p.active ? 'Active' : p.status === 'finished' ? 'Terminée' : 'À venir'}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center text-sm text-ink-400">Aucune promotion pour le moment.</div>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-ink-900">Réservations récentes</h2>
              <button onClick={() => navigate('/reservations')} className="text-xs text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1">
                Voir tout <ChevronRightIcon className="w-3 h-3" />
              </button>
            </div>
            {reservations.slice(0, 5).length > 0 ? (
              <ul className="divide-y divide-ink-100">
                {reservations.slice(0, 5).map((r) => (
                  <li key={r.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink-900 truncate">{r.customer ?? 'Anonyme'}</div>
                      <div className="text-[11px] text-ink-400">{fmtDate(r.createdAt)} · {fmtTime(r.createdAt)}</div>
                    </div>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center text-sm text-ink-400">Aucune réservation pour le moment.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
