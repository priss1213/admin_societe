import React, { useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Produit vide par défaut ───────────────────────────────────────────────────
function emptyProduct() {
  return {
    _id: Date.now() + Math.random(),
    title: '',
    description: '',
    brand: '',
    reference: '',
    weight: '',
    weightUnit: 'g',
    priceNormal: '',
    pricePromo: '',
    stock: '',
    mainImage: null,       // base64
    extraImages: [],       // [base64]
  }
}

function fileToBase64(file) {
  return new Promise((resolve) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.readAsDataURL(file)
  })
}

function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
  return lines.slice(1).map((line) => {
    const values = line.split(',')
    const obj = {}
    headers.forEach((h, i) => { obj[h] = (values[i] || '').trim() })
    return obj
  })
}

function rowToProduct(row) {
  return {
    ...emptyProduct(),
    title: row.nom || row.title || row.name || '',
    description: row.description || row.desc || '',
    brand: row.marque || row.brand || '',
    reference: row.reference || row.ref || '',
    weight: row.poids || row.weight || '',
    priceNormal: row.prix_normal || row.price || row.prix || '',
    pricePromo: row.prix_promo || row.promo_price || '',
    stock: row.stock || '',
  }
}

export default function NewPromo() {
  const navigate = useNavigate()
  const { token, promos, subscription, categories, companyProfile } = useApp()
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const extraImageInputRef = useRef(null)

  const [step, setStep] = useState(1)
  const [globalError, setGlobalError] = useState('')
  const [globalMessage, setGlobalMessage] = useState('')
  const [saving, setSaving] = useState(false)

  // Étape 1
  const [promoTitle, setPromoTitle] = useState('')
  const [promoCategory, setPromoCategory] = useState('')
  const [promoDescription, setPromoDescription] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [statusInitial, setStatusInitial] = useState('active')
  const [featured, setFeatured] = useState(false)
  const [step1Errors, setStep1Errors] = useState({})

  // Étape 2
  const [products, setProducts] = useState([emptyProduct()])
  const [activeProductIdx, setActiveProductIdx] = useState(0)
  const [importLoading, setImportLoading] = useState(false)
  const [productErrors, setProductErrors] = useState({})

  const used = promos.filter((p) => p.active).length
  const quota = subscription?.promoQuota ?? 10
  const canCreateActive = quota == null || used < quota

  function validateStep1() {
    const e = {}
    if (!promoTitle.trim()) e.promoTitle = 'Titre requis'
    if (!promoCategory) e.promoCategory = 'Catégorie requise'
    setStep1Errors(e)
    return Object.keys(e).length === 0
  }

  function validateProducts() {
    const e = {}
    products.forEach((p, i) => {
      if (!p.title.trim()) e[`${i}_title`] = 'Nom requis'
      if (!p.priceNormal) e[`${i}_priceNormal`] = 'Prix normal requis'
      if (!p.pricePromo) e[`${i}_pricePromo`] = 'Prix promo requis'
    })
    setProductErrors(e)
    return Object.keys(e).length === 0
  }

  function goNext() {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateProducts()) return
    setStep((s) => s + 1)
  }

  function goBack() {
    if (step === 1) navigate('/promos')
    else setStep((s) => s - 1)
  }

  function updateProduct(idx, patch) {
    setProducts((ps) => ps.map((p, i) => i === idx ? { ...p, ...patch } : p))
  }

  function addProduct() {
    setProducts((ps) => [...ps, emptyProduct()])
    setActiveProductIdx(products.length)
  }

  function removeProduct(idx) {
    if (products.length === 1) return
    setProducts((ps) => ps.filter((_, i) => i !== idx))
    setActiveProductIdx(Math.max(0, idx - 1))
  }

  async function handleMainImage(idx, file) {
    if (!file) return
    const b64 = await fileToBase64(file)
    updateProduct(idx, { mainImage: b64 })
  }

  async function handleExtraImages(idx, files) {
    const arr = Array.from(files || [])
    const results = await Promise.all(arr.map((f) => fileToBase64(f)))
    const extras = results.map((b64) => ({ base64: b64, label: '' }))
    setProducts((ps) => ps.map((p, i) => i === idx
      ? { ...p, extraImages: [...p.extraImages, ...extras].slice(0, 8) }
      : p
    ))
  }

  function updateExtraLabel(productIdx, extraIdx, label) {
    setProducts((ps) => ps.map((p, i) => i === productIdx
      ? { ...p, extraImages: p.extraImages.map((e, j) => j === extraIdx ? { ...e, label } : e) }
      : p
    ))
  }

  function removeExtraImage(productIdx, extraIdx) {
    setProducts((ps) => ps.map((p, i) => i === productIdx
      ? { ...p, extraImages: p.extraImages.filter((_, j) => j !== extraIdx) }
      : p
    ))
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportLoading(true)
    setGlobalError('')
    try {
      const ext = file.name.split('.').pop().toLowerCase()
      if (ext === 'json') {
        const text = await file.text()
        const data = JSON.parse(text)
        const rows = Array.isArray(data) ? data : data.products || data.produits || []
        setProducts(rows.map(rowToProduct).length > 0 ? rows.map(rowToProduct) : [emptyProduct()])
        setActiveProductIdx(0)
      } else if (ext === 'csv') {
        const text = await file.text()
        const rows = parseCSV(text)
        setProducts(rows.map(rowToProduct).length > 0 ? rows.map(rowToProduct) : [emptyProduct()])
        setActiveProductIdx(0)
      } else if (ext === 'xlsx' || ext === 'xls') {
        if (!window.XLSX) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }
        const buffer = await file.arrayBuffer()
        const wb = window.XLSX.read(buffer, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = window.XLSX.utils.sheet_to_json(ws, { defval: '' })
        const imported = rows.map((row) => {
          const n = {}
          Object.keys(row).forEach((k) => { n[k.toLowerCase().replace(/\s+/g, '_')] = row[k] })
          return rowToProduct(n)
        })
        setProducts(imported.length > 0 ? imported : [emptyProduct()])
        setActiveProductIdx(0)
      } else {
        setGlobalError('Format non supporté. Utilisez CSV, JSON ou Excel (.xlsx).')
      }
    } catch (err) {
      setGlobalError(`Erreur import : ${err.message}`)
    } finally {
      setImportLoading(false)
      e.target.value = ''
    }
  }

  function downloadTemplate() {
    const header = 'nom,description,marque,reference,poids,prix_normal,prix_promo,stock'
    const example = 'Riz parfumé 5kg,Riz de qualité supérieure,Marque X,REF001,5kg,5000,3500,100'
    const blob = new Blob([`${header}\n${example}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'template_produits.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  async function handlePublish() {
    if (!validateProducts()) { setStep(2); return }
    setSaving(true)
    setGlobalError('')
    try {
      const authToken = token || localStorage.getItem('societe_token')
      const listingIds = []

      // ── Étape 1 : créer les listings en DRAFT (ne consomme pas le quota) ──
      for (const product of products) {
        const allImages = [product.mainImage, ...product.extraImages].filter(Boolean)
        const discount = product.priceNormal && product.pricePromo
          ? Math.round(((Number(product.priceNormal) - Number(product.pricePromo)) / Number(product.priceNormal)) * 100) : 0
        const res = await fetch(`${API_URL}/api/listings/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({
            title: product.title.trim(),
            description: product.description.trim() || null,
            category: promoCategory, type: 'product',
            price: Number(product.priceNormal) || 0,
            promo_price: Number(product.pricePromo) || 0,
            discount_percent: discount,
            brand: product.brand || null, reference: product.reference || null,
            weight: product.weight ? `${product.weight}${product.weightUnit}` : null,
            images: allImages,
            status: 'draft',  // ← toujours draft, activé via la collection
            starts_at: dateStart ? new Date(dateStart).toISOString() : null,
            expires_at: dateEnd ? new Date(dateEnd).toISOString() : null,
            is_featured: featured,
            stock: product.stock ? Number(product.stock) : null,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.detail || `Erreur produit "${product.title}"`)
        }
        const created = await res.json()
        listingIds.push(created.id)
      }

      // ── Étape 2 : créer la collection avec le vrai statut ──────────────
      // La collection = 1 seule promotion, peu importe le nombre de produits
      const colRes = await fetch(`${API_URL}/api/collections/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          title: promoTitle.trim(),
          description: promoDescription.trim() || null,
          status: statusInitial,  // ← le vrai statut est sur la collection
          starts_at: dateStart ? new Date(dateStart).toISOString() : null,
          expires_at: dateEnd ? new Date(dateEnd).toISOString() : null,
          is_featured: featured, listing_ids: listingIds,
        }),
      })
      if (!colRes.ok) {
        const err = await colRes.json().catch(() => ({}))
        throw new Error(err.detail || 'Erreur création collection')
      }

      setGlobalMessage(`✅ Promotion créée avec ${listingIds.length} produit(s) !`)
      setTimeout(() => navigate('/promos'), 1500)
    } catch (err) {
      setGlobalError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const activeProduct = products[activeProductIdx]

  return (
    <div className="max-w-3xl bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Nouvelle promotion</h3>
        <button onClick={() => navigate('/promos')} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-6">
        {[['1','Promo'],['2','Produits'],['3','Aperçu']].map(([k, lbl]) => (
          <div key={k} className="flex items-center gap-1 shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
              ${Number(k) === step ? 'bg-blue-600 text-white' : Number(k) < step ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {Number(k) < step ? '✓' : k}
            </div>
            <span className={`text-xs font-medium ${Number(k) === step ? 'text-blue-600' : 'text-gray-400'}`}>{lbl}</span>
            {k !== '3' && <div className="w-8 h-0.5 bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* Messages */}
      {globalError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{globalError}</div>}
      {globalMessage && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{globalMessage}</div>}

      {/* ── ÉTAPE 1 ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
            💡 Cette promotion regroupera plusieurs produits. Chaque produit aura ses propres images, prix et description.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la promotion *</label>
            <input value={promoTitle} onChange={(e) => setPromoTitle(e.target.value)}
              placeholder="ex: Promo Semaine du 20 avril"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            {step1Errors.promoTitle && <p className="text-red-500 text-xs mt-1">{step1Errors.promoTitle}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            <select value={promoCategory} onChange={(e) => setPromoCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">— Choisir une catégorie —</option>
              {categories.map((c) => { const name = typeof c === 'object' ? c.name : c; return <option key={name} value={name}>{name}</option> })}
            </select>
            {step1Errors.promoCategory && <p className="text-red-500 text-xs mt-1">{step1Errors.promoCategory}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
            <textarea value={promoDescription} onChange={(e) => setPromoDescription(e.target.value)}
              rows={3} placeholder="Décrivez cette promotion…"
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <div className="flex gap-2">
              {[['active','✅ Actif'],['draft','📝 Brouillon'],['planned','📅 Planifié']].map(([s, lbl]) => (
                <button key={s} type="button"
                  disabled={s === 'active' && !canCreateActive}
                  onClick={() => setStatusInitial(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${statusInitial === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                    ${s === 'active' && !canCreateActive ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-700">⭐ Mettre en vedette</span>
          </label>
        </div>
      )}

      {/* ── ÉTAPE 2 ── */}
      {step === 2 && (
        <div>
          {/* Import */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div>
              <p className="text-sm font-medium text-gray-700">📥 Importer depuis un fichier</p>
              <p className="text-xs text-gray-500">CSV, Excel (.xlsx) ou JSON</p>
            </div>
            <div className="flex gap-2">
              <button onClick={downloadTemplate} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-white text-gray-600 font-medium">⬇ Template</button>
              <button onClick={() => fileInputRef.current?.click()} disabled={importLoading}
                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
                {importLoading ? 'Import…' : '📂 Importer'}
              </button>
              <input ref={fileInputRef} type="file" accept=".csv,.json,.xlsx,.xls" onChange={handleImportFile} className="hidden" />
            </div>
          </div>

          <div className="flex gap-3">
            {/* Sidebar produits */}
            <div className="w-36 shrink-0">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Produits ({products.length})</p>
              <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                {products.map((p, i) => (
                  <button key={p._id} onClick={() => setActiveProductIdx(i)}
                    className={`w-full text-left px-2 py-2 rounded-lg text-xs transition-all
                      ${activeProductIdx === i ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    <div className="font-medium truncate">{p.title || `Produit ${i + 1}`}</div>
                    {p.mainImage && <div className="text-xs opacity-70">📷</div>}
                    {(productErrors[`${i}_title`] || productErrors[`${i}_priceNormal`]) && <div className="text-red-300 text-xs">⚠</div>}
                  </button>
                ))}
              </div>
              <button onClick={addProduct} className="w-full mt-2 py-2 border-2 border-dashed border-blue-300 rounded-lg text-xs text-blue-600 hover:bg-blue-50 font-medium">
                + Ajouter
              </button>
            </div>

            {/* Formulaire produit actif */}
            {activeProduct && (
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-gray-800">Produit {activeProductIdx + 1}</h4>
                  {products.length > 1 && (
                    <button onClick={() => removeProduct(activeProductIdx)} className="text-xs text-red-500 hover:text-red-700">🗑 Supprimer</button>
                  )}
                </div>

                {/* Image principale */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">🖼 Image principale</label>
                  <div className="flex items-center gap-3">
                    {activeProduct.mainImage ? (
                      <div className="relative">
                        <img src={activeProduct.mainImage} alt="main" className="w-20 h-20 object-cover rounded-lg border-2 border-blue-200" />
                        <button onClick={() => updateProduct(activeProductIdx, { mainImage: null })}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                        <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs text-center rounded-b-lg py-0.5">principale</span>
                      </div>
                    ) : (
                      <button onClick={() => imageInputRef.current?.click()}
                        className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all">
                        <span className="text-2xl">📷</span>
                        <span className="text-xs mt-1">Ajouter</span>
                      </button>
                    )}
                    <input ref={imageInputRef} type="file" accept="image/*"
                      onChange={(e) => handleMainImage(activeProductIdx, e.target.files?.[0])} className="hidden" />
                    <p className="text-xs text-gray-400">Photo affichée dans la liste des produits</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nom du produit *</label>
                  <input value={activeProduct.title} onChange={(e) => updateProduct(activeProductIdx, { title: e.target.value })}
                    placeholder="ex: Riz parfumé 5kg" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  {productErrors[`${activeProductIdx}_title`] && <p className="text-red-500 text-xs mt-0.5">{productErrors[`${activeProductIdx}_title`]}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                  <textarea value={activeProduct.description} onChange={(e) => updateProduct(activeProductIdx, { description: e.target.value })}
                    rows={2} placeholder="Décrivez ce produit…" className="w-full border rounded-lg px-3 py-2 text-sm outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Prix normal (FCFA) *</label>
                    <input type="number" value={activeProduct.priceNormal} onChange={(e) => updateProduct(activeProductIdx, { priceNormal: e.target.value })}
                      placeholder="5000" className="w-full border rounded-lg px-3 py-2 text-sm" />
                    {productErrors[`${activeProductIdx}_priceNormal`] && <p className="text-red-500 text-xs mt-0.5">{productErrors[`${activeProductIdx}_priceNormal`]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Prix promo (FCFA) *</label>
                    <input type="number" value={activeProduct.pricePromo} onChange={(e) => updateProduct(activeProductIdx, { pricePromo: e.target.value })}
                      placeholder="3500" className="w-full border rounded-lg px-3 py-2 text-sm" />
                    {productErrors[`${activeProductIdx}_pricePromo`] && <p className="text-red-500 text-xs mt-0.5">{productErrors[`${activeProductIdx}_pricePromo`]}</p>}
                  </div>
                </div>

                {activeProduct.priceNormal && activeProduct.pricePromo && Number(activeProduct.priceNormal) > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex justify-between text-sm">
                    <span className="text-gray-600">Réduction</span>
                    <span className="font-bold text-green-700">
                      -{Math.round(((Number(activeProduct.priceNormal) - Number(activeProduct.pricePromo)) / Number(activeProduct.priceNormal)) * 100)}%
                      &nbsp;({(Number(activeProduct.priceNormal) - Number(activeProduct.pricePromo)).toLocaleString('fr-FR')} FCFA)
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Marque</label>
                    <input value={activeProduct.brand} onChange={(e) => updateProduct(activeProductIdx, { brand: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Référence</label>
                    <input value={activeProduct.reference} onChange={(e) => updateProduct(activeProductIdx, { reference: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Stock</label>
                    <input type="number" value={activeProduct.stock} onChange={(e) => updateProduct(activeProductIdx, { stock: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Poids</label>
                    <input value={activeProduct.weight} onChange={(e) => updateProduct(activeProductIdx, { weight: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Unité</label>
                    <select value={activeProduct.weightUnit} onChange={(e) => updateProduct(activeProductIdx, { weightUnit: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option>g</option><option>kg</option><option>ml</option><option>L</option>
                    </select>
                  </div>
                </div>

                {/* Images supplémentaires */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    📸 Images supplémentaires <span className="font-normal text-gray-400">(arrière, bas, côté…)</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {activeProduct.extraImages.map((img, j) => (
                      <div key={j} className="relative group">
                        <img src={img.base64} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                        <button onClick={() => removeExtraImage(activeProductIdx, j)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center">✕</button>
                        <input value={img.label} onChange={(e) => updateExtraLabel(activeProductIdx, j, e.target.value)}
                          placeholder="ex: arrière" className="mt-1 w-16 text-xs border rounded px-1 py-0.5 text-center" />
                      </div>
                    ))}
                    {activeProduct.extraImages.length < 8 && (
                      <button onClick={() => extraImageInputRef.current?.click()}
                        className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all text-2xl">+</button>
                    )}
                    <input ref={extraImageInputRef} type="file" accept="image/*" multiple
                      onChange={(e) => handleExtraImages(activeProductIdx, e.target.files)} className="hidden" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ÉTAPE 3 : Aperçu ── */}
      {step === 3 && (
        <div>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-gray-900">{promoTitle}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{promoCategory} · {statusInitial}</p>
                {promoDescription && <p className="text-sm text-gray-600 mt-1">{promoDescription}</p>}
                {(dateStart || dateEnd) && <p className="text-xs text-gray-500 mt-1">{dateStart && `Du ${dateStart}`} {dateEnd && `au ${dateEnd}`}</p>}
              </div>
              {featured && <span className="text-yellow-500 text-lg">⭐</span>}
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-3">{products.length} produit(s)</p>
          <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {products.map((p, i) => (
              <div key={p._id} className="border rounded-xl overflow-hidden bg-white shadow-sm">
                {p.mainImage
                  ? <img src={p.mainImage} alt={p.title} className="w-full h-28 object-cover" />
                  : <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-3xl text-gray-300">📷</div>}
                <div className="p-2">
                  <p className="font-semibold text-xs text-gray-900 truncate">{p.title || `Produit ${i + 1}`}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-400 line-through">{Number(p.priceNormal).toLocaleString('fr-FR')}</span>
                    <span className="text-xs font-bold text-green-600">{Number(p.pricePromo).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  {p.extraImages.length > 0 && <p className="text-xs text-gray-400">+{p.extraImages.length} photo(s)</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <button onClick={goBack} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          ← {step === 1 ? 'Annuler' : 'Retour'}
        </button>
        {step < 3 ? (
          <button onClick={goNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
            Suivant →
          </button>
        ) : (
          <button onClick={handlePublish} disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50">
            {saving ? '⏳ Publication…' : `🚀 Publier (${products.length} produit${products.length > 1 ? 's' : ''})`}
          </button>
        )}
      </div>
    </div>
  )
}
