import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ChangePasswordPage() {
  const { changePassword, currentUser } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.newPassword !== form.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas')
      return
    }
    if (form.newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères')
      return
    }
    if (form.newPassword === form.currentPassword) {
      setError('Le nouveau mot de passe doit être différent de l\'actuel')
      return
    }

    setLoading(true)
    try {
      await changePassword(form.currentPassword, form.newPassword)
      setSuccess('Mot de passe modifié avec succès')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          ← Retour
        </button>
        <h1 className="text-xl font-bold text-gray-900">Modifier le mot de passe</h1>
        {currentUser && (
          <p className="text-sm text-gray-500 mt-1">{currentUser.email}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mot de passe actuel
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nouveau mot de passe
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Minimum 8 caractères"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showPasswords"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-400"
            />
            <label htmlFor="showPasswords" className="text-sm text-gray-600 select-none cursor-pointer">
              Afficher les mots de passe
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Enregistrement...' : 'Modifier le mot de passe'}
            </button>
          </div>
        </form>
      </div>

      {/* Security tip */}
      <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
        <p className="text-xs text-orange-700 font-medium mb-1">Conseils de sécurité</p>
        <ul className="text-xs text-orange-600 space-y-1 list-disc list-inside">
          <li>Utilisez au moins 8 caractères</li>
          <li>Mélangez lettres, chiffres et symboles</li>
          <li>N'utilisez pas le même mot de passe sur d'autres sites</li>
        </ul>
      </div>
    </div>
  )
}
