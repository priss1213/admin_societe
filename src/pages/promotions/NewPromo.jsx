import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import PromoCard from '../../components/ui/PromoCard'

export default function NewPromo() {
  const navigate = useNavigate()
  const { addPromo, promos, subscription, categories, companyProfile } = useApp() 
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const cat = companyProfile?.companyType || ''  // ← utilise companyType au lieu de category
  const isServiceOnly = cat === 'service'
  const isProductOnly = cat === 'product'
const isBoth = cat === 'both' || cat === ''


  // Step 1 - Type
  const [promoType, setPromoType] = useState('Produit')
  const [statusInitial, setStatusInitial] = useState('Actif') // Actif | Brouillon | Planifié
  const [category, setCategory] = useState(categories[0] || 'Autre')

  // Step 2 - Infos
  const [title, setTitle] = useState('')
  const [reference, setReference] = useState('')
  const [brand, setBrand] = useState('')
  const [description, setDescription] = useState('')
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState('g')

  // Step 3 - Prix
  const [priceNormal, setPriceNormal] = useState('')
  const [pricePromo, setPricePromo] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [stock, setStock] = useState('')
  const [featured, setFeatured] = useState(false)

  // Step 4 - Médias
  const [images, setImages] = useState([])

  const [errors, setErrors] = useState({})
  const used = promos.filter((p) => p.active).length
  const quota = subscription?.promoQuota ?? 10
  const canCreateActive = quota == null || used < quota

  const progress = useMemo(() => ({1: 'Type', 2: 'Infos', 3: 'Prix', 4: 'Médias'}), [])

  function readFiles(files) {
    const arr = Array.from(files || [])
    arr.forEach((f) => {
      const reader = new FileReader()
      reader.onload = () => setImages((s) => [...s, reader.result])
      reader.readAsDataURL(f)
    })
  }

  function removeImage(idx) { setImages((s) => s.filter((_, i) => i !== idx)) }

  function validateStep(current) {
    const e = {}
    if (current === 1) {
      if (!promoType) e.promoType = 'Choisissez le type'
      if (!category) e.category = 'Choisissez une catégorie'
    }
    if (current === 2) {
      if (!title.trim()) e.title = 'Nom du produit requis'
    }
    if (current === 3) {
      if (!priceNormal) e.priceNormal = 'Prix normal requis'
      if (!pricePromo) e.pricePromo = 'Prix promo requis'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (!validateStep(step)) return
    if (step < 4) setStep((s) => s + 1)
  }

  function back() { if (step > 1) setStep((s) => s - 1); else navigate('/promos') }

  async function saveWithStatus(statusInitialValue) {
    if (!validateStep(3)) { setStep(3); return }
    setError('')
    setMessage('')
    const statusMap = { Actif: 'active', Brouillon: 'draft', Planifié: 'planned' }
    const promo = {
      title: title.trim(),
      description: description.trim(),
      category,
      type: promoType,
      reference: reference.trim(),
      brand: brand.trim(),
      weight: weight ? `${weight}${weightUnit}` : undefined,
      priceNormal: priceNormal || undefined,
      pricePromo: pricePromo || undefined,
      dateStart: dateStart || undefined,
      dateEnd: dateEnd || undefined,
      stock: stock ? Number(stock) : undefined,
      featured,
      images,
      active: statusMap[statusInitialValue] === 'active',
      status: statusMap[statusInitialValue] || 'draft',
      views: 0,
      reservations: 0,
      expiresIn: dateEnd ? `jusqu'à ${dateEnd}` : undefined,
    }
    const result = await addPromo(promo)
    if (!result?.success) {
      setError(result?.message || 'Impossible d’enregistrer la promotion.')
      return
    }
    setMessage(result.message)
    navigate('/promos')
  }

  function handlePublish() {
    saveWithStatus(statusInitial)
  }

  function handleSaveDraft() {
    saveWithStatus('Brouillon')
  }

  function renderStepper() {
    return (
      <div className="flex items-center gap-4 mb-4">
        {Object.entries(progress).map(([k, lbl]) => (
          <div key={k} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${Number(k) === step ? 'bg-blue-600 text-white' : Number(k) < step ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{Number(k) < step ? '✓' : k}</div>
            <div className="text-sm text-gray-600">{lbl}</div>
            {Number(k) !== 4 && <div className="w-8 h-0.5 bg-gray-200 mx-2" />}
          </div>
        ))}
      </div>
    )
  }

  const previewPromo = {
    id: 'preview',
    title: title || 'Titre de la promo',
    description: description || '',
    category: category || 'Autre',
    featured,
    active: statusInitial === 'Actif',
    expiresIn: dateEnd ? `jusqu'à ${dateEnd}` : '—',
    views: 0,
    reservations: 0,
    icon: '🏷️',
    image: images[0] || null,
  }

  // Helpers for price/reduction display
  
  const normalNum = Number(priceNormal) || 0
  const promoNum = Number(pricePromo) || 0
  const reductionAmount = normalNum > promoNum ? normalNum - promoNum : promoNum > normalNum ? promoNum - normalNum : 0
  const reductionPercent = normalNum > 0 ? Math.round((reductionAmount / normalNum) * 100) : 0
  const formatNumber = (v) => (Number.isFinite(Number(v)) ? Number(v).toLocaleString('fr-FR') : v)
  

  return (
    <div className="max-w-2xl bg-white rounded shadow p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Nouvelle promotion</h3>
        <button onClick={handleSaveDraft} className="px-3 py-1 border rounded">Enregistrer en brouillon</button>
      </div>

      {error && <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {message && <div className="mt-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}

      {renderStepper()}

      {step === 1 && (
        <div>
          {/* Type de promotion — verrouillé si la société a une catégorie fixe */}
          <h4 className="font-medium text-sm mb-3">Type de société</h4>

          {(() => {
            // Déterminer si la société est verrouillée sur un type
            const cat = companyProfile?.category?.toLowerCase() || ''
            const isServiceOnly = cat.includes('service')
            const isProductOnly = !isServiceOnly && cat !== ''

            // Auto-sélectionner au premier rendu
            if (isServiceOnly && promoType !== 'Service') setPromoType('Service')
            if (isProductOnly && promoType !== 'Produit') setPromoType('Produit')

            return isServiceOnly || isProductOnly ? (
              // Société verrouillée — afficher juste un badge non cliquable
              <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg w-fit">
                <span className="text-lg">{isServiceOnly ? '🔧' : '🛍️'}</span>
                <span className="font-semibold text-blue-800">
                  {isServiceOnly ? 'Service' : 'Produit'}
                </span>
                <span className="text-xs text-blue-500 ml-2">
                  (défini par votre profil société)
                </span>
              </div>
            ) : (
              // Société sans type fixe — choix libre
              <div className="flex gap-3 mb-4">
                <button type="button"
                  onClick={() => { setPromoType('Produit'); setCategory('') }}
                  className={`px-4 py-2 rounded ${promoType === 'Produit' ? 'bg-blue-100 border border-blue-300 font-medium' : 'bg-gray-100'}`}>
                  🛍️ Produit
                </button>
                <button type="button"
                  onClick={() => { setPromoType('Service'); setCategory('') }}
                  className={`px-4 py-2 rounded ${promoType === 'Service' ? 'bg-blue-100 border border-blue-300 font-medium' : 'bg-gray-100'}`}>
                  🔧 Service
                </button>
              </div>
            )
          })()}

          {/* Catégorie */}
          <h4 className="font-medium text-sm mb-2">Catégorie *</h4>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm mb-1"
          >
            <option value="">— Choisir une catégorie —</option>
            {categories
              .filter((c) => {
                const type = typeof c === 'object' ? c.type : 'product'
                return promoType === 'Service'
                  ? type === 'service'
                  : type === 'product' || type === 'both' || type === 'product'
              })
              .map((c) => {
                const name = typeof c === 'object' ? c.name : c
                return <option key={name} value={name}>{name}</option>
              })}
          </select>
          {errors.category && <div className="text-red-600 text-sm mt-1">{errors.category}</div>}

          {/* Statut initial */}
          <h4 className="font-medium text-sm mb-2 mt-4">Statut initial</h4>
          <div className="flex gap-3">
            <button type="button" disabled={!canCreateActive}
              onClick={() => setStatusInitial('Actif')}
              className={`px-3 py-1 rounded ${statusInitial === 'Actif' ? 'bg-blue-100' : 'bg-gray-100'} ${!canCreateActive ? 'opacity-50 cursor-not-allowed' : ''}`}>
              Actif
            </button>
            <button type="button" onClick={() => setStatusInitial('Brouillon')}
              className={`px-3 py-1 rounded ${statusInitial === 'Brouillon' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              Brouillon
            </button>
            <button type="button" onClick={() => setStatusInitial('Planifié')}
              className={`px-3 py-1 rounded ${statusInitial === 'Planifié' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              Planifié
            </button>
          </div>
          {!canCreateActive && (
            <div className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Le quota de promotions actives est atteint. Publiez en brouillon ou consultez votre abonnement.
            </div>
          )}
        </div>
      )}
            {step === 2 && (
        <div>
          <h4 className="font-medium text-sm mb-3">Informations du produit</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700">Nom du produit / service *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" />
              {errors.title && <div className="text-red-600 text-sm">{errors.title}</div>}
            </div>
            <div>
              <label className="block text-sm text-gray-700">Référence (optionnel)</label>
              <input value={reference} onChange={(e) => setReference(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Marque</label>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700">Poids</label>
                <input value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Unité</label>
                <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option>g</option>
                  <option>kg</option>
                  <option>ml</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h4 className="font-medium text-sm mb-3">Tarification</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700">Prix normal *</label>
              <input value={priceNormal} onChange={(e) => setPriceNormal(e.target.value)} className="w-full border rounded px-3 py-2" />
              {errors.priceNormal && <div className="text-red-600 text-sm">{errors.priceNormal}</div>}
            </div>
            <div>
              <label className="block text-sm text-gray-700">Prix promo *</label>
              <input value={pricePromo} onChange={(e) => setPricePromo(e.target.value)} className="w-full border rounded px-3 py-2" />
              {errors.pricePromo && <div className="text-red-600 text-sm">{errors.pricePromo}</div>}
            </div>
          </div>

          <div className="mt-4 bg-green-50 p-3 rounded">
            {priceNormal && pricePromo && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">Réduction calculée</div>
                <div className="font-semibold text-green-800">{`– ${formatNumber(reductionAmount)} FCFA`}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm text-gray-700">Date début</label>
              <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Date fin</label>
              <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-700">Stock disponible (optionnel)</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setStock((s) => (Number(s || 0) - 1).toString())} className="px-2 py-1 border rounded">-</button>
              <input value={stock} onChange={(e) => setStock(e.target.value)} className="w-24 border rounded px-3 py-2 text-center" />
              <button type="button" onClick={() => setStock((s) => (Number(s || 0) + 1).toString())} className="px-2 py-1 border rounded">+</button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Mettre en vedette</label>
            </div>
            <div className="text-sm text-gray-600">Aperçu réduction: {priceNormal && pricePromo ? `-${reductionPercent}%` : '—'}</div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h4 className="font-medium text-sm mb-3">Photos du produit</h4>
          <div className="border-dashed border-2 border-gray-200 p-4 rounded text-center mb-3">Ajouter des photos (JPG, PNG — max 5MB chacune)
            <div className="mt-2">
              <input type="file" accept="image/*" multiple onChange={(e) => readFiles(e.target.files)} />
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} alt={`mini-${i}`} className="w-16 h-16 object-cover rounded" />
                <button onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-white rounded-full px-1 border">✕</button>
              </div>
            ))}
            {images.length < 5 && (
              <div className="w-16 h-16 border-dashed rounded flex items-center justify-center">+</div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">Aperçu de la carte</div>
            <div className="max-w-sm">
              <PromoCard promo={previewPromo} onEdit={()=>{}} onToggle={()=>{}} />
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div>
          <button onClick={back} className="px-4 py-2 border rounded">← Retour</button>
        </div>
        <div className="flex items-center gap-3">
          {step < 4 ? (
            <button onClick={next} className="px-4 py-2 bg-blue-600 text-white rounded">Suivant →</button>
          ) : (
            <button onClick={handlePublish} className="px-4 py-2 bg-green-600 text-white rounded">Publier la promotion</button>
          )}
        </div>
      </div>
    </div>
  )
}
