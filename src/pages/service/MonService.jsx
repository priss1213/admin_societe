import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import './MonService.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
const JOURS_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function apiFetch(path, options = {}) {
  const token =
    localStorage.getItem('societe_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('societe_token') ||
    sessionStorage.getItem('token')
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  }).then(async r => {
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      if (r.status === 401) throw new Error('Session expirée. Veuillez vous reconnecter.')
      throw new Error(data.detail || `Erreur ${r.status}`)
    }
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

function Card({ id, title, subtitle, right, children, className = '' }) {
  return (
    <div id={id} className={`ms-card ${className}`.trim()}>
      {(title || right) && (
        <div className="ms-card-head">
          <div>
            {title && <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>{title}</h3>}
            {subtitle && <p className="ms-card-subtitle">{subtitle}</p>}
          </div>
          {right && <div>{right}</div>}
        </div>
      )}
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

  const shouldAutoInitPharmacy = (companyProfile?.category || '').toLowerCase().includes('pharm')

  if (notFound) return <NoServiceAccount companyProfile={companyProfile} onCreated={loadProvider} autoStart={shouldAutoInitPharmacy} />

  if (!provider) return null

  const isNew = !provider.category
  const isPharmacySpace = provider.category?.is_pharmacy || (companyProfile?.category || '').toLowerCase().includes('pharm')
  const profileChecks = [
    Boolean(provider.category),
    Boolean(provider.description),
    Boolean(provider.phone || provider.whatsapp),
    Boolean(provider.opening_hours && Object.keys(provider.opening_hours).length > 0),
  ]
  const completedCount = profileChecks.filter(Boolean).length
  const progressPercent = Math.round((completedCount / profileChecks.length) * 100)

  const navItems = [
    { anchor: '#statut',    icon: '📡', label: 'Statut' },
    { anchor: '#categorie', icon: '📂', label: 'Catégorie' },
    { anchor: '#profil',    icon: '👤', label: 'Profil' },
    { anchor: '#photos',    icon: '📷', label: 'Photos' },
    { anchor: '#horaires',  icon: '🕐', label: 'Horaires' },
    ...(provider.category?.is_pharmacy ? [{ anchor: '#gardes', icon: '💊', label: 'Gardes' }] : []),
  ]

  return (
    <div className="ms-page">

      {/* Bannière profil incomplet */}
      {isNew && (
        <div className="ms-banner-new">
          <span style={{ fontSize: 24, flexShrink: 0 }}>🎉</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#92400E', marginBottom: 4 }}>
              {isPharmacySpace ? 'Votre espace pharmacie est prêt !' : 'Votre espace prestataire est prêt !'}
            </div>
            <div style={{ fontSize: 13, color: '#78350F', lineHeight: 1.5 }}>
              Pour apparaître dans la liste des prestataires sur l'application mobile,
              complétez votre profil : ajoutez votre <strong>catégorie</strong>,
              vos <strong>horaires</strong> et une <strong>description</strong>.
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="ms-header">
        <span style={{ fontSize: 32 }}>{provider.category?.icon ?? (isPharmacySpace ? '💊' : '🔧')}</span>
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

      {/* Navigation rapide */}
      <nav className="ms-quick-nav" aria-label="Navigation sections">
        {navItems.map(item => (
          <a key={item.anchor} href={item.anchor} className="ms-quick-nav-item">
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <SectionQuickOverview provider={provider} completedCount={completedCount} progressPercent={progressPercent} />

      <div className="ms-section-group">
        <span className="ms-section-group-label">Visibilité et disponibilité</span>
      </div>
      <SectionStatut provider={provider} onRefresh={loadProvider} />
      <SectionCategorie provider={provider} onRefresh={loadProvider} />

      <div className="ms-section-group">
        <span className="ms-section-group-label">Informations de contact</span>
      </div>
      <SectionProfil provider={provider} onRefresh={loadProvider} />
      <SectionPhotos provider={provider} onRefresh={loadProvider} />
      <SectionHoraires provider={provider} onRefresh={loadProvider} />

      {provider.category?.is_pharmacy && (
        <>
          <div className="ms-section-group">
            <span className="ms-section-group-label">Pharmacie de garde</span>
          </div>
          <SectionGardes onRefresh={loadProvider} />
        </>
      )}
    </div>
  )
}

// ─── No account ───────────────────────────────────────────────────────────────

function NoServiceAccount({ companyProfile, onCreated, autoStart = false }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [autoTriggered, setAutoTriggered] = useState(false)

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

  useEffect(() => {
    if (!autoStart || autoTriggered || loading) return
    setAutoTriggered(true)
    init()
  }, [autoStart, autoTriggered, loading])

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

// ─── Résumé rapide ───────────────────────────────────────────────────────────

function SectionQuickOverview({ provider, completedCount, progressPercent }) {
  const stats = [
    { label: 'Progression du profil', value: `${progressPercent}%` },
    { label: 'Éléments complétés', value: `${completedCount}/4` },
    { label: 'Vues', value: provider.views_count ?? 0 },
    { label: 'Contacts', value: provider.contacts_count ?? 0 },
  ]

  return (
    <Card title="🧭 Résumé rapide" subtitle="Suivez l'état de votre fiche prestataire en un coup d'œil.">
      <div className="ms-stats-grid">
        {stats.map(item => (
          <div key={item.label} className="ms-stat-item">
            <div className="ms-stat-label">{item.label}</div>
            <div className="ms-stat-value">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="ms-progress-wrap" aria-label="Progression du profil">
        <div className="ms-progress-bar" style={{ width: `${progressPercent}%` }} />
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
    <Card
      id="categorie"
      title="📂 Catégorie de service"
      subtitle="Choisissez le métier principal affiché sur votre fiche."
    >
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
    <Card
      id="statut"
      title="📡 Statut en temps réel"
      subtitle="Ce statut informe les clients de votre disponibilité immédiate."
    >
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
    <Card
      id="profil"
      title="👤 Mon profil"
      subtitle="Renseignez des informations claires pour faciliter la prise de contact."
    >
      <div className="ms-grid-2">
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

function SectionPhotos({ provider, onRefresh }) {
  const [photos, setPhotos] = useState(Array.isArray(provider.work_photos) ? provider.work_photos : [])
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    setPhotos(Array.isArray(provider.work_photos) ? provider.work_photos : [])
  }, [provider])

  const toDisplayUrl = (value) => (value && !value.startsWith('http') ? `${API_URL}${value}` : value)

  const addPhoto = () => {
    const trimmed = url.trim()
    if (!trimmed) return
    if (!/^https?:\/\//i.test(trimmed)) {
      setMsg({ ok: false, text: 'L\'URL doit commencer par http:// ou https://.' })
      return
    }
    if (photos.includes(trimmed)) {
      setMsg({ ok: false, text: 'Cette photo est déjà ajoutée.' })
      return
    }
    setPhotos(prev => [...prev, trimmed])
    setUrl('')
    setMsg(null)
  }

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const save = async () => {
    setSaving(true)
    setMsg(null)
    try {
      await apiFetch('/api/services/me', {
        method: 'PUT',
        body: JSON.stringify({ work_photos: photos }),
      })
      setMsg({ ok: true, text: 'Photos de réalisations mises à jour ✓' })
      onRefresh()
    } catch (e) {
      setMsg({ ok: false, text: e.message })
    } finally {
      setSaving(false)
    }
  }

  const upload = async () => {
    if (!file) return
    setUploading(true)
    setMsg(null)
    try {
      const token = localStorage.getItem('societe_token')
      const form = new FormData()
      form.append('file', file)
      const response = await fetch(`${API_URL}/api/services/me/work-photos/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: form,
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.detail || `Erreur ${response.status}`)

      const uploadedUrl = payload?.data?.url
      if (uploadedUrl) {
        setPhotos(prev => (prev.includes(uploadedUrl) ? prev : [...prev, uploadedUrl]))
        setMsg({ ok: true, text: 'Photo téléversée ✓' })
      }
      setFile(null)
      onRefresh()
    } catch (e) {
      setMsg({ ok: false, text: e.message })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card
      id="photos"
      title="📷 Réalisations"
      subtitle="Ajoutez des photos de vos travaux pour renforcer la confiance des clients."
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://..."
          style={{ flex: 1, minWidth: 240, padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14 }}
        />
        <button
          onClick={addPhoto}
          type="button"
          style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#2563EB', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          Ajouter
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 10 }}>
        <input
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          style={{ fontSize: 13 }}
        />
        <button
          onClick={upload}
          type="button"
          disabled={uploading || !file}
          style={{ padding: '9px 14px', borderRadius: 8, border: 'none', background: (uploading || !file) ? '#E5E7EB' : '#0EA5E9', color: (uploading || !file) ? '#9CA3AF' : '#fff', fontWeight: 700, fontSize: 13, cursor: (uploading || !file) ? 'not-allowed' : 'pointer' }}
        >
          {uploading ? 'Téléversement…' : 'Téléverser depuis mon appareil'}
        </button>
      </div>

      {photos.length > 0 && (
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
          {photos.map((p, i) => (
            <div key={`${p}-${i}`} style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
              <div style={{ height: 88, background: '#F8FAFC' }}>
                <img
                  src={toDisplayUrl(p)}
                  alt={`Réalisation ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              </div>
              <button
                onClick={() => removePhoto(i)}
                type="button"
                style={{ width: '100%', border: 'none', borderTop: '1px solid #E5E7EB', background: '#FEF2F2', color: '#B91C1C', fontSize: 12, fontWeight: 700, padding: '6px 8px', cursor: 'pointer' }}
              >
                Retirer
              </button>
            </div>
          ))}
        </div>
      )}

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
        {saving ? 'Enregistrement…' : 'Enregistrer les photos'}
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
    <Card
      id="horaires"
      title="🕐 Horaires d'ouverture"
      subtitle="Indiquez vos créneaux habituels pour améliorer la confiance des clients."
    >
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
  const [quickLoading, setQuickLoading] = useState(false)

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

  const toggleTodayDuty = async () => {
    setQuickLoading(true)
    try {
      await apiFetch('/api/services/me/duties/quick-toggle', { method: 'POST' })
      loadDuties()
      onRefresh()
    } catch (e) {
      alert(e.message)
    } finally {
      setQuickLoading(false)
    }
  }

  return (
    <Card
      id="gardes"
      title="💊 Mes gardes"
      subtitle="Activez ou désactivez vos périodes de garde en un clic."
    >
      {loading ? <p style={{ color: '#6B7280', fontSize: 13 }}>Chargement…</p> : duties.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0 }}>Aucune garde planifiée. L'administrateur peut en créer pour vous.</p>
          <button
            onClick={toggleTodayDuty}
            disabled={quickLoading}
            style={{
              alignSelf: 'flex-start',
              padding: '7px 12px', borderRadius: 8, border: 'none',
              background: quickLoading ? '#9CA3AF' : '#7C3AED',
              color: '#fff', cursor: quickLoading ? 'not-allowed' : 'pointer',
              fontSize: 12, fontWeight: 700,
            }}
          >
            {quickLoading ? 'Activation…' : "Activer garde d'aujourd'hui"}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <button
              onClick={toggleTodayDuty}
              disabled={quickLoading}
              style={{
                padding: '6px 12px', borderRadius: 8, border: '1px solid #DDD6FE',
                background: '#F5F3FF', color: '#6D28D9', cursor: quickLoading ? 'not-allowed' : 'pointer',
                fontSize: 12, fontWeight: 700,
              }}
            >
              {quickLoading ? 'Mise à jour…' : "Basculer garde d'aujourd'hui"}
            </button>
          </div>
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

// ─── Champ texte réutilisable ─────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder = '' }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 5 }}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box' }}
      />
    </div>
  )
}
