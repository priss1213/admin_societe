import React, { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} F`
}

function formatRemaining(r) {
  if (r.status === 'confirmed') return 'Validée'
  if (r.status === 'expired') return 'Expirée'
  const hoursAllowed = r.expiryHours != null ? Number(r.expiryHours) : 48
  const cutoff = r.createdAt + hoursAllowed * 60 * 60 * 1000
  const remainingMs = cutoff - Date.now()
  if (remainingMs <= 0) return 'Expirée'
  const hrs = Math.floor(remainingMs / (1000 * 60 * 60))
  const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

function statusBadge(status) {
  if (status === 'confirmed') return 'bg-green-100 text-green-800'
  if (status === 'expired') return 'bg-red-100 text-red-800'
  return 'bg-yellow-100 text-yellow-800'
}

export default function Reservations({ mode = 'reservations' }) {
  const {
    reservations,
    reservationSettings,
    companyProfile,
    addReservation,
    validateReservation,
    expireReservation,
    deleteReservation,
    updateReservation,
    calculateReservationCommission,
    subscription,
  } = useApp()
  const isContactsMode = mode === 'contacts'
  const entitySingular = isContactsMode ? 'contact' : 'réservation'
  const entityPlural = isContactsMode ? 'contacts' : 'réservations'
  const entityPluralCap = isContactsMode ? 'Contacts' : 'Réservations'
  const createLabel = isContactsMode ? 'Créer contact' : 'Créer réservation'
  const emptyLabel = isContactsMode ? 'Aucun contact.' : 'Aucune réservation.'
  const mobileLabel = isContactsMode ? 'Simuler un contact mobile' : 'Simuler une réservation mobile'
  const pendingLabel = isContactsMode ? 'Contacts en attente' : 'Réservations en attente'

  const [customer, setCustomer] = useState('')
  const [items, setItems] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [scanCode, setScanCode] = useState('')
  const [message, setMessage] = useState('')

  const now = new Date()
  const monthlyCount = reservations.filter((r) => {
    const d = new Date(r.createdAt)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length

  const remaining = subscription.monthlyLimit == null ? '∞' : Math.max(0, subscription.monthlyLimit - monthlyCount)
  const pendingReservations = useMemo(
    () => reservations.filter((r) => r.status === 'pending'),
    [reservations],
  )
  const totalCommission = useMemo(
    () => reservations
      .filter((r) => r.status === 'confirmed')
      .reduce((sum, r) => sum + Number(r.commissionAmount || 0), 0),
    [reservations],
  )

  function handleCreate(e) {
    e.preventDefault()
    const parsedTotal = Number(totalAmount || 0)
    const { success, reservation, message: errorMessage } = addReservation({
      customer: customer || null,
      items: items ? items.split(',').map((s) => s.trim()).filter(Boolean) : [],
      totalAmount: parsedTotal,
    })

    if (!success) {
      setMessage(errorMessage)
      return
    }

    setMessage(`${isContactsMode ? 'Contact' : 'Réservation'} créé${isContactsMode ? '' : 'e'} (${reservation.code}) avec reçu ${reservation.receiptNumber}`)
    setCustomer('')
    setItems('')
    setTotalAmount('')
  }

  function handleScan(e) {
    e.preventDefault()
    const code = scanCode.trim()
    if (!code) return setMessage(`Entrez un code de ${entitySingular} à valider`)
    const found = reservations.find((r) => r.code === code || r.receiptNumber === code)
    if (!found) return setMessage('Code ou reçu inconnu')
    if (found.status === 'expired') return setMessage(`${isContactsMode ? 'Contact' : 'Réservation'} expiré${isContactsMode ? '' : 'e'}`)
    if (found.status === 'confirmed') return setMessage(`${isContactsMode ? 'Contact' : 'Réservation'} déjà validé${isContactsMode ? '' : 'e'}`)
    validateReservation(found.id)
    setMessage(`${isContactsMode ? 'Contact' : 'Réservation'} ${found.code} validé${isContactsMode ? '' : 'e'}. Commission plateforme: ${formatCurrency(calculateReservationCommission(found.totalAmount, found.commissionPercent))}`)
    setScanCode('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{entityPluralCap}</h2>
          <div className="text-sm text-gray-600">
            Plan: {subscription.plan} · {entityPluralCap} restant{isContactsMode ? 's' : 'es'} ce mois: <strong>{remaining}</strong>
          </div>
        </div>
        <div className="text-right text-sm text-gray-600">
          <div>{pendingLabel}: <strong>{pendingReservations.length}</strong></div>
          <div>Commission validée: <strong>{formatCurrency(totalCommission)}</strong></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-medium mb-3">Paramètres métier des {entityPlural}</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Société active</label>
              <div className="w-full border px-3 py-2 rounded bg-gray-50">{companyProfile.name}</div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Expiration par défaut</label>
              <div className="w-full border px-3 py-2 rounded bg-gray-50">{reservationSettings.expirationHours}h</div>
              <div className="text-xs text-gray-500 mt-1">Durée en heures avant expiration automatique d'une {entitySingular}.</div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Commission</label>
              <div className="w-full border px-3 py-2 rounded bg-gray-50">{reservationSettings.commissionPercent}%</div>
              <div className="text-xs text-gray-500 mt-1">Commission plateforme prélevée après validation.</div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Instruction reçue du super admin</label>
              <div className="w-full border px-3 py-2 rounded bg-gray-50 text-sm text-gray-700">
                {companyProfile.reservationNotes || 'Aucune instruction spécifique.'}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-medium mb-2">{mobileLabel}</h3>
          <label className="block text-sm">Nom client</label>
          <input value={customer} onChange={(e) => setCustomer(e.target.value)} className="w-full border px-2 py-1 rounded mb-2" />
          <label className="block text-sm">Articles</label>
          <input value={items} onChange={(e) => setItems(e.target.value)} className="w-full border px-2 py-1 rounded mb-2" placeholder="Article 1, Article 2" />
          <label className="block text-sm">Montant à payer sur place</label>
          <input value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} className="w-full border px-2 py-1 rounded mb-3" placeholder="12500" />
          <div className="rounded bg-orange-50 border border-orange-100 px-3 py-2 text-xs text-orange-800 mb-3">
            {isContactsMode ? 'Contact' : 'Réservation'} valable {reservationSettings.expirationHours}h. Commission prévue: {reservationSettings.commissionPercent}% à la validation.
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-blue-600 text-white rounded">{createLabel}</button>
            <button type="button" onClick={() => { setCustomer(''); setItems(''); setTotalAmount(''); setMessage('') }} className="px-3 py-1 border rounded">Réinitialiser</button>
          </div>
          {message && <div className="mt-3 text-sm text-gray-700">{message}</div>}
        </form>

        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-medium mb-2">Valider une {entitySingular} (code / QR / reçu)</h3>
          <form onSubmit={handleScan} className="flex gap-2">
            <input value={scanCode} onChange={(e) => setScanCode(e.target.value)} placeholder="Code MPS ou reçu REC-..." className="flex-1 border px-2 py-1 rounded" />
            <button className="px-3 py-1 bg-green-600 text-white rounded">Valider</button>
          </form>
          <div className="text-xs text-gray-500 mt-2">La validation confirme {isContactsMode ? 'le contact' : 'la réservation'} et calcule la commission de Mes Promos.</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="font-medium mb-3">Liste des {entityPlural}</h3>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-gray-600 border-b">
                <th className="py-2">Code / reçu</th>
                <th className="py-2">Client</th>
                <th className="py-2">Articles</th>
                <th className="py-2">Montant</th>
                <th className="py-2">Expire dans</th>
                <th className="py-2">Commission</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-b align-top">
                  <td className="py-3">
                    <div className="font-medium">{r.code}</div>
                    <div className="text-xs text-gray-500">{r.receiptNumber || '—'}</div>
                  </td>
                  <td className="py-3">{r.customer ?? 'Anonyme'}</td>
                  <td className="py-3">{r.items?.join(', ') || '—'}</td>
                  <td className="py-3">{formatCurrency(r.totalAmount)}</td>
                  <td className="py-3 text-sm text-gray-500">{formatRemaining(r)}</td>
                  <td className="py-3">
                    <div className="text-sm">{r.commissionPercent ?? reservationSettings.commissionPercent}%</div>
                    <div className="text-xs text-gray-500">{formatCurrency(r.commissionAmount)}</div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${statusBadge(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="py-3">
                    <div className="relative inline-block">
                      <ActionMenu
                        reservation={r}
                        onValidate={() => validateReservation(r.id)}
                        onExpire={() => expireReservation(r.id)}
                        onDelete={() => deleteReservation(r.id)}
                        onSaveExpiry={(hours) => updateReservation(r.id, { expiryHours: hours })}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-4 text-sm text-gray-500">{emptyLabel}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ActionMenu({ reservation, onValidate, onExpire, onDelete, onSaveExpiry }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [hours, setHours] = useState(reservation.expiryHours ?? 48)

  function saveExpiry() {
    onSaveExpiry(Number(hours))
    setEditing(false)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="px-2 py-1 border rounded text-sm">Actions ▾</button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border rounded shadow z-20">
          <div className="p-2 space-y-1">
            {reservation.status === 'pending' && (
              <button onClick={() => { onValidate(); setOpen(false) }} className="w-full text-left px-2 py-1 rounded hover:bg-gray-100">Valider et facturer</button>
            )}
            <button onClick={() => setEditing((v) => !v)} className="w-full text-left px-2 py-1 rounded hover:bg-gray-100">Modifier expiration</button>
            {editing && (
              <div className="p-2">
                <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full border px-2 py-1 rounded text-sm mb-2" />
                <div className="flex gap-2">
                  <button onClick={saveExpiry} className="px-2 py-1 bg-blue-600 text-white rounded text-sm">Enregistrer</button>
                  <button onClick={() => setEditing(false)} className="px-2 py-1 border rounded text-sm">Annuler</button>
                </div>
              </div>
            )}
            <button onClick={() => { onExpire(); setOpen(false) }} className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-red-600">Marquer expirée</button>
            <button onClick={() => { onDelete(); setOpen(false) }} className="w-full text-left px-2 py-1 rounded hover:bg-gray-100">Supprimer</button>
          </div>
        </div>
      )}
    </div>
  )
}
