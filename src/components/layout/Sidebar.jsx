import { NavLink, useNavigate } from 'react-router-dom'
import {
  HomeIcon, TagIcon, ClockIcon, FireIcon, ChartBarIcon,
  UserCircleIcon, BookOpenIcon, WrenchScrewdriverIcon,
  BuildingStorefrontIcon, ArrowRightOnRectangleIcon, CreditCardIcon, KeyIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150
         ${isActive
           ? 'bg-ink-800/60 text-white font-medium'
           : 'text-ink-300 hover:bg-ink-800/40 hover:text-white'}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-gradient-to-b from-gold-300 to-gold-500" />
          )}
          <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${isActive ? 'text-gold-400' : 'text-ink-400 group-hover:text-ink-200'}`} />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  )
}

function SectionLabel({ children }) {
  return <div className="px-3 mt-5 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-500">{children}</div>
}

export default function Sidebar() {
  const navigate = useNavigate()
  const { logout, currentUser } = useAuth()
  const { companyProfile, subscription } = useApp()

  const isPharmacyCategory = (companyProfile?.category || '').toLowerCase().includes('pharm')
  const hasServiceSpace = companyProfile?.companyType === 'service' || companyProfile?.companyType === 'both' || isPharmacyCategory
  const isServiceOnlyCompany = hasServiceSpace && companyProfile?.companyType !== 'both'
  const serviceMenuLabel = isPharmacyCategory ? 'Ma Pharmacie' : 'Mon Service'
  const reservationPath = isServiceOnlyCompany ? '/contacts' : '/reservations'
  const reservationLabel = isServiceOnlyCompany ? 'Contacts' : 'Réservations'

  return (
    <aside className="w-64 shrink-0 min-h-screen bg-ink-950 text-ink-200 flex flex-col border-r border-ink-900/50">
      {/* Header / Logo */}
      <div className="px-5 py-5 border-b border-ink-800/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            {companyProfile?.logo_url ? (
              <img src={companyProfile.logo_url} alt="logo"
                   className="w-10 h-10 rounded-lg object-cover ring-2 ring-gold-400/40" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 text-ink-950 flex items-center justify-center font-bold text-base shadow-gold-glow">
                {isPharmacyCategory ? '⚕' : (companyProfile?.name || 'S').slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-ink-950" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{companyProfile?.name || 'Ma société'}</div>
            <div className="text-[11px] text-gold-300 font-medium flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gold-400" />
              Plan {subscription.plan}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <SectionLabel>Espace</SectionLabel>
        <div className="flex flex-col gap-0.5">
          <NavItem to="/" end icon={HomeIcon} label="Tableau de bord" />
          <NavItem to="/magasin" icon={BuildingStorefrontIcon} label="Mon Magasin" />
          {hasServiceSpace && (
            <NavItem to="/service" icon={WrenchScrewdriverIcon} label={serviceMenuLabel} />
          )}
          {!isServiceOnlyCompany && (
            <NavItem to="/promos" icon={TagIcon} label="Mes promos" />
          )}
          <NavItem to={reservationPath} icon={ClockIcon} label={reservationLabel} />
          {companyProfile?.catalogueEnabled && (
            <NavItem to="/catalogue" icon={BookOpenIcon} label="Catalogue" />
          )}
        </div>

        {!isServiceOnlyCompany && (
          <>
            <SectionLabel>Analytics</SectionLabel>
            <div className="flex flex-col gap-0.5">
              <NavItem to="/analytics" icon={ChartBarIcon} label="Vues & clics" />
              <NavItem to="/statistics" icon={FireIcon} label="Statistiques" />
            </div>
          </>
        )}
      </nav>

      {/* Pied : compte + actions */}
      <div className="px-3 pb-4 pt-3 border-t border-ink-800/60">
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-ink-800/40 transition-colors text-left"
        >
          <UserCircleIcon className="w-9 h-9 text-ink-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white truncate">{currentUser?.full_name || 'Mon compte'}</div>
            <div className="text-[11px] text-ink-400 truncate">{currentUser?.email || ''}</div>
          </div>
        </button>

        <div className="mt-2 flex flex-col gap-1">
          <button onClick={() => navigate('/subscription')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-ink-300 hover:bg-ink-800/40 hover:text-white">
            <CreditCardIcon className="w-4 h-4" />
            Abonnement
          </button>
          <button onClick={() => navigate('/change-password')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-ink-300 hover:bg-ink-800/40 hover:text-white">
            <KeyIcon className="w-4 h-4" />
            Mot de passe
          </button>
          <button onClick={() => { logout(); navigate('/login') }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-rose-300 hover:bg-rose-500/10 hover:text-rose-200">
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </aside>
  )
}
