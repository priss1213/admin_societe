import React, { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { CheckCircleIcon, XMarkIcon, SparklesIcon, LightBulbIcon, StarIcon } from '@heroicons/react/24/outline'

export default function Subscription() {
  const { subscription, subscriptionPlans, upgradePlan } = useApp()
  const [showConfirm, setShowConfirm] = useState(null)

  const currentPlan = useMemo(() => {
    return subscriptionPlans.find((p) => p.name === subscription.plan)
  }, [subscription.plan, subscriptionPlans])

  const handleUpgrade = (planId) => {
    if (planId !== currentPlan.id) {
      setShowConfirm(planId)
    }
  }

  const confirmUpgrade = (planId) => {
    upgradePlan(planId)
    setShowConfirm(null)
  }

  const getPlanIcon = (planId) => {
    const icons = {
      starter: <SparklesIcon className="w-8 h-8 text-yellow-500" />,
      professional: <LightBulbIcon className="w-8 h-8 text-blue-500" />,
      business: <StarIcon className="w-8 h-8 text-purple-500" />,
    }
    return icons[planId] || icons.starter
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Plans d'abonnement</h1>
        <p className="text-gray-600">Choisissez le plan qui correspond à vos besoins</p>
      </div>

      {/* Current Plan Banner */}
      {currentPlan && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-1">Plan actuel: {currentPlan.name}</h2>
              <p className="text-blue-700">
                Prochain renouvellement: <span className="font-semibold">{subscription.renewalDate}</span>
              </p>
              <p className="text-blue-700 text-sm mt-2">
                Vous utilisez <span className="font-bold">{subscription.promoQuota === null ? '∞' : subscription.promoQuota}</span> promotions et <span className="font-bold">{subscription.monthlyLimit === null ? '∞' : subscription.monthlyLimit}</span> réservations/mois
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-900">{subscription.price}€</div>
              <div className="text-sm text-blue-700">par mois</div>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => {
          const isCurrentPlan = plan.name === subscription.plan
          const isRecommended = plan.recommended

          return (
            <div
              key={plan.id}
              className={`rounded-lg shadow-lg overflow-hidden transition ${
                isCurrentPlan
                  ? 'ring-2 ring-blue-500 scale-105'
                  : isRecommended
                  ? 'ring-2 ring-yellow-400'
                  : ''
              }`}
            >
              {/* Recommended Badge */}
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
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  {getPlanIcon(plan.id)}
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-4xl font-bold">{plan.price}€</div>
                  <div className="text-gray-600 text-sm">par mois, facturé annuellement</div>
                </div>

                {/* Quotas */}
                <div className="mb-6 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${plan.promoQuota === null ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                    <span>
                      Promotions: <span className="font-semibold">{plan.promoQuota === null ? '∞' : plan.promoQuota}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${plan.monthlyLimit === null ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                    <span>
                      Réservations/mois: <span className="font-semibold">{plan.monthlyLimit === null ? '∞' : plan.monthlyLimit}</span>
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6 space-y-2">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
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

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">Confirmer la mise à niveau</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir passer au plan <span className="font-semibold">{subscriptionPlans.find((p) => p.id === showConfirm)?.name}</span> ?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              La facturation prendra effet le mois prochain. Vous pouvez rétrograder à tout moment.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => confirmUpgrade(showConfirm)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Details */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Informations d'abonnement</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan</span>
              <span className="font-semibold">{subscription.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prix mensuel</span>
              <span className="font-semibold">{subscription.price}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date de renouvellement</span>
              <span className="font-semibold">{subscription.renewalDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Renouvellement automatique</span>
              <span className={`font-semibold ${subscription.autoRenewal ? 'text-green-600' : 'text-red-600'}`}>
                {subscription.autoRenewal ? 'Activé' : 'Désactivé'}
              </span>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium">
            Modifier les paramètres de facturation
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Utilisation</h3>
          <div className="space-y-4">
            {currentPlan?.promoQuota !== null && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Promotions</span>
                  <span className="text-sm text-gray-600">3 / {currentPlan?.promoQuota}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div className="bg-blue-600 h-2 rounded" style={{width: `${(3 / currentPlan?.promoQuota) * 100}%`}}></div>
                </div>
              </div>
            )}

            {currentPlan?.monthlyLimit !== null && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Réservations ce mois</span>
                  <span className="text-sm text-gray-600">18 / {currentPlan?.monthlyLimit}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div className="bg-green-600 h-2 rounded" style={{width: `${(18 / currentPlan?.monthlyLimit) * 100}%`}}></div>
                </div>
              </div>
            )}

            <button className="w-full mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium">
              Annuler l'abonnement
            </button>
          </div>
        </div>
      </div>

      {/* FAQ or Support */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Questions fréquentes</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-semibold mb-1">❓ Puis-je changer de plan à tout moment ?</p>
            <p className="text-gray-700">Oui, vous pouvez mettre à niveau ou rétrograder votre abonnement à tout moment. Les changements prendront effet le mois suivant.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">❓ Puis-je obtenir un remboursement ?</p>
            <p className="text-gray-700">Nous offrons une garantie de remboursement de 30 jours. Contactez notre support pour plus de détails.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">❓ Besoin d'aide ?</p>
            <p className="text-gray-700">
              Contactez notre support: <a href="mailto:support@mobilepub.com" className="text-blue-600 hover:underline">support@mobilepub.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
