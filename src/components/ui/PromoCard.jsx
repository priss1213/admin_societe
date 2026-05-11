import React from 'react'
import { ChartBarIcon, PauseCircleIcon, PlayIcon, EyeIcon, HeartIcon, TicketIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import Badge from './Badge'

const categoryStyles = {
  Alimentation: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  "Ménager":    'bg-sky-50 text-sky-700 ring-sky-100',
  Poissonnerie: 'bg-ink-100 text-ink-700 ring-ink-200',
  Boissons:     'bg-amber-50 text-amber-800 ring-amber-100',
}

export default function PromoCard({ promo, onEdit, onToggle, onPause }) {
  const navigate = useNavigate()
  const catCls = categoryStyles[promo.category] || 'bg-ink-100 text-ink-700 ring-ink-200'

  return (
    <div className={`card card-hover relative overflow-hidden flex flex-col ${promo.featured ? 'ring-1 ring-gold-300/60' : ''}`}>
      {promo.featured && (
        <span className="absolute top-0 right-0 z-10 m-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-gold-400 to-gold-500 text-ink-950 shadow-sm">
          <SparklesIcon className="w-3 h-3" /> Vedette
        </span>
      )}

      {/* Visuel */}
      <div className="relative h-32 bg-gradient-to-br from-ink-50 to-ink-100 flex items-center justify-center">
        {promo.image ? (
          <img src={promo.image} alt={promo.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-4xl opacity-80">{promo.icon || '🍖'}</div>
        )}
        <span className={`absolute bottom-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full ring-1 ring-inset ${catCls}`}>
          {promo.category}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="font-semibold text-ink-900 line-clamp-1">{promo.title}</div>
        <div className="text-xs text-ink-500 mt-1 line-clamp-2 min-h-[2.5rem]">
          {promo.description || `${promo.category} · Prix original · ...`}
        </div>

        {/* Stats */}
        <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
          <Stat icon={<EyeIcon className="w-3.5 h-3.5" />} value={promo.views ?? '—'} label="vues" tone="sky" />
          <Stat icon={<HeartIcon className="w-3.5 h-3.5" />} value={promo.likes ?? '—'} label="aimes" tone="rose" />
          <Stat icon={<TicketIcon className="w-3.5 h-3.5" />} value={promo.reservations ?? '—'} label="rés." tone="emerald" />
          <Stat icon={<ChartBarIcon className="w-3.5 h-3.5" />} value={promo.clickRate ?? '—'} label="taux" tone="ink" />
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={promo.active ? 'success' : 'neutral'} dot>
              {promo.active ? 'Active' : promo.status || 'Inactive'}
            </Badge>
            {promo.expiresIn && <span className="text-[11px] text-ink-400">⏳ {promo.expiresIn}</span>}
          </div>

          <div className="flex items-center gap-1">
            <IconButton title="Statistiques" onClick={() => navigate(`/analytics/promo/${promo.id}`)}>
              <ChartBarIcon className="w-4 h-4" />
            </IconButton>
            <IconButton
              title={promo.active ? 'Mettre en pause' : 'Reprendre'}
              onClick={() => onToggle && onToggle(promo.id)}
              tone={promo.active ? 'amber' : 'emerald'}
            >
              {promo.active ? <PauseCircleIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, value, label, tone }) {
  const tones = {
    sky:     'text-sky-600',
    rose:    'text-rose-600',
    emerald: 'text-emerald-600',
    ink:     'text-ink-700',
  }
  return (
    <div className="bg-ink-50/70 rounded-lg py-1.5">
      <div className={`flex items-center justify-center gap-1 font-semibold text-sm tabular-nums ${tones[tone] || ''}`}>
        {icon}
        <span>{value}</span>
      </div>
      <div className="text-[10px] text-ink-400 uppercase tracking-wide">{label}</div>
    </div>
  )
}

function IconButton({ children, tone = 'ink', ...rest }) {
  const tones = {
    ink:     'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
    amber:   'text-amber-700 hover:bg-amber-50',
    emerald: 'text-emerald-700 hover:bg-emerald-50',
  }
  return (
    <button
      type="button"
      className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${tones[tone] || tones.ink}`}
      {...rest}
    >
      {children}
    </button>
  )
}
