export default function KpiCard({ label, value, hint, icon, trend, accent = 'gold', loading }) {
  const accents = {
    gold: {
      bar:  'before:bg-gradient-to-b before:from-gold-300 before:to-gold-500',
      icon: 'bg-gold-50 text-gold-600 ring-1 ring-gold-100',
    },
    blue: {
      bar:  'before:bg-gradient-to-b before:from-sky-300 before:to-sky-500',
      icon: 'bg-sky-50 text-sky-600 ring-1 ring-sky-100',
    },
    green: {
      bar:  'before:bg-gradient-to-b before:from-emerald-300 before:to-emerald-500',
      icon: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
    },
    red: {
      bar:  'before:bg-gradient-to-b before:from-rose-300 before:to-rose-500',
      icon: 'bg-rose-50 text-rose-600 ring-1 ring-rose-100',
    },
    purple: {
      bar:  'before:bg-gradient-to-b before:from-violet-300 before:to-violet-500',
      icon: 'bg-violet-50 text-violet-600 ring-1 ring-violet-100',
    },
    ink: {
      bar:  'before:bg-gradient-to-b before:from-ink-700 before:to-ink-900',
      icon: 'bg-ink-100 text-ink-700 ring-1 ring-ink-200',
    },
  }[accent] || {}

  const trendCls = trend?.dir === 'up'
    ? 'text-emerald-600 bg-emerald-50 ring-emerald-100'
    : trend?.dir === 'down'
      ? 'text-rose-600 bg-rose-50 ring-rose-100'
      : 'text-ink-500 bg-ink-100 ring-ink-200'

  return (
    <div className={`card card-hover relative overflow-hidden p-5 pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 ${accents.bar || ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-ink-900 tabular-nums">
              {loading ? <span className="inline-block w-12 h-7 bg-ink-100 rounded animate-pulse" /> : value}
            </h2>
            {trend && (
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ring-1 ring-inset ${trendCls}`}>
                {trend.dir === 'up' ? '↑' : trend.dir === 'down' ? '↓' : '·'} {trend.label}
              </span>
            )}
          </div>
          {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
        </div>
        {icon && (
          <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${accents.icon || 'bg-ink-50 text-ink-600'}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
