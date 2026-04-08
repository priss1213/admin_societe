import React from 'react'
import { ChartBarIcon, PauseCircleIcon, PlayIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

const categoryStyles = {
  Alimentation: { bg: 'bg-green-50', text: 'text-green-800' },
  "Ménager": { bg: 'bg-blue-50', text: 'text-blue-800' },
  Poissonnerie: { bg: 'bg-gray-50', text: 'text-gray-800' },
  Boissons: { bg: 'bg-amber-50', text: 'text-amber-800' },
}

export default function PromoCard({promo, onEdit, onToggle, onPause}){
  const navigate = useNavigate()
  const style = categoryStyles[promo.category] || { bg: 'bg-gray-50', text: 'text-gray-800' }

  return (
    <div className="bg-white rounded-lg shadow border">
      <div className={`p-3 rounded-t-lg ${style.bg}`}>
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600">{promo.category}</div>
          {promo.featured && <div className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">Vedette</div>}
        </div>
        <div className="flex items-center justify-center py-4">
          {promo.image ? (
            <img src={promo.image} alt={promo.title} className="w-16 h-16 object-cover rounded-lg" />
          ) : (
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-2xl">{promo.icon || '🍖'}</div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="font-semibold text-lg">{promo.title}</div>
        {promo.description && (
          <div className="text-sm text-gray-500 mt-1">{promo.description.length > 120 ? `${promo.description.slice(0,120)}...` : promo.description}</div>
        )}
        {!promo.description && <div className="text-sm text-gray-500 mt-1">{promo.category} · Prix original · ...</div>}

        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-bold">{promo.views ?? '—'}</div>
            <div className="text-gray-500">vues</div>
          </div>
          <div>
            <div className="font-bold">{promo.reservations ?? '—'}</div>
            <div className="text-gray-500">réservations</div>
          </div>
          <div>
            <div className="font-bold">{promo.clickRate ?? '—'}</div>
            <div className="text-gray-500">taux clics</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`px-2 py-1 rounded text-xs ${promo.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{promo.active ? 'Active' : promo.status || '—'}</div>
            <div className="text-xs text-gray-500">Expire dans {promo.expiresIn}</div>
          </div>

          <div className="flex items-center gap-2">
            <button title="Statistiques" onClick={() => navigate(`/analytics/promo/${promo.id}`)} className="p-2 bg-white border rounded text-gray-600"><ChartBarIcon className="w-4 h-4"/></button>
            <button title={promo.active ? 'Pause' : 'Reprendre'} onClick={() => onToggle(promo.id)} className="p-2 bg-white border rounded text-gray-600">{promo.active ? <PauseCircleIcon className="w-4 h-4"/> : <PlayIcon className="w-4 h-4"/>}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
