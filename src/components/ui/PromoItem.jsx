import Badge from './Badge'

const statusToVariant = (status) => {
  const s = (status || '').toLowerCase()
  if (s.includes('active')) return 'success'
  if (s.includes('venir') || s.includes('planif')) return 'info'
  if (s.includes('pause')) return 'warning'
  if (s.includes('termin') || s.includes('finished')) return 'neutral'
  return 'neutral'
}

export function PromoItem({ title, status }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-ink-100 last:border-0">
      <span className="text-sm text-ink-800 font-medium truncate">{title}</span>
      <Badge variant={statusToVariant(status)} dot>{status}</Badge>
    </div>
  )
}
