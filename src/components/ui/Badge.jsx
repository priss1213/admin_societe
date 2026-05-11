const variants = {
  neutral: 'bg-ink-100 text-ink-700',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  warning: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200',
  danger:  'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
  info:    'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  gold:    'bg-gold-50 text-gold-700 ring-1 ring-inset ring-gold-200',
  ink:     'bg-ink-900 text-white',
}

export default function Badge({ children, variant = 'neutral', dot, className = '' }) {
  const dotColor = {
    neutral: 'bg-ink-400', success: 'bg-emerald-500', warning: 'bg-amber-500',
    danger: 'bg-rose-500', info: 'bg-sky-500', gold: 'bg-gold-500', ink: 'bg-white',
  }[variant]

  return (
    <span className={`badge ${variants[variant] || variants.neutral} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {children}
    </span>
  )
}
