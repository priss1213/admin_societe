import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import { PromoItem } from '../../components/ui/PromoItem'
import { useApp } from '../../context/AppContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Récupère les stats service/pharmacie depuis le backend
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

// Badge de statut réservation
function StatusBadge({ status }) {
  const map = {
    confirmed: { label: 'Validée', cls: 'bg-green-100 text-green-800' },
    expired:   { label: 'Expirée', cls: 'bg-red-100 text-red-800' },
    pending:   { label: 'En attente', cls: 'bg-amber-100 text-amber-800' },
  }
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-700' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>
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

  // Stats service/pharmacie
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
  const confirmedReservations = reservations.filter((r) => r.status === 'confirmed')
  const pendingCount = reservations.filter((r) => r.status === 'pending').length
  const totalCommission = confirmedReservations.reduce(
    (s, r) => s + Number(r.commissionAmount || 0), 0
  )
  const quotaTotal = subscription?.promoQuota ?? null

  // Quota réservations depuis le backend
  const resUsed = reservationQuota.used ?? reservations.length
  const resQuota = reservationQuota.quota
  const resRemaining = reservationQuota.remaining

  const formatMoney = (n) => `${Math.round(n).toLocaleString('fr-FR')} F`
  const recentPromos = promos.slice(0, 3)

  // Barre quota réservations
  const resPercent = resQuota ? Math.min(100, Math.round((resUsed / resQuota) * 100)) : 0
  const resColor = resPercent >= 90 ? 'bg-red-500' : resPercent >= 70 ? 'bg-amber-500' : 'bg-green-500'

  // Formatage date/heure pour le tableau des contacts
  const fmtDate = (ts) => ts ? new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'
  const fmtTime = (ts) => ts ? new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'

  // Stats service calculées
  const sviews = serviceStats?.views_count ?? 0
  const scontacts = serviceStats?.contacts_count ?? 0
  const srating = serviceStats?.rating > 0 ? serviceStats.rating.toFixed(1) : '—'
  const sconversion = sviews > 0 ? `${Math.round((scontacts / sviews) * 100)}%` : '0%'

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{isPharmacy ? '💊 Tableau de bord' : isServiceOnlyCompany ? '🔧 Tableau de bord' : 'Tableau de bord'}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {companyProfile?.name || 'Ma société'} · {isPharmacy ? 'Pharmacie' : isServiceOnlyCompany ? 'Prestataire de service' : 'Commerce'} · {subscription.currentPeriodLabel}
          </p>
        </div>
        {isServiceOnlyCompany && (
          <button onClick={loadStats} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            ↻ Actualiser
          </button>
        )}
      </div>

      {/* ── Cartes statistiques ── */}
      {isServiceOnlyCompany ? (
        /* Pharmacie / Service : stats fiche prestataire */
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Vues du profil</span>
              <span className="text-xl">👁️</span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{statsLoading ? '…' : sviews}</div>
            <div className="text-xs text-gray-400 mt-1">visites de votre fiche mobile</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Contacts reçus</span>
              <span className="text-xl">📞</span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{statsLoading ? '…' : scontacts}</div>
            <div className="text-xs text-gray-400 mt-1">actions de contact</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Note moyenne</span>
              <span className="text-xl">⭐</span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{statsLoading ? '…' : srating}</div>
            <div className="text-xs text-gray-400 mt-1">évaluation clients</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Taux contact/vue</span>
              <span className="text-xl">📈</span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{statsLoading ? '…' : sconversion}</div>
            <div className="text-xs text-gray-400 mt-1">indicateur de conversion</div>
          </div>
        </div>
      ) : (
        /* Commerce normal : cartes promos + réservations */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <Card title="Promos actives" value={String(activeCount)} />
          <Card title="Vues" value={String(views)} />
          <Card title="Réservations" value={String(reservations.length)} />
          <Card title="Validées" value={String(confirmedReservations.length)} />
        </div>
      )}

      {/* ── Bloc attente/validées/commissions — commerce uniquement ── */}
      {!isServiceOnlyCompany && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="text-sm text-amber-700 font-medium">⏳ En attente de validation</div>
            <div className="text-2xl font-bold text-amber-800 mt-1">{pendingCount}</div>
            <button onClick={() => navigate('/reservations')} className="mt-2 text-xs text-amber-600 hover:underline">
              Valider maintenant →
            </button>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-700 font-medium">✅ Validées ce mois</div>
            <div className="text-2xl font-bold text-green-800 mt-1">{confirmedReservations.length}</div>
            <div className="text-xs text-green-600 mt-1">réservations confirmées</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-700 font-medium">💰 Commissions prélevées</div>
            <div className="text-2xl font-bold text-orange-800 mt-1">{formatMoney(totalCommission)}</div>
            <div className="text-xs text-orange-600 mt-1">sur réservations validées</div>
          </div>
        </div>
      )}

      {/* ── Quota réservations — commerce uniquement ── */}
      {!isServiceOnlyCompany && (
        <div className="bg-white border rounded-lg p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold text-sm">🎟️ Quota réservations ce mois</div>
              <div className="text-xs text-gray-500 mt-0.5">Plan {reservationQuota.plan}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {resUsed}<span className="text-base font-normal text-gray-400">{resQuota !== null ? ` / ${resQuota}` : ' / ∞'}</span>
              </div>
              {resRemaining !== null && (
                <div className={`text-xs font-semibold ${resRemaining === 0 ? 'text-red-600' : resRemaining <= 10 ? 'text-amber-600' : 'text-green-600'}`}>
                  {resRemaining === 0 ? '⚠️ Quota atteint' : `${resRemaining} restante${resRemaining > 1 ? 's' : ''}`}
                </div>
              )}
            </div>
          </div>
          {resQuota !== null && (
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full transition-all ${resColor}`} style={{ width: `${resPercent}%` }} />
            </div>
          )}
          {resRemaining === 0 && (
            <p className="text-xs text-red-600 mt-2">Vous avez atteint votre quota mensuel. Passez à un plan supérieur.</p>
          )}
        </div>
      )}

      {subscription.alerts?.length > 0 && (
        <div className="space-y-3 mb-6">
          {subscription.alerts.map((alert) => (
            <div key={alert.title} className={`rounded-lg p-4 ${alert.level === 'danger' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
              <div className="font-semibold">{alert.title}</div>
              <div className="text-sm">{alert.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bannière plan ── */}
      <div className="bg-orange-600 text-white p-4 rounded-xl mb-6 flex justify-between items-center">
        <div>
          <div className="font-semibold">Plan {subscription.plan}</div>
          <div className="text-sm text-orange-100">
            {isServiceOnlyCompany
              ? `Contacts ce mois : ${resQuota == null ? `${resUsed} / ∞` : `${resUsed} / ${resQuota}`}`
              : `Réservations : ${resQuota == null ? `${resUsed} / ∞` : `${resUsed} / ${resQuota}`} · Promotions actives : ${quotaTotal == null ? `${activeCount} / ∞` : `${activeCount} / ${quotaTotal}`}`
            }
          </div>
        </div>
        <button onClick={() => navigate('/subscription')} className="bg-white text-orange-600 px-4 py-1.5 rounded-lg font-medium text-sm">
          Voir l'abonnement
        </button>
      </div>

      {/* ── Contenu principal ── */}
      {isServiceOnlyCompany ? (
        /* Pharmacie / Service : raccourci + tableau des contacts */
        <div className="space-y-6">
          {/* Raccourci vers la fiche */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-gray-900">{isPharmacy ? '💊 Ma pharmacie' : '🔧 Mon service'}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {isPharmacy ? 'Horaires, gardes et informations visibles sur mobile.' : 'Informations et disponibilités de votre service.'}
              </p>
            </div>
            <button
              onClick={() => navigate('/service')}
              className={`px-4 py-2 text-sm text-white rounded-lg font-medium ${isPharmacy ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isPharmacy ? 'Gérer ma pharmacie →' : 'Gérer mon service →'}
            </button>
          </div>

          {/* Tableau des contacts */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base text-gray-900">📋 Contacts clients</h2>
              <span className="text-xs text-gray-400">{reservations.length} contact{reservations.length !== 1 ? 's' : ''} total</span>
            </div>
            {reservations.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">Aucun contact pour le moment.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="pb-3 text-left font-semibold">Jour</th>
                      <th className="pb-3 text-left font-semibold">Heure</th>
                      <th className="pb-3 text-left font-semibold">Client</th>
                      <th className="pb-3 text-left font-semibold">Objet</th>
                      <th className="pb-3 text-left font-semibold">Code</th>
                      <th className="pb-3 text-left font-semibold">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 text-gray-700">{fmtDate(r.createdAt)}</td>
                        <td className="py-3 text-gray-500">{fmtTime(r.createdAt)}</td>
                        <td className="py-3 font-medium text-gray-900">{r.customer ?? 'Anonyme'}</td>
                        <td className="py-3 text-gray-500 max-w-[160px] truncate">{r.items?.join(', ') || '—'}</td>
                        <td className="py-3 text-xs font-mono text-gray-400">{r.code}</td>
                        <td className="py-3"><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Commerce normal : promos + réservations récentes */
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-bold mb-3">Mes promotions</h2>
            <div className="space-y-3">
              {recentPromos.length > 0
                ? recentPromos.map((p) => (
                    <PromoItem key={p.id} title={p.title} status={p.active ? 'Active' : p.status === 'finished' ? 'Terminée' : 'À venir'} />
                  ))
                : <div className="text-sm text-gray-500">Aucune promotion pour le moment.</div>}
            </div>
            <button onClick={() => navigate('/promos')} className="mt-4 text-sm text-orange-600 hover:underline">
              Gérer mes promotions
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-bold mb-3">Réservations récentes</h2>
            {reservations.slice(0, 5).length > 0 ? (
              <div className="space-y-2">
                {reservations.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                    <div>
                      <span className="font-medium">{r.customer ?? 'Anonyme'}</span>
                      <span className="text-xs text-gray-400 ml-2">{fmtDate(r.createdAt)}</span>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Aucune réservation pour le moment.</div>
            )}
            <button onClick={() => navigate('/reservations')} className="mt-4 text-sm text-orange-600 hover:underline">
              Voir toutes les réservations
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
