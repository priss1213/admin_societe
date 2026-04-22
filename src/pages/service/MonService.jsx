import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
const JOURS_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function apiFetch(path, options = {}) {
  const token = localStorage.getItem('societe_token')
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  }).then(async r => {
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data.detail || `Erreur ${r.status}`)
    return data
  })
}

// ─── Composants réutilisables ─────────────────────────────────────────────────

function StatusDot({ status }) {
  const map = {
    available: { color: '#22C55E', label: 'Disponible' },
    busy:      { color: '#F59E0B', label: 'Occupé' },
    closed:    { color: '#EF4444', label: 'Fermé' },
  }
  const s = map[status] ?? map.closed
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      <span style={{ fontWeight: 600, color: s.color, fontSize: 13 }}>{s.label}</span>
    </span>
  )
}

function Card({ title, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 24, marginBottom: 20 }}>
      {title && <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#111827' }}>{title}</h3>}
      {children}
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function MonService() {
  const { token } = useAuth()
  const { companyProfile } = useApp()
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const loadProvider = useCallback(() => {
    setLoading(true)
    setNotFound(false)
    apiFetch('/api/services/me')
      .then(r => {
        setProvider(r.data ?? r)
        setNotFound(false)
        setLoading(false)
      })
      .catch(err => {
        if (err.message.includes('introuvable') || err.message.includes('404')) {
          setNotFound(true)
          setProvider(null)
        }
        setLoading(false)
      })
  }, [token])

  useEffect(() => { loadProvider() }, [loadProvider])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div style={{ color: '#6B7280' }}>Chargement…</div>
    </div>
  )

  if (notFound) return <NoServiceAccount companyProfile={companyProfile} onCreated={loadProvider} />

  if (!provider) return null

  const isNew = !provider.category

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>

      {/* Bannière profil incomplet */}
      {isNew && (
        <div style={{
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)',
          border: '1px solid #FCD34D',
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🎉</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#92400E', marginBottom: 4 }}>
              Votre espace prestataire est prêt !
            </div>
            <div style={{ fontSize: 13, color: '#78350F', lineHeight: 1.5 }}>
              Pour apparaître dans la liste des prestataires sur l'application mobile,
              complétez votre profil ci-dessous : ajoutez votre <strong>catégorie</strong>,
              vos <strong>horaires</strong> et une <strong>description</strong>.
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 32 }}>{provider.category?.icon ?? '🔧'}</span>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>{provider.name}</h1>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
            {provider.category?.name ?? <span style={{ color: '#F59E0B', fontWeight: 600 }}>⚠️ Catégorie non définie</span>}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <StatusDot status={provider.availability_status} />
        </div>
      </div>

      <SectionStatut provider={provider} onRefresh={loadProvider} />
      <SectionCategorie provider={provider} onRefresh={loadProvider} />
      <SectionProfil provider={provider} onRefresh={loadProvider} />
      <SectionHoraires provider={provider} onRefresh={loadProvider} />
      {provider.category?.is_pharmacy && <SectionGardes onRefresh={loadProvider} />}
      <SectionStats provider={provider} />
    </div>
  )
}

// ─── No account ───────────────────────────────────────────────────────────────

function NoServiceAccount({ companyProfile, onCreated }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const init = async () => {
    setLoading(true)
    setError(null)
    try {
      await apiFetch('/api/services/me/init', { method: 'POST' })
      onCreated()
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🔧</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Profil prestataire non initialisé</h2>
        <p style={{ color: '#6B7280', fontSize: 14, maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.6 }}>
          Votre espace prestataire n'a pas encore été créé.
          Cliquez sur le bouton ci-dessous pour l'initialiser automatiquement
          {companyProfile?.name ? ` depuis votre société "${companyProfile.name}"` : ''}.
        </p>
        {error && (
          <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 16, padding: '8px 16px', background: '#FEE2E2', borderRadius: 8, display: 'inline-block' }}>
            {error}
          </div>
        )}
        <button
          onClick={init}
          disabled={loading}
          style={{
            padding: '12px 28px', borderRadius: 12, border: 'none',
            background: loading ? '#9CA3AF' : '#E8500A',
            color: '#fff', fontWeight: 700, fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
        >
          {loading ? '⏳ Initialisation…' : '🚀 Initialiser mon espace prestataire'}
        </button>
      </div>
    </Card>
  )
}

// ─── Catégorie ────────────────────────────────────────────────────────────────

function SectionCategorie({ provider, onRefresh }) {
  const [categories, setCategories] = useState([])
  const [selected, setSelected] = useState(provider.category?.id ?? '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    apiFetch('/api/services/categories')
      .then(r => setCategories(r.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setSelected(provider.category?.id ?? '')
  }, [provider])

  const save = async () => {
    if (!selected) return
    setSaving(true)
    setMsg(null)
    try {
      await apiFetch('/api/services/me', {
        method: 'PUT',
        body: JSON.stringify({ category_id: Number(selected) }),
      })
      setMsg({ ok: true, text: 'Catégorie mise à jour ✓' })
      onRefresh()
    } catch (e) {
      setMsg({ ok: false, text: e.message })
    } finally { setSaving(false) }
  }

  return (
    <Card title="📂 Catégorie de service">
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 5 }}>
            Sélectionnez votre métier *
          </label>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box' }}
          >
            <option value="">Choisir une catégorie…</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={save}
          disabled={saving || !selected || Number(selected) === provider.category?.id}
          style={{
            padding: '9px 22px', borderRadius: 8, border: 'none',
            background: (saving || !selected || Number(selected) === provider.category?.id) ? '#E5E7EB' : '#E8500A',
            color: (saving || !selected || Number(selected) === provider.category?.id) ? '#9CA3AF' : '#fff',
            fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {saving ? 'Enregistrement…' : 'Confirmer'}
        </button>
      </div>
      {msg && (
        <div style={{ marginTop: 10, padding: '7px 14px', borderRadius: 8, background: msg.ok ? '#DCFCE7' : '#FEE2E2', color: msg.ok ? '#15803D' : '#DC2626', fontSize: 13, fontWeight: 600 }}>
          {msg.text}
        </div>
      )}
    </Card>
  )
}

// ─── Statut en temps réel ─────────────────────────────────────────────────────

function SectionStatut({ provider, onRefresh }) {
  const [busy, setBusy] = useState(false)
  const statuts = [
    { value: 'available', label: 'Disponible', color: '#22C55E', emoji: '🟢' },
    { value: 'busy',      label: 'Occupé',     color: '#F59E0B', emoji: '🟡' },
    { value: 'closed',    label: 'Fermé',       color: '#EF4444', emoji: '🔴' },
  ]

  const changeStatut = async (value) => {
    if (value === provider.availability_status) return
    setBusy(true)
    try {
      await apiFetch('/api/services/me/status', {
        method: 'PUT',
        body: JSON.stringify({ status: value }),
      })
      onRefresh()
    } catch (e) {
      alert(e.message)
    } finally { setBusy(false) }
  }

  return (
    <Card title="📡 Statut en temps réel">
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {statuts.map(s => {
          const isActive = provider.availability_status === s.value
          return (
            <button
              key={s.value}
              disabled={busy}
              onClick={() => changeStatut(s.value)}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                border: `2px solid ${isActive ? s.color : '#E5E7EB'}`,
                background: isActive ? s.color + '18' : '#fff',
                color: isActive ? s.color : '#6B7280',
                cursor: busy ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                transition: 'all 0.15s',
                opacity: busy && !isActive ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: 16 }}>{s.emoji}</span>
              {s.label}
              {isActive && <span style={{ marginLeft: 4, fontSize: 11, background: s.color, color: '#fff', borderRadius: 6, padding: '1px 6px' }}>Actuel</span>}
            </button>
          )
        })}
      </div>
    </Card>
  )
}

// ─── Profil ───────────────────────────────────────────────────────────────────

function SectionProfil({ provider, onRefresh }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    description: '',
    quartier: '',
    address: '',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    setForm({
      name:        provider.name        || '',
      phone:       provider.phone       || '',
      whatsapp:    provider.whatsapp    || '',
      description: provider.description || '',
      quartier:    provider.quartier    || '',
      address:     provider.address     || '',
    })
  }, [provider])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const save = async () => {
    setSaving(true)
    setMsg(null)
    try {
      await apiFetch('/api/services/me', {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      setMsg({ ok: true, text: 'Profil mis à jour ✓' })
      onRefresh()
    } catch (e) {
      setMsg({ ok: false, text: e.message })
    } finally { setSaving(false) }
  }

  return (
    <Card title="👤 Mon profil">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Nom / Raison sociale *" value={form.name} onChange={v => set('name', v)} />
        <Field label="Téléphone" value={form.phone} onChange={v => set('phone', v)} placeholder="+242 06..." />
        <Field label="WhatsApp" value={form.whatsapp} onChange={v => set('whatsapp', v)} placeholder="+242 06..." />
        <Field label="Quartier" value={form.quartier} onChange={v => set('quartier', v)} />
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Adresse" value={form.address} onChange={v => set('address', v)} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 5 }}>Description</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
            placeholder="Décrivez votre activité…"
          />
        </div>
      </div>

      {msg && (
        <div style={{ margin: '12px 0 0', padding: '8px 14px', borderRadius: 8, background: msg.ok ? '#DCFCE7' : '#FEE2E2', color: msg.ok ? '#15803D' : '#DC2626', fontSize: 13, fontWeight: 600 }}>
          {msg.text}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving || !form.name}
        style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, border: 'none', background: saving ? '#9CA3AF' : '#E8500A', color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}
      >
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </Card>
  )
}

// ─── Horaires ─────────────────────────────────────────────────────────────────

function SectionHoraires({ provider, onRefresh }) {
  const defaultHours = Object.fromEntries(
    JOURS.map(j => [j, { closed: false, open: '08:00', close: '18:00' }])
  )
  const [horaires, setHoraires] = useState(defaultHours)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (provider.opening_hours && Object.keys(provider.opening_hours).length > 0) {
      setHoraires({ ...defaultHours, ...provider.opening_hours })
    }
  }, [provider])

  const setJour = (jour, key, val) =>
    setHoraires(h => ({ ...h, [jour]: { ...h[jour], [key]: val } }))

  const save = async () => {
    setSaving(true)
    setMsg(null)
    try {
      await apiFetch('/api/services/me', {
        method: 'PUT',
        body: JSON.stringify({ opening_hours: horaires }),
      })
      setMsg({ ok: true, text: 'Horaires mis à jour ✓' })
      onRefresh()
    } catch (e) {
      setMsg({ ok: false, text: e.message })
    } finally { setSaving(false) }
  }

  return (
    <Card title="🕐 Horaires d'ouverture">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {JOURS.map((jour, i) => {
          const h = horaires[jour] ?? { closed: false, open: '08:00', close: '18:00' }
          return (
            <div key={jour} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < JOURS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              <span style={{ width: 36, fontSize: 13, fontWeight: 700, color: '#374151' }}>{JOURS_LABELS[i]}</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!h.closed}
                  onChange={e => setJour(jour, 'closed', !e.target.checked)}
                  style={{ accentColor: '#E8500A', width: 16, height: 16 }}
                />
                <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{h.closed ? 'Fermé' : 'Ouvert'}</span>
              </label>
              {!h.closed && (
                <>
                  <input
                    type="time"
                    value={h.open}
                    onChange={e => setJour(jour, 'open', e.target.value)}
                    style={{ padding: '4px 8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13 }}
                  />
                  <span style={{ color: '#9CA3AF', fontSize: 12 }}>–</span>
                  <input
                    type="time"
                    value={h.close}
                    onChange={e => setJour(jour, 'close', e.target.value)}
                    style={{ padding: '4px 8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13 }}
                  />
                </>
              )}
            </div>
          )
        })}
      </div>

      {msg && (
        <div style={{ margin: '12px 0 0', padding: '8px 14px', borderRadius: 8, background: msg.ok ? '#DCFCE7' : '#FEE2E2', color: msg.ok ? '#15803D' : '#DC2626', fontSize: 13, fontWeight: 600 }}>
          {msg.text}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        style={{ marginTop: 14, padding: '10px 24px', borderRadius: 10, border: 'none', background: saving ? '#9CA3AF' : '#E8500A', color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}
      >
        {saving ? 'Enregistrement…' : 'Enregistrer les horaires'}
      </button>
    </Card>
  )
}

// ─── Gardes (pharmacies uniquement) ──────────────────────────────────────────

function SectionGardes({ onRefresh }) {
  const [duties, setDuties] = useState([])
  const [loading, setLoading] = useState(true)

  const loadDuties = () => {
    setLoading(true)
    apiFetch('/api/services/me/duties')
      .then(r => { setDuties(r.data ?? r ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(loadDuties, [])

  const toggle = async (id) => {
    try {
      await apiFetch(`/api/services/me/duties/${id}/toggle`, { method: 'PUT' })
      loadDuties()
      onRefresh()
    } catch (e) { alert(e.message) }
  }

  return (
    <Card title="💊 Mes gardes">
      {loading ? <p style={{ color: '#6B7280', fontSize: 13 }}>Chargement…</p> : duties.length === 0 ? (
        <p style={{ color: '#9CA3AF', fontSize: 13 }}>Aucune garde planifiée. L'administrateur peut en créer pour vous.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {duties.map(d => (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
              borderRadius: 12, border: `1px solid ${d.is_active ? '#DDD6FE' : '#E5E7EB'}`,
              background: d.is_active ? '#F5F3FF' : '#fff',
            }}>
              <span style={{ fontSize: 22 }}>{d.is_active ? '💊' : '📅'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{d.duty_date}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{d.start_time} – {d.end_time}</div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 700,
                background: d.is_active ? '#7C3AED22' : '#E5E7EB',
                color: d.is_active ? '#7C3AED' : '#6B7280',
              }}>
                {d.is_active ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={() => toggle(d.id)}
                style={{
                  padding: '5px 12px', borderRadius: 8, border: 'none',
                  background: d.is_active ? '#FEF3C7' : '#DCFCE7',
                  color: d.is_active ? '#D97706' : '#16A34A',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                }}
              >
                {d.is_active ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ─── Statistiques ─────────────────────────────────────────────────────────────

function SectionStats({ provider }) {
  const stats = [
    { emoji: '👁️', label: 'Vues du profil',  value: provider.views_count    ?? 0 },
    { emoji: '📞', label: 'Contacts reçus',   value: provider.contacts_count ?? 0 },
    { emoji: '⭐', label: 'Note moyenne',      value: provider.rating > 0 ? provider.rating.toFixed(1) : '—' },
  ]

  return (
    <Card title="📊 Mes statistiques">
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            flex: '1 1 140px', textAlign: 'center', padding: '18px 12px',
            background: '#F9FAFB', borderRadius: 14, border: '1px solid #E5E7EB',
          }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{s.emoji}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Champ texte réutilisable ─────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder = '' }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 5 }}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box' }}
      />
    </div>
  )
}
