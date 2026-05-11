import React, { useState } from 'react'
import { MagnifyingGlassIcon, BellAlertIcon, PlusIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import Button from '../ui/Button'

const ROUTE_LABELS = {
  '/':              'Tableau de bord',
  '/magasin':       'Mon magasin',
  '/service':       'Mon service',
  '/promos':        'Mes promotions',
  '/promos/new':    'Nouvelle promotion',
  '/reservations':  'Réservations',
  '/contacts':      'Contacts clients',
  '/catalogue':     'Catalogue',
  '/analytics':     'Vues & clics',
  '/statistics':    'Statistiques',
  '/reviews':       'Avis clients',
  '/profile':       'Mon compte',
  '/subscription':  'Abonnement',
  '/change-password': 'Changer le mot de passe',
}

export default function Topbar() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { companyProfile, subscription } = useApp()

  const isPharmacy = (companyProfile?.category || '').toLowerCase().includes('pharm')
  const hasServiceSpace = companyProfile?.companyType === 'service' || companyProfile?.companyType === 'both' || isPharmacy
  const isServiceOnly = hasServiceSpace && companyProfile?.companyType !== 'both'

  function submitSearch(e) {
    e?.preventDefault()
    navigate(`/promos${q ? `?q=${encodeURIComponent(q)}` : ''}`)
  }

  const pageTitle = ROUTE_LABELS[pathname] ||
    (pathname.startsWith('/analytics/promo/') ? 'Détail promotion' : 'Tableau de bord')

  const subtitle = isPharmacy
    ? 'Gestion de la pharmacie et des gardes'
    : isServiceOnly
      ? 'Gestion du service et des contacts clients'
      : 'Gestion des promotions et réservations'

  return (
    <div className="sticky top-0 z-20 -mx-6 -mt-6 mb-6 px-6 py-4 bg-white/85 backdrop-blur-md border-b border-ink-200">
      <div className="flex items-center justify-between gap-4">
        {/* Titre + breadcrumb */}
        <div className="min-w-0">
          <nav className="flex items-center gap-1.5 text-[11px] text-ink-400 mb-0.5">
            <span>{companyProfile?.name || 'Société'}</span>
            <span className="text-ink-300">/</span>
            <span className="text-ink-600 font-medium">{pageTitle}</span>
          </nav>
          <h1 className="text-lg font-semibold text-ink-900 truncate">{pageTitle}</h1>
          <p className="text-xs text-ink-500 mt-0.5">Plan <span className="font-medium text-gold-600">{subscription.plan}</span> · {subtitle}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!isServiceOnly && (
            <form onSubmit={submitSearch} className="relative hidden md:block">
              <MagnifyingGlassIcon className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher une promotion…"
                className="input pl-9 pr-3 py-2 w-64"
              />
            </form>
          )}

          <button
            type="button"
            className="relative w-9 h-9 rounded-lg border border-ink-200 bg-white text-ink-600 hover:bg-ink-50 hover:text-ink-900 flex items-center justify-center transition-colors"
            title="Notifications"
          >
            <BellAlertIcon className="w-4 h-4" />
            {subscription.alerts?.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {subscription.alerts.length}
              </span>
            )}
          </button>

          {isPharmacy ? null : isServiceOnly ? (
            <Button variant="primary" onClick={() => navigate('/service')}>
              <WrenchScrewdriverIcon className="w-4 h-4" />
              Mon service
            </Button>
          ) : (
            <Button variant="gold" onClick={() => navigate('/promos/new')}>
              <PlusIcon className="w-4 h-4" />
              Nouvelle promo
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
