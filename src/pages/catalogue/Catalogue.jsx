import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function CataloguePage() {
  const { companyProfile, loadCatalogues, uploadCatalogue, deleteCatalogue } = useApp()
  const [catalogues, setCatalogues] = useState([])
  const [quota, setQuota] = useState({ count: 0, limit: 1, plan: 'Starter' })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState(null)
  const fileRef = useRef(null)

  const enabled = companyProfile?.catalogueEnabled ?? false
  const limitAtteinte = quota.limit !== null && quota.count >= quota.limit

  async function refresh() {
    setLoading(true)
    const result = await loadCatalogues()
    setCatalogues(result.catalogues || [])
    setQuota({
      count: result.count || 0,
      limit: result.limit ?? null,
      plan: result.plan || 'Starter',
    })
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyProfile?.id])

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (limitAtteinte) {
      setMessage({
        type: 'error',
        text: `Limite atteinte (${quota.limit} catalogue${quota.limit > 1 ? 's' : ''}) pour le plan ${quota.plan}. Passez à un plan supérieur.`,
      })
      return
    }
    setUploading(true)
    setMessage(null)
    const result = await uploadCatalogue(file, title.trim() || undefined)
    if (result.success) {
      setTitle('')
      if (fileRef.current) fileRef.current.value = ''
      await refresh()
      setMessage({ type: 'success', text: 'Catalogue téléversé avec succès.' })
    } else {
      setMessage({ type: 'error', text: result.message })
    }
    setUploading(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer ce catalogue ?')) return
    await deleteCatalogue(id)
    await refresh()
  }

  if (!enabled) {
    return (
      <div className="max-w-2xl bg-white rounded shadow p-8 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-semibold mb-2">Catalogue non activé</h3>
        <p className="text-gray-500 text-sm">
          La fonctionnalité catalogue n'est pas encore activée pour votre compte.
          Contactez l'administrateur MesPromos pour l'activer selon votre plan d'abonnement.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded shadow p-6">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-lg font-semibold">Mes catalogues / dépliants</h3>
          <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
            limitAtteinte ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {quota.count} / {quota.limit === null ? '∞' : quota.limit} — Plan {quota.plan}
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Téléversez vos catalogues ou dépliants (image ou PDF). Ils seront visibles dans l'app mobile.
        </p>

        {quota.limit !== null && (
          <div className="mb-4">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${limitAtteinte ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(100, (quota.count / quota.limit) * 100)}%` }}
              />
            </div>
            {limitAtteinte && (
              <p className="text-xs text-red-600 mt-1">
                Limite atteinte. Passez au plan supérieur pour ajouter davantage de catalogues.
              </p>
            )}
          </div>
        )}

        {message && (
          <div className={`mb-4 rounded border px-3 py-2 text-sm ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
          limitAtteinte ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-200'
        }`}>
          <div className="text-3xl mb-2">📤</div>
          <p className="text-sm text-gray-600 mb-3">JPG, PNG, PDF — max 10 Mo</p>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Titre du catalogue (optionnel)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={limitAtteinte}
              className="w-full border rounded px-3 py-2 text-sm mb-2 disabled:bg-gray-100"
            />
            <label className={`inline-block px-4 py-2 rounded text-sm font-medium ${
              uploading || limitAtteinte
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
            }`}>
              {uploading ? 'Téléversement…' : limitAtteinte ? 'Limite atteinte' : 'Choisir un fichier'}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                disabled={uploading || limitAtteinte}
                onChange={handleUpload}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h4 className="font-semibold mb-4">
          Catalogues publiés ({quota.count}{quota.limit !== null ? ` / ${quota.limit}` : ''})
        </h4>
        {loading ? (
          <div className="text-sm text-gray-400">Chargement…</div>
        ) : catalogues.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-8">
            Aucun catalogue publié pour le moment.
          </div>
        ) : (
          <div className="space-y-3">
            {catalogues.map((cat) => (
              <div key={cat.id} className="flex items-center gap-4 border rounded-lg p-3">
                <div className="w-16 h-16 shrink-0 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                  {cat.file_type === 'pdf' ? (
                    <span className="text-2xl">📄</span>
                  ) : (
                    <img
                      src={`${API_URL}${cat.file_url}`}
                      alt={cat.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{cat.title || 'Sans titre'}</div>
                  <div className="text-xs text-gray-400">
                    {cat.file_type === 'pdf' ? 'PDF' : 'Image'} · {cat.created_at ? new Date(cat.created_at).toLocaleDateString('fr-FR') : ''}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  
                    href={`${API_URL}${cat.file_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 border rounded text-xs hover:bg-gray-50"
                  <a>
                    Voir
                  </a>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="px-3 py-1.5 border border-red-200 text-red-600 rounded text-xs hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}