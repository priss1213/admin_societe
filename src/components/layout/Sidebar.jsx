import { NavLink, useNavigate } from 'react-router-dom'
import { HomeIcon, TagIcon, ClockIcon, FireIcon, ChartBarIcon, UserCircleIcon, BookOpenIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline'



export default function Sidebar() {
  const navigate = useNavigate()
  const { logout, currentUser } = useAuth()
  const { companyProfile, subscription } = useApp()
  const isServiceOnlyCompany = companyProfile?.companyType === 'service'

  return (
    <aside className="w-72 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
            {(companyProfile?.name || 'S').slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold">{companyProfile?.name || 'Ma société'}</div>
            <div className="text-xs text-green-600 font-medium">{subscription.plan}</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 text-xs text-gray-500">MON MAGASIN</div>
      <nav className="p-2">
        <NavLink to="/" className={({isActive})=>`flex items-center gap-3 p-2 rounded ${isActive? 'bg-gray-100 font-semibold text-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
          {({isActive}) => (
            <>
              <HomeIcon className={`${isActive ? 'w-5 h-5 text-gray-800' : 'w-5 h-5 text-gray-600'}`} />
              <span className="text-sm">Tableau de bord</span>
            </>
          )}
        </NavLink>

        <NavLink to="/magasin" className={({isActive}) => `flex items-center gap-3 p-2 rounded ${isActive ? 'bg-gray-100 font-semibold text-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
          {({isActive}) => (
            <>
              <BuildingStorefrontIcon className={`w-5 h-5 ${isActive ? 'text-gray-800' : 'text-gray-600'}`} />
              <span className="text-sm">Mon Magasin</span>
            </>
          )}
        </NavLink>


        {(companyProfile?.companyType === 'service' || companyProfile?.companyType === 'both') && (
          <>
            <NavLink to="/service" className={({isActive}) => `flex items-center gap-3 p-2 rounded ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
              {({isActive}) => (
                <>
                  <WrenchScrewdriverIcon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-600'}`} />
                  <span className="text-sm">Mon Service</span>
                </>
              )}
            </NavLink>

            <NavLink to="/service/statistics" className={({isActive}) => `flex items-center gap-3 p-2 rounded ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
              {({isActive}) => (
                <>
                  <FireIcon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-600'}`} />
                  <span className="text-sm">Stats Service</span>
                </>
              )}
            </NavLink>
          </>
        )}

        {!isServiceOnlyCompany && (
          <NavLink to="/promos" className={({isActive})=>`flex items-center gap-3 p-2 rounded ${isActive? 'bg-orange-50 text-orange-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
            {({isActive}) => (
              <>
                <TagIcon className={`${isActive ? 'w-5 h-5 text-orange-700' : 'w-5 h-5 text-gray-600'}`} />
                <span className="text-sm">Mes promos</span>
              </>
            )}
          </NavLink>
        )}

        <NavLink to="/reservations" className={({isActive})=>`flex items-center gap-3 p-2 rounded ${isActive? 'bg-gray-100 font-semibold text-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
          {({isActive}) => (
            <>
              <ClockIcon className={`${isActive ? 'w-5 h-5 text-gray-800' : 'w-5 h-5 text-gray-600'}`} />
              <span className="text-sm">Réservations</span>
            </>
          )}
        </NavLink>

        {companyProfile?.catalogueEnabled && (
          <NavLink to="/catalogue" className={({isActive})=>`flex items-center gap-3 p-2 rounded ${isActive? 'bg-orange-50 text-orange-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
            {({isActive}) => (
              <>
                <BookOpenIcon className={`${isActive ? 'w-5 h-5 text-orange-700' : 'w-5 h-5 text-gray-600'}`} />
                <span className="text-sm">Catalogue</span>
              </>
            )}
          </NavLink>
        )}
      </nav>

      {!isServiceOnlyCompany && (
        <>
          <div className="px-4 py-3 text-xs text-gray-500">ANALYTICS</div>
          <nav className="p-2">
            <NavLink to="/analytics" className={({isActive})=>`flex items-center gap-3 p-2 rounded ${isActive? 'bg-gray-100 font-semibold text-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
              {({isActive}) => (
                <>
                  <ChartBarIcon className={`${isActive ? 'w-5 h-5 text-gray-800' : 'w-5 h-5 text-gray-600'}`} />
                  <span className="text-sm">Vues & clics</span>
                </>
              )}
            </NavLink>
            <NavLink to="/statistics" className={({isActive})=>`flex items-center gap-3 p-2 rounded ${isActive? 'bg-gray-100 font-semibold text-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
              {({isActive}) => (
                <>
                  <FireIcon className={`${isActive ? 'w-5 h-5 text-gray-800' : 'w-5 h-5 text-gray-600'}`} />
                  <span className="text-sm">Statistiques</span>
                </>
              )}
            </NavLink>
          </nav>
        </>
      )}

      <div className="mt-auto p-4 border-t">
        <div className="text-xs text-gray-500 mb-2">COMPTE</div>
        <div className="flex items-center gap-3 mb-3">
          <UserCircleIcon className="w-8 h-8 text-gray-600 shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{currentUser?.full_name || 'Mon compte'}</div>
            <div className="text-xs text-gray-500 truncate">{currentUser?.email || ''}</div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <button onClick={() => navigate('/profile')} className="w-full px-3 py-1.5 text-sm text-left border rounded hover:bg-gray-50">Mon compte</button>
          <button onClick={() => navigate('/subscription')} className="w-full px-3 py-1.5 text-sm text-left border rounded hover:bg-gray-50">Abonnement</button>
          <button onClick={() => navigate('/change-password')} className="w-full px-3 py-1.5 text-sm text-left border rounded hover:bg-gray-50">Changer le mot de passe</button>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="w-full px-3 py-1.5 text-sm text-left rounded text-red-600 hover:bg-red-50 border border-red-100"
          >
            Se deconnecter
          </button>
        </div>
      </div>
    </aside>
  )
}
