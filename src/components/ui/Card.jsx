export default function Card({ title, value, icon, hint, accent }) {
  const accentRing = {
    gold:   'before:bg-gradient-to-b before:from-gold-300 before:to-gold-500',
    green:  'before:bg-gradient-to-b before:from-emerald-300 before:to-emerald-500',
    blue:   'before:bg-gradient-to-b before:from-sky-300 before:to-sky-500',
    red:    'before:bg-gradient-to-b before:from-rose-300 before:to-rose-500',
    purple: 'before:bg-gradient-to-b before:from-violet-300 before:to-violet-500',
  }[accent] || 'before:bg-ink-200'

  return (
    <div className={`card relative overflow-hidden p-5 ${accent ? `pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 ${accentRing}` : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{title}</p>
          <h2 className="mt-1.5 text-2xl font-bold text-ink-900 tabular-nums">{value}</h2>
          {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
        </div>
        {icon && (
          <div className="shrink-0 w-9 h-9 rounded-lg bg-ink-50 text-ink-600 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
