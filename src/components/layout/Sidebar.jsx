import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { HomeIcon, TagIcon, ClockIcon, StarIcon, FireIcon, ChartBarIcon, UserCircleIcon, CreditCardIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

export default function Sidebar() {
  const navigate = useNavigate()
  return (
    <aside className="w-72 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-orange-50 text-orange-700 flex items-center justify-center font-bold">C</div>
          <div>
            <div className="text-sm font-semibold">CECADO</div>
            <div className="text-xs text-green-600 font-medium">Starter</div>
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

        <NavLink to="/promos" className={({isActive})=>`flex items-center gap-3 p-2 rounded ${isActive? 'bg-orange-50 text-orange-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
          {({isActive}) => (
            <>
              <TagIcon className={`${isActive ? 'w-5 h-5 text-orange-700' : 'w-5 h-5 text-gray-600'}`} />
              <span className="text-sm">Mes promos</span>
            </>
          )}
        </NavLink>

        <NavLink to="/reservations" className={({isActive})=>`flex items-center gap-3 p-2 rounded ${isActive? 'bg-gray-100 font-semibold text-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
          {({isActive}) => (
            <>
              <ClockIcon className={`${isActive ? 'w-5 h-5 text-gray-800' : 'w-5 h-5 text-gray-600'}`} />
              <span className="text-sm">Réservations</span>
            </>
          )}
        </NavLink>

        <NavLink to="#" className={({isActive})=>`flex items-center gap-3 p-2 rounded ${isActive? 'bg-gray-100 font-semibold text-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
          {({isActive}) => (
            <>
              <StarIcon className={`${isActive ? 'w-5 h-5 text-gray-800' : 'w-5 h-5 text-gray-600'}`} />
              <span className="text-sm">Mises en avant</span>
            </>
          )}
        </NavLink>
      </nav>

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
        <NavLink to="/reviews" className={({isActive})=>`flex items-center gap-3 p-2 rounded ${isActive? 'bg-gray-100 font-semibold text-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
          {({isActive}) => (
            <>
              <ChatBubbleLeftIcon className={`${isActive ? 'w-5 h-5 text-gray-800' : 'w-5 h-5 text-gray-600'}`} />
              <span className="text-sm">Commentaires</span>
            </>
          )}
        </NavLink>
      </nav>

      <div className="mt-auto p-4 border-t">
        <div className="text-xs text-gray-500 mb-2">COMPTE</div>
        <div className="flex items-center gap-3 mb-2">
          <UserCircleIcon className="w-8 h-8 text-gray-600" />
          <div>
            <div className="text-sm font-medium">Profil magasin</div>
            <div className="text-xs text-gray-500">Abonnement</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/profile')} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">Mon compte</button>
          <button onClick={() => navigate('/subscription')} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">Abonnement</button>
        </div>
      </div>
    </aside>
  )
}
