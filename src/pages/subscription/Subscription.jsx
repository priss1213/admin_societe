import React, { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { CheckCircleIcon, SparklesIcon, LightBulbIcon, StarIcon } from '@heroicons/react/24/outline'

export default function Subscription() {
  const {
    subscription, subscriptionPlans, promos, reservations, companyProfile,
    requestExtraReservations, subscriptionRequestMessage,
    reservationQuota,
  } = useApp()

  const [showConfirm, setShowConfirm] = useState(null)
  const [extraCount, setExtraCount] = useState('50')
  const [reason, setReason] = useState('')
  const [requestMsg, setRequestMsg] = useState('')

  const currentPlan = useMemo(
    () => subscriptionPlans.find((p) => p.name === subscription.plan),
    [subscription.plan, subscriptionPlans]
  )

  const handleUpgrade = (planId) => {
    if (currentPlan && planId !== currentPlan.id) setShowConfirm(planId)
  }

  const confirmUpgrade = () => {
    setRequestMsg(`Demande envoyée pour passer au plan ${subscriptionPlans.find((p) => p.id === showConfirm)?.name}.`)
    setShowConfirm(null)
  }

  const activePromos = promos.filter((p) => p.active).length
  const isPharmacy = (companyProfile?.category || '').toLowerCase().includes('pharm')
  const hasServiceSpace = companyProfile?.companyType === 'service' || companyProfile?.companyType === 'both' || isPharmacy
  const isServiceOnlyCompany = hasServiceSpace && companyProfile?.companyType !== 'both'
  const quotaLabel = isServiceOnlyCompany ? 'Contacts' : 'Réservations'
  const quotaLabelLower = quotaLabel.toLowerCase()

  async function submitReservationRequest(e) {
    e.preventDefault()
    const result = await requestExtraReservations(Number(extraCount || 0), reason)
    setRequestMsg(result.message)
    if (result.success) setReason('')
  }

  const getPlanIcon = (planId) => {
    const icons = {
      starter: <SparklesIcon className="w-8 h-8 text-yellow-500" />,
      professional: <LightBulbIcon className="w-8 h-8 text-blue-500" />,
      business: <StarIcon className="w-8 h-8 text-purple-500" />,
    }
    return icons[planId] || icons.starter
  }

  // Quota réservations / contacts
  const resUsed = reservationQuota?.used ?? 0
  const resQuota = reservationQuota?.quota ?? null
  const resRemaining = reservationQuota?.remaining ?? null
  const resPercent = resQuota ? Math.min(100, Math.round((resUsed / resQuota) * 100)) : 0
  const resColor = resPercent >= 90 ? 'bg-red-500' : resPercent >= 70 ? 'bg-amber-500' : 'bg-green-600'

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Plans d'abonnement</h1>
        <p className="text-gray-600">Choisissez le plan qui correspond à vos besoins</p>
      </div>

      {/* Bannière plan actuel */}
      {currentPlan && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-1">Plan actuel : {currentPlan.name}</h2>
              <p className="text-blue-700">
                Prochain renouvellement :{' '}
                <span className="font-semibold">
                  {new Date(subscription.renewalDate).toLocaleDateString('fr-FR')}
                </span>
              </p>
              <p className="text-blue-700 text-sm mt-2">
                {!isServiceOnlyCompany && (
                  <>
                    Promotions actives :{' '}
                    <span className="font-bold">
                      {subscription.promoQuota === null ? '∞' : subscription.promoQuota}
                    </span>
                    {' · '}
                  </>
                )}
                {quotaLabel}/mois :{' '}
                <span className="font-bold">
                  {resQuota === null ? '∞' : resQuota}
                </span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-900">
                {subscription.price?.toLocaleString('fr-FR')} F
              </div>
              <div className="text-sm text-blue-700">par mois</div>
            </div>
          </div>
        </div>
      )}

      {/* Alertes */}
      {subscription.alerts?.length > 0 && (
        <div className="space-y-3">
          {subscription.alerts.map((alert) => (
            <div
              key={alert.title}
              className={`rounded-lg p-4 ${
                alert.level === 'danger'
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-amber-50 border border-amber-200 text-amber-700'
              }`}
            >
              <div className="font-semibold">{alert.title}</div>
              <div className="text-sm">{alert.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* Grille des plans */}
      <div className="grid grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => {
          const isCurrentPlan = plan.name === subscription.plan
          const isRecommended = plan.recommended
          return (
            <div
              key={plan.id}
              className={`rounded-lg shadow-lg overflow-hidden transition ${
                isCurrentPlan ? 'ring-2 ring-blue-500 scale-105'
                : isRecommended ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              {isRecommended && (
                <div className="bg-yellow-400 text-yellow-900 px-4 py-2 text-center font-bold text-sm">
                  ⭐ RECOMMANDÉ
                </div>
              )}
              {isCurrentPlan && (
                <div className="bg-blue-600 text-white px-4 py-2 text-center font-bold text-sm">
                  ✓ PLAN ACTUEL
                </div>
              )}
              <div className={`p-6 ${isCurrentPlan ? 'bg-blue-50' : isRecommended ? 'bg-yellow-50' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getPlanIcon(plan.id)}
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="mb-6">
                  <div className="text-4xl font-bold">{plan.price?.toLocaleString('fr-FR')} F</div>
                  <div className="text-gray-600 text-sm">par mois</div>
                </div>
                <div className="mb-4 space-y-2 text-sm">
                  {[
                    ['📢', 'Promotions', plan.promoQuota ?? plan.max_promotions],
                    ['🎟️', `${quotaLabel}/mois`, plan.monthlyLimit ?? plan.max_reservations_per_month],
                    ['📋', 'Catalogues', plan.max_catalogues],
                  ].map(([icon, label, value]) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${value === null || value === undefined ? 'bg-purple-500' : 'bg-blue-500'}`} />
                      <span>{icon} {label} : <span className="font-semibold">{value === null || value === undefined ? '∞' : value}</span></span>
                    </div>
                  ))}
                </div>
                <div className="mb-6 space-y-2">
                  {(plan.features || []).map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                {isCurrentPlan ? (
                  <button disabled className="w-full py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed">
                    Plan actuel
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      isRecommended
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Passer à {plan.name}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">Confirmer la mise à niveau</h3>
            <p className="text-gray-600 mb-4">
              Passer au plan{' '}
              <span className="font-semibold">
                {subscriptionPlans.find((p) => p.id === showConfirm)?.name}
              </span> ?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              La facturation prendra effet le mois prochain.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={confirmUpgrade} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Détails + Utilisation */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Informations d'abonnement</h3>
          <div className="space-y-3 text-sm">
            {[
              ['Plan', subscription.plan],
              ['Prix mensuel', `${subscription.price?.toLocaleString('fr-FR')} F`],
              ['Période en cours', subscription.currentPeriodLabel],
              ['Date de renouvellement', new Date(subscription.renewalDate).toLocaleDateString('fr-FR')],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-600">{label}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="text-gray-600">Renouvellement auto</span>
              <span className={`font-semibold ${subscription.autoRenewal ? 'text-green-600' : 'text-red-600'}`}>
                {subscription.autoRenewal ? 'Activé' : 'Désactivé'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Utilisation</h3>
          <div className="space-y-5">

            {/* Promotions */}
            {currentPlan?.promoQuota != null && (
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium">📢 Promotions actives</span>
                  <span className="text-gray-600">{activePromos} / {currentPlan.promoQuota}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div
                    className="bg-blue-600 h-2 rounded"
                    style={{ width: `${Math.min(100, (activePromos / currentPlan.promoQuota) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Réservations / contacts — depuis le backend */}
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="font-medium">🎟️ {quotaLabel} ce mois</span>
                <span className="text-gray-600">
                  {resUsed}{resQuota !== null ? ` / ${resQuota}` : ' / ∞'}
                </span>
              </div>
              {resQuota !== null && (
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div className={`h-2 rounded transition-all ${resColor}`} style={{ width: `${resPercent}%` }} />
                </div>
              )}
              {resRemaining !== null && resRemaining <= 20 && (
                <p className={`text-xs mt-1 ${resRemaining === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                  {resRemaining === 0
                    ? '⚠️ Quota atteint ce mois'
                    : `⚠️ Plus que ${resRemaining} ${quotaLabelLower}${resRemaining > 1 ? 's' : ''} disponible${resRemaining > 1 ? 's' : ''}`}
                </p>
              )}
            </div>

            {/* Catalogues */}
            {currentPlan?.max_catalogues != null && (
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium">📋 Catalogues publiés</span>
                  <span className="text-gray-600">— / {currentPlan.max_catalogues}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div className="bg-purple-500 h-2 rounded" style={{ width: '0%' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Demande extra réservations / contacts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Demander plus de {quotaLabelLower}</h3>
        <form onSubmit={submitReservationRequest} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre supplémentaire demandé</label>
              <input
                value={extraCount}
                onChange={(e) => setExtraCount(e.target.value)}
                type="number" min="1"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Motif</label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Campagne spéciale, pic de demande…"
              />
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Envoyer la demande
          </button>
          {(requestMsg || subscriptionRequestMessage) && (
            <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {requestMsg || subscriptionRequestMessage}
            </div>
          )}
        </form>
      </div>

      {/* Aide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-2">Besoin d'aide ?</h3>
        <p className="text-gray-700 text-sm mb-2">
          Pour un changement de plan ou une question de facturation, contactez le support.
        </p>
        <a
          href="mailto:support@mespromos.com?subject=Support%20abonnement%20societe"
          className="text-blue-600 hover:underline text-sm"
        >
          support@mespromos.com
        </a>
      </div>
    </div>
  )
}
