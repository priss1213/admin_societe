import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'

function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'à l\'instant'
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} h`
  const days = Math.floor(hrs / 24)
  return `${days} j`
}

export default function Reservations() {
  const { reservations, addReservation, validateReservation, expireReservation, deleteReservation, subscription } = useApp()
  const [customer, setCustomer] = useState('')
  const [items, setItems] = useState('')
  const [scanCode, setScanCode] = useState('')
  const [message, setMessage] = useState('')

  const now = new Date()
  const monthlyCount = reservations.filter((r) => {
    const d = new Date(r.createdAt)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length

  const remaining = subscription.monthlyLimit == null ? '∞' : Math.max(0, subscription.monthlyLimit - monthlyCount)

  function handleCreate(e) {
    e.preventDefault()
    const { success, reservation, message } = addReservation({ customer: customer || null, items: items ? items.split(',').map((s) => s.trim()) : [] })
    if (!success) {
      setMessage(message)
      return
    }
    setMessage(`Réservation créée (${reservation.code})`)
    setCustomer('')
    setItems('')
  }

  function handleScan(e) {
    e.preventDefault()
    const code = scanCode.trim()
    if (!code) return setMessage('Entrez un code à valider')
    const found = reservations.find((r) => r.code === code)
    if (!found) return setMessage('Code inconnu')
    if (found.status === 'expired') return setMessage('Code expiré')
    if (found.status === 'collected') return setMessage('Code déjà utilisé')
    validateReservation(found.id)
    setMessage(`Réservation ${code} validée`) 
    setScanCode('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Réservations</h2>
        <div className="text-sm text-gray-600">Plan: {subscription.plan} — Restant ce mois: <strong>{remaining}</strong></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-medium mb-2">Simuler réception (mobile)</h3>
          <label className="block text-sm">Nom client</label>
          <input value={customer} onChange={(e) => setCustomer(e.target.value)} className="w-full border px-2 py-1 rounded mb-2" />
          <label className="block text-sm">Articles (séparés par ,)</label>
          <input value={items} onChange={(e) => setItems(e.target.value)} className="w-full border px-2 py-1 rounded mb-2" />
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-blue-600 text-white rounded">Créer réservation</button>
            <button type="button" onClick={() => { setCustomer(''); setItems(''); setMessage('') }} className="px-3 py-1 border rounded">Réinitialiser</button>
          </div>
          {message && <div className="mt-3 text-sm text-gray-700">{message}</div>}
        </form>

        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-medium mb-2">Valider un code / QR</h3>
          <form onSubmit={handleScan} className="flex gap-2">
            <input value={scanCode} onChange={(e) => setScanCode(e.target.value)} placeholder="Collez le code ici" className="flex-1 border px-2 py-1 rounded" />
            <button className="px-3 py-1 bg-green-600 text-white rounded">Valider</button>
          </form>
          <div className="text-xs text-gray-500 mt-2">Vous pouvez coller ici le code ou le scanner depuis l'application mobile côté client.</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="font-medium mb-3">Liste des réservations</h3>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-gray-600 border-b">
                  <th className="py-2">Code / QR</th>
                  <th className="py-2">Client</th>
                  <th className="py-2">Articles</th>
                  <th className="py-2">Expire dans</th>
                  <th className="py-2">Statut</th>
                  <th className="py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{r.code}</div>
                      <div className="text-xs text-gray-500">{/* QR placeholder */}</div>
                    </div>
                  </td>
                  <td className="py-3">{r.customer ?? 'Anonyme'}</td>
                  <td className="py-3">{r.items?.join(', ') || '—'}</td>
                  <td className="py-3 text-sm text-gray-500">{formatRemaining(r)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : r.status === 'collected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.status}</span>
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
                  <td colSpan={6} className="py-4 text-sm text-gray-500">Aucune réservation.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function EditExpiryButton({ reservation, onSave }) {
  const [editing, setEditing] = useState(false)
  const [hours, setHours] = useState(reservation.expiryHours ?? 24)

  function save() {
    onSave(Number(hours))
    setEditing(false)
  }

  return editing ? (
    <div className="flex items-center gap-2">
      <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className="w-20 border px-2 py-1 rounded text-sm" />
      <button onClick={save} className="px-2 py-1 bg-blue-600 text-white rounded text-sm">OK</button>
      <button onClick={() => setEditing(false)} className="px-2 py-1 border rounded text-sm">Annuler</button>
    </div>
  ) : (
    <button onClick={() => setEditing(true)} className="px-2 py-1 border rounded text-sm">Période</button>
  )
}

function formatRemaining(r) {
  if (r.status === 'collected') return '—'
  if (r.status === 'expired') return 'Expiré'
  const hoursAllowed = r.expiryHours != null ? Number(r.expiryHours) : 24
  const cutoff = r.createdAt + hoursAllowed * 60 * 60 * 1000
  const remainingMs = cutoff - Date.now()
  if (remainingMs <= 0) return 'Expiré'
  const hrs = Math.floor(remainingMs / (1000 * 60 * 60))
  const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

function ActionMenu({ reservation, onValidate, onExpire, onDelete, onSaveExpiry }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [hours, setHours] = useState(reservation.expiryHours ?? 24)

  function toggle() {
    setOpen((v) => !v)
    setEditing(false)
  }

  function saveExpiry() {
    onSaveExpiry(Number(hours))
    setEditing(false)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button onClick={toggle} className="px-2 py-1 border rounded text-sm">Actions ▾</button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow z-20">
          <div className="p-2">
            {reservation.status === 'pending' && (
              <button onClick={() => { onValidate(); setOpen(false) }} className="w-full text-left px-2 py-1 rounded hover:bg-gray-100">Valider</button>
            )}
            {/* <button onClick={() => setEditing((v) => !v)} className="w-full text-left px-2 py-1 rounded hover:bg-gray-100">Modifier période d'expiration</button> */}
            {editing && (
              <div className="p-2">
                <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full border px-2 py-1 rounded text-sm mb-2" />
                <div className="flex gap-2">
                  <button onClick={saveExpiry} className="px-2 py-1 bg-blue-600 text-white rounded text-sm">Enregistrer</button>
                  <button onClick={() => setEditing(false)} className="px-2 py-1 border rounded text-sm">Annuler</button>
                </div>
              </div>
            )}
            <button onClick={() => { onExpire(); setOpen(false) }} className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-red-600">Expirer</button>
            <button onClick={() => { onDelete(); setOpen(false) }} className="w-full text-left px-2 py-1 rounded hover:bg-gray-100">Supprimer</button>
          </div>
        </div>
      )}
    </div>
  )
}
