import React, { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const PAYMENT_METHODS = [
  'Airtel Money',
  'Moov Money',
  'Carte Visa',
  'Mastercard',
  'Virement bancaire',
]

const HORAIRES_DEFAUT = {
  Lundi:    { ouvert: true,  debut: '08:00', fin: '18:00' },
  Mardi:    { ouvert: true,  debut: '08:00', fin: '18:00' },
  Mercredi: { ouvert: true,  debut: '08:00', fin: '18:00' },
  Jeudi:    { ouvert: true,  debut: '08:00', fin: '18:00' },
  Vendredi: { ouvert: true,  debut: '08:00', fin: '18:00' },
  Samedi:   { ouvert: true,  debut: '08:00', fin: '16:00' },
  Dimanche: { ouvert: false, debut: '09:00', fin: '13:00' },
}

export default function MonMagasin() {
  const { companyProfile, companyId, refreshCompanyProfile } = useApp()
  const { token } = useAuth()

  // Masquer certaines sections pour pharmacies/services
  const isPharmacy = (companyProfile?.category || '').toLowerCase().includes('pharm')
  const hasServiceSpace = companyProfile?.companyType === 'service' || companyProfile?.companyType === 'both' || isPharmacy
  const isServiceOnly = hasServiceSpace && companyProfile?.companyType !== 'both'

  const [saving, setSaving]     = useState(false)
  const [message, setMessage]   = useState(null)
  const [locating, setLocating] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: '',
    description: '', website: '', logo_url: '',
    latitude: '', longitude: '',
  })
  const [horaires, setHoraires]     = useState(HORAIRES_DEFAUT)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [logoFile, setLogoFile]     = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  useEffect(() => {
    if (!companyProfile) return
    setForm({
      name:        companyProfile.name        || '',
      phone:       companyProfile.phone       || '',
      address:     companyProfile.address     || '',
      city:        companyProfile.city        || '',
      description: companyProfile.description || '',
      website:     companyProfile.website     || '',
      logo_url:    companyProfile.logo_url    || '',
      latitude:    companyProfile.latitude    != null ? String(companyProfile.latitude)  : '',
      longitude:   companyProfile.longitude   != null ? String(companyProfile.longitude) : '',
    })
    if (companyProfile.logo_url) setLogoPreview(companyProfile.logo_url)
    setPaymentMethods(Array.isArray(companyProfile.payment_methods) ? companyProfile.payment_methods : [])
    if (companyProfile.opening_hours) {
      try {
        const h = typeof companyProfile.opening_hours === 'string'
          ? JSON.parse(companyProfile.opening_hours)
          : companyProfile.opening_hours
        if (h && Object.keys(h).length > 0) setHoraires({ ...HORAIRES_DEFAUT, ...h })
      } catch {}
    }
  }, [companyProfile])

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  function obtenirPosition() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          latitude:  String(pos.coords.latitude.toFixed(6)),
          longitude: String(pos.coords.longitude.toFixed(6)),
        }))
        setLocating(false)
        notify('Position GPS récupérée !', 'success')
      },
      () => { setLocating(false); notify('Impossible de récupérer la position.', 'error') },
    )
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const setHoraire = (jour, key, value) =>
    setHoraires(h => ({ ...h, [jour]: { ...h[jour], [key]: value } }))

  function togglePaymentMethod(method) {
    setPaymentMethods((current) =>
      current.includes(method)
        ? current.filter((item) => item !== method)
        : [...current, method]
    )
  }

  function notify(text, type = 'success') {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3500)
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Nom du magasin requis'
    if (!form.phone.trim()) e.phone = 'Numéro de téléphone requis'
    if (form.website && !/^https?:\/\/.+/.test(form.website.trim()))
      e.website = 'URL invalide (doit commencer par http:// ou https://)'
    if (form.latitude && isNaN(parseFloat(form.latitude)))
      e.latitude = 'Latitude invalide'
    if (form.longitude && isNaN(parseFloat(form.longitude)))
      e.longitude = 'Longitude invalide'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!companyId || !token) return
    if (!validate()) return
    setSaving(true)
    try {
      let logoUrl = form.logo_url
      if (logoFile) {
        const fd = new FormData()
        fd.append('file', logoFile)
        const res = await fetch(`${API_URL}/api/companies/${companyId}/logo`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          notify(data.detail || 'Erreur lors du téléversement du logo.', 'error')
          return
        }
        logoUrl = data.logo_url || data.company?.logo_url || logoUrl
      }

      const payload = {
        name:          form.name,
        phone:         form.phone,
        address:       form.address,
        city:          form.city,
        description:   form.description,
        website:       form.website,
        logo_url:      logoUrl,
        latitude:      form.latitude  ? parseFloat(form.latitude)  : null,
        longitude:     form.longitude ? parseFloat(form.longitude) : null,
        opening_hours: horaires,
        payment_methods: paymentMethods,
      }

      const res = await fetch(`${API_URL}/api/companies/${companyId}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setForm((current) => ({ ...current, logo_url: logoUrl }))
        setLogoPreview(logoUrl || null)
        await refreshCompanyProfile()
        notify('Profil mis à jour avec succès !')
        setLogoFile(null)
      } else {
        notify(data.detail || 'Erreur lors de la sauvegarde.', 'error')
      }
    } catch {
      notify('Erreur réseau.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const initial = (form.name || 'M')[0].toUpperCase()

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mon Magasin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Complétez les informations visibles sur l'application mobile.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-60">
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
          message.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>{message.text}</div>
      )}

      {/* Logo */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-bold text-base mb-4">Logo du magasin</h2>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-2 border-orange-200 overflow-hidden bg-orange-50 flex items-center justify-center flex-shrink-0">
            {logoPreview
              ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              : <span className="text-3xl font-bold text-orange-600">{isPharmacy ? '💊' : initial}</span>}
          </div>
          <div>
            <label className="cursor-pointer px-4 py-2 border border-orange-300 rounded-lg text-sm font-medium text-orange-700 hover:bg-orange-50">
              Choisir un logo
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
            <p className="text-xs text-gray-400 mt-2">JPG, PNG — max 5 Mo</p>
          </div>
        </div>
      </div>

      {/* Infos générales */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-bold text-base mb-4">Informations générales</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du magasin *</label>
            <input value={form.name} onChange={e => { set('name', e.target.value); setFormErrors(f => ({ ...f, name: undefined })) }}
              className={`w-full border rounded-lg px-3 py-2 text-sm ${formErrors.name ? 'border-red-400' : ''}`} placeholder="ex : Super Marché Prix Import" />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
            <input value={form.phone} onChange={e => { set('phone', e.target.value); setFormErrors(f => ({ ...f, phone: undefined })) }}
              className={`w-full border rounded-lg px-3 py-2 text-sm ${formErrors.phone ? 'border-red-400' : ''}`} placeholder="+241 XX XX XX XX" />
            {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ex : Bord de mer, Libreville" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <input value={form.city} onChange={e => set('city', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Libreville" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
            <input value={form.website} onChange={e => { set('website', e.target.value); setFormErrors(f => ({ ...f, website: undefined })) }}
              className={`w-full border rounded-lg px-3 py-2 text-sm ${formErrors.website ? 'border-red-400' : ''}`} placeholder="https://monsite.ga" />
            {formErrors.website && <p className="text-red-500 text-xs mt-1">{formErrors.website}</p>}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              placeholder="Décrivez votre établissement..." />
          </div>
        </div>
      </div>

      {/* GPS */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base">Localisation GPS</h2>
          <button onClick={obtenirPosition} disabled={locating}
            className="px-3 py-1.5 text-sm border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50">
            {locating ? 'Localisation...' : 'Ma position actuelle'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-4">Permet aux clients d'obtenir un itinéraire vers votre magasin.</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input value={form.latitude} onChange={e => { set('latitude', e.target.value); setFormErrors(f => ({ ...f, latitude: undefined })) }}
              className={`w-full border rounded-lg px-3 py-2 text-sm font-mono ${formErrors.latitude ? 'border-red-400' : ''}`} placeholder="0.3924" />
            {formErrors.latitude && <p className="text-red-500 text-xs mt-1">{formErrors.latitude}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input value={form.longitude} onChange={e => { set('longitude', e.target.value); setFormErrors(f => ({ ...f, longitude: undefined })) }}
              className={`w-full border rounded-lg px-3 py-2 text-sm font-mono ${formErrors.longitude ? 'border-red-400' : ''}`} placeholder="9.4536" />
            {formErrors.longitude && <p className="text-red-500 text-xs mt-1">{formErrors.longitude}</p>}
          </div>
        </div>
        {form.latitude && form.longitude && (
          <a href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`}
            target="_blank" rel="noreferrer"
            className="inline-block mt-3 text-xs text-orange-600 hover:underline">
            Vérifier sur Google Maps →
          </a>
        )}
      </div>

      {/* Horaires */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-bold text-base mb-4">Horaires d'ouverture</h2>
        <div className="space-y-2">
          {JOURS.map(jour => {
            const h = horaires[jour] || { ouvert: false, debut: '08:00', fin: '18:00' }
            return (
              <div key={jour} className={`flex items-center gap-4 p-3 rounded-lg ${h.ouvert ? 'bg-orange-50' : 'bg-gray-50'}`}>
                <span className={`w-24 text-sm font-medium flex-shrink-0 ${h.ouvert ? 'text-orange-800' : 'text-gray-400'}`}>{jour}</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={h.ouvert}
                    onChange={e => setHoraire(jour, 'ouvert', e.target.checked)}
                    className="w-4 h-4 accent-orange-600" />
                  <span className="text-xs text-gray-500">{h.ouvert ? 'Ouvert' : 'Fermé'}</span>
                </label>
                {h.ouvert && (
                  <>
                    <input type="time" value={h.debut}
                      onChange={e => setHoraire(jour, 'debut', e.target.value)}
                      className="border rounded px-2 py-1 text-sm" />
                    <span className="text-gray-400 text-sm">→</span>
                    <input type="time" value={h.fin}
                      onChange={e => setHoraire(jour, 'fin', e.target.value)}
                      className="border rounded px-2 py-1 text-sm" />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Moyens de paiement — masqué pour pharmacies et services */}
      {!isServiceOnly && (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-bold text-base mb-2">Moyens de paiement acceptés</h2>
        <p className="text-xs text-gray-400 mb-4">
          Laissez vide si votre magasin n'accepte pas de moyen de paiement spécifique à afficher.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((method) => {
            const checked = paymentMethods.includes(method)
            return (
              <label
                key={method}
                className={`flex items-center gap-3 rounded-lg border px-3 py-3 cursor-pointer ${
                  checked ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePaymentMethod(method)}
                  className="w-4 h-4 accent-orange-600"
                />
                <span className="text-sm font-medium text-gray-700">{method}</span>
              </label>
            )
          })}
        </div>
      </div>
      )}

      <div className="flex justify-end pb-6">
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-60 text-sm">
          {saving ? 'Sauvegarde en cours...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  )
}
