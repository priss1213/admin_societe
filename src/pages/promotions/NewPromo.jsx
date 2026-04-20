import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import PromoCard from '../../components/ui/PromoCard'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function NewPromo() {
  const navigate = useNavigate()
  const { addPromo, promos, subscription, categories, companyProfile } = useApp()
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const cat = companyProfile?.companyType || ''
  const isServiceOnly = cat === 'service'
  const isProductOnly = cat === 'product'
  const isBoth = cat === 'both' || cat === ''

  // Step 1 - Type
  const [promoType, setPromoType] = useState('Produit')
  const [statusInitial, setStatusInitial] = useState('Actif')
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

  // Step 5 - Collection
  const [collections, setCollections] = useState([])         // collections existantes
  const [collectionsLoading, setCollectionsLoading] = useState(false)
  const [collectionMode, setCollectionMode] = useState(null) // null | 'existing' | 'new'
  const [selectedCollectionId, setSelectedCollectionId] = useState(null)
  const [newCollectionTitle, setNewCollectionTitle] = useState('')
  const [newCollectionDescription, setNewCollectionDescription] = useState('')
  const [savedListingId, setSavedListingId] = useState(null) // id du listing créé à l'étape 4

  const [errors, setErrors] = useState({})
  const used = promos.filter((p) => p.active).length
  const quota = subscription?.promoQuota ?? 10
  const canCreateActive = quota == null || used < quota

  const progress = useMemo(() => ({
    1: 'Type', 2: 'Infos', 3: 'Prix', 4: 'Médias', 5: 'Collection'
  }), [])

  // Charger les collections existantes à l'étape 5
  useEffect(() => {
    if (step === 5) _loadCollections()
  }, [step])

  async function _loadCollections() {
    setCollectionsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/api/collections/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setCollections(data)
      }
    } catch (e) {
      console.error('Erreur chargement collections:', e)
    } finally {
      setCollectionsLoading(false)
    }
  }

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
    if (step < 5) setStep((s) => s + 1)
  }

  function back() { if (step > 1) setStep((s) => s - 1); else navigate('/promos') }

  // ── Sauvegarde du listing (appelée au step 4 → avant d'aller au step 5) ────
  async function saveListing(statusInitialValue) {
    if (!validateStep(3)) { setStep(3); return null }
    setError('')
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
      setError(result?.message || "Impossible d'enregistrer la promotion.")
      return null
    }
    return result?.id || result?.data?.id || null
  }

  // ── Publier → sauvegarder le listing puis aller au step 5 ─────────────────
  async function handlePublish() {
    const listingId = await saveListing(statusInitial)
    if (!listingId) return
    setSavedListingId(listingId)
    setStep(5) // aller à l'étape collection
  }

  function handleSaveDraft() {
    saveListing('Brouillon').then((id) => {
      if (id) navigate('/promos')
    })
  }

  // ── Step 5 : ajouter à une collection existante ───────────────────────────
  async function addToExistingCollection() {
    if (!selectedCollectionId || !savedListingId) return
    setError('')
    try {
      const token = localStorage.getItem('token')
      const col = collections.find((c) => c.id === selectedCollectionId)
      const currentIds = (col?.items || []).map((i) => i.listing?.id).filter(Boolean)
      const res = await fetch(`${API_BASE}/api/collections/${selectedCollectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listing_ids: [...currentIds, savedListingId] }),
      })
      if (!res.ok) throw new Error('Erreur')
      setMessage('Produit ajouté à la collection avec succès ✅')
      setTimeout(() => navigate('/promos'), 1500)
    } catch {
      setError("Impossible d'ajouter à la collection.")
    }
  }

  // ── Step 5 : créer une nouvelle collection avec ce listing ────────────────
  async function createNewCollection() {
    if (!newCollectionTitle.trim() || !savedListingId) return
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/api/collections/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newCollectionTitle.trim(),
          description: newCollectionDescription.trim() || undefined,
          status: 'active',
          listing_ids: [savedListingId],
        }),
      })
      if (!res.ok) throw new Error('Erreur')
      setMessage('Nouvelle collection créée avec succès ✅')
      setTimeout(() => navigate('/promos'), 1500)
    } catch {
      setError('Impossible de créer la collection.')
    }
  }

  function renderStepper() {
    return (
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {Object.entries(progress).map(([k, lbl]) => (
          <div key={k} className="flex items-center gap-1 shrink-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
              ${Number(k) === step ? 'bg-blue-600 text-white' :
                Number(k) < step ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {Number(k) < step ? '✓' : k}
            </div>
            <div className={`text-xs ${Number(k) === step ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
              {lbl}
            </div>
            {Number(k) !== 5 && <div className="w-6 h-0.5 bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>
    )
  }

  const normalNum = Number(priceNormal) || 0
  const promoNum = Number(pricePromo) || 0
  const reductionAmount = normalNum > promoNum ? normalNum - promoNum : promoNum > normalNum ? promoNum - normalNum : 0
  const reductionPercent = normalNum > 0 ? Math.round((reductionAmount / normalNum) * 100) : 0
  const formatNumber = (v) => (Number.isFinite(Number(v)) ? Number(v).toLocaleString('fr-FR') : v)

  const previewPromo = {
    id: 'preview', title: title || 'Titre de la promo',
    description: description || '', category: category || 'Autre',
    featured, active: statusInitial === 'Actif',
    expiresIn: dateEnd ? `jusqu'à ${dateEnd}` : '—',
    views: 0, reservations: 0, icon: '🏷️', image: images[0] || null,
  }

  return (
    <div className="max-w-2xl bg-white rounded shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Nouvelle promotion</h3>
        {step < 5 && (
          <button onClick={handleSaveDraft} className="px-3 py-1 border rounded text-sm">
            Enregistrer en brouillon
          </button>
        )}
      </div>

      {error && <div className="mt-2 mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {message && <div className="mt-2 mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}

      {renderStepper()}

      {/* ── Step 1 : Type ──────────────────────────────────────────────────── */}
      {step === 1 && (
        <div>
          <h4 className="font-medium text-sm mb-3">Type de société</h4>
          {(() => {
            const cat = companyProfile?.category?.toLowerCase() || ''
            const isServiceOnly = cat.includes('service')
            const isProductOnly = !isServiceOnly && cat !== ''
            if (isServiceOnly && promoType !== 'Service') setPromoType('Service')
            if (isProductOnly && promoType !== 'Produit') setPromoType('Produit')
            return isServiceOnly || isProductOnly ? (
              <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg w-fit">
                <span className="text-lg">{isServiceOnly ? '🔧' : '🛍️'}</span>
                <span className="font-semibold text-blue-800">{isServiceOnly ? 'Service' : 'Produit'}</span>
                <span className="text-xs text-blue-500 ml-2">(défini par votre profil société)</span>
              </div>
            ) : (
              <div className="flex gap-3 mb-4">
                <button type="button" onClick={() => { setPromoType('Produit'); setCategory('') }}
                  className={`px-4 py-2 rounded ${promoType === 'Produit' ? 'bg-blue-100 border border-blue-300 font-medium' : 'bg-gray-100'}`}>
                  🛍️ Produit
                </button>
                <button type="button" onClick={() => { setPromoType('Service'); setCategory('') }}
                  className={`px-4 py-2 rounded ${promoType === 'Service' ? 'bg-blue-100 border border-blue-300 font-medium' : 'bg-gray-100'}`}>
                  🔧 Service
                </button>
              </div>
            )
          })()}

          <h4 className="font-medium text-sm mb-2">Catégorie *</h4>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm mb-1">
            <option value="">— Choisir une catégorie —</option>
            {categories.filter((c) => {
              const type = typeof c === 'object' ? c.type : 'product'
              return promoType === 'Service' ? type === 'service' : type === 'product' || type === 'both'
            }).map((c) => {
              const name = typeof c === 'object' ? c.name : c
              return <option key={name} value={name}>{name}</option>
            })}
          </select>
          {errors.category && <div className="text-red-600 text-sm mt-1">{errors.category}</div>}

          <h4 className="font-medium text-sm mb-2 mt-4">Statut initial</h4>
          <div className="flex gap-3">
            <button type="button" disabled={!canCreateActive} onClick={() => setStatusInitial('Actif')}
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

      {/* ── Step 2 : Infos ─────────────────────────────────────────────────── */}
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
                  <option>g</option><option>kg</option><option>ml</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3 : Prix ──────────────────────────────────────────────────── */}
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
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Mettre en vedette
            </label>
            <div className="text-sm text-gray-600">Aperçu réduction: {priceNormal && pricePromo ? `-${reductionPercent}%` : '—'}</div>
          </div>
        </div>
      )}

      {/* ── Step 4 : Médias ────────────────────────────────────────────────── */}
      {step === 4 && (
        <div>
          <h4 className="font-medium text-sm mb-3">Photos du produit</h4>
          <p className="text-xs text-gray-500 mb-3">
            Ajoutez plusieurs photos du même produit sous différents angles. Chaque photo sera visible individuellement dans l'app.
          </p>
          <div className="border-dashed border-2 border-gray-200 p-4 rounded text-center mb-3">
            Ajouter des photos (JPG, PNG — max 5MB chacune)
            <div className="mt-2">
              <input type="file" accept="image/*" multiple onChange={(e) => readFiles(e.target.files)} />
            </div>
          </div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} alt={`mini-${i}`} className="w-16 h-16 object-cover rounded border" />
                <button onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-white rounded-full px-1 border text-xs">✕</button>
                {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs text-center rounded-b">principale</span>}
              </div>
            ))}
            {images.length < 8 && (
              <div className="w-16 h-16 border-dashed border-2 rounded flex items-center justify-center text-gray-400 text-2xl cursor-pointer"
                onClick={() => document.querySelector('input[type=file]').click()}>+</div>
            )}
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Aperçu de la carte</div>
            <div className="max-w-sm">
              <PromoCard promo={previewPromo} onEdit={() => {}} onToggle={() => {}} />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 5 : Collection ────────────────────────────────────────────── */}
      {step === 5 && (
        <div>
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-semibold">✅ Produit enregistré avec succès !</p>
            <p className="text-xs text-green-600 mt-1">
              Voulez-vous l'ajouter à une collection pour le regrouper avec d'autres produits ?
            </p>
          </div>

          {/* Choix du mode */}
          {!collectionMode && (
            <div className="space-y-3">
              <button onClick={() => setCollectionMode('existing')}
                className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
                <span className="text-2xl">📂</span>
                <div>
                  <div className="font-semibold text-sm">Ajouter à une collection existante</div>
                  <div className="text-xs text-gray-500">Regrouper avec des produits déjà créés</div>
                </div>
              </button>
              <button onClick={() => setCollectionMode('new')}
                className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all text-left">
                <span className="text-2xl">✨</span>
                <div>
                  <div className="font-semibold text-sm">Créer une nouvelle collection</div>
                  <div className="text-xs text-gray-500">Nouvelle promo groupée avec ce produit comme premier article</div>
                </div>
              </button>
              <button onClick={() => navigate('/promos')}
                className="w-full p-3 text-sm text-gray-500 hover:text-gray-700 text-center">
                Ignorer et terminer →
              </button>
            </div>
          )}

          {/* Mode : collection existante */}
          {collectionMode === 'existing' && (
            <div>
              <button onClick={() => setCollectionMode(null)} className="text-xs text-gray-400 mb-3 hover:text-gray-600">← Retour</button>
              <h4 className="font-medium text-sm mb-3">Choisir une collection</h4>
              {collectionsLoading ? (
                <div className="text-center py-8 text-gray-400">Chargement…</div>
              ) : collections.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>Aucune collection disponible.</p>
                  <button onClick={() => setCollectionMode('new')} className="mt-2 text-blue-600 text-sm underline">
                    Créer une nouvelle collection
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {collections.map((col) => (
                    <button key={col.id} onClick={() => setSelectedCollectionId(col.id)}
                      className={`w-full flex items-center justify-between p-3 border-2 rounded-lg transition-all text-left
                        ${selectedCollectionId === col.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div>
                        <div className="font-medium text-sm">{col.title}</div>
                        <div className="text-xs text-gray-500">{col.items?.length || 0} produit(s)</div>
                      </div>
                      {selectedCollectionId === col.id && <span className="text-blue-600">✓</span>}
                    </button>
                  ))}
                </div>
              )}
              {selectedCollectionId && (
                <button onClick={addToExistingCollection}
                  className="mt-4 w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                  Ajouter à cette collection →
                </button>
              )}
            </div>
          )}

          {/* Mode : nouvelle collection */}
          {collectionMode === 'new' && (
            <div>
              <button onClick={() => setCollectionMode(null)} className="text-xs text-gray-400 mb-3 hover:text-gray-600">← Retour</button>
              <h4 className="font-medium text-sm mb-3">Nouvelle collection</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700">Titre de la collection *</label>
                  <input value={newCollectionTitle} onChange={(e) => setNewCollectionTitle(e.target.value)}
                    placeholder="ex: Promo Semaine du 20 avril"
                    className="w-full border rounded px-3 py-2 mt-1" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Description (optionnel)</label>
                  <textarea value={newCollectionDescription} onChange={(e) => setNewCollectionDescription(e.target.value)}
                    rows={3} placeholder="Décrivez cette collection…"
                    className="w-full border rounded px-3 py-2 mt-1" />
                </div>
              </div>
              <button onClick={createNewCollection} disabled={!newCollectionTitle.trim()}
                className="mt-4 w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50">
                Créer la collection →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      {step < 5 && (
        <div className="mt-6 flex items-center justify-between">
          <button onClick={back} className="px-4 py-2 border rounded">← Retour</button>
          <div className="flex items-center gap-3">
            {step < 4 ? (
              <button onClick={next} className="px-4 py-2 bg-blue-600 text-white rounded">Suivant →</button>
            ) : (
              <button onClick={handlePublish} className="px-4 py-2 bg-green-600 text-white rounded">
                Publier la promotion
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
