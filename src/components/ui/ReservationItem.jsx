import Badge from './Badge'

const statusToVariant = (status) => {
  const s = (status || '').toLowerCase()
  if (s === 'confirmed' || s.includes('valid')) return 'success'
  if (s === 'pending' || s.includes('attente')) return 'warning'
  if (s === 'expired' || s === 'cancelled' || s.includes('expir')) return 'danger'
  return 'info'
}

export function ReservationItem({ code, status }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-ink-100 last:border-0">
      <span className="text-sm font-mono text-ink-700">{code}</span>
      <Badge variant={statusToVariant(status)} dot>{status}</Badge>
    </div>
  )
}
