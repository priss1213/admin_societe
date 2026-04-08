import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'

export default function Profile() {
  const navigate = useNavigate()
  const { companyProfile, reservationSettings, subscription, currentUser } = useApp()
  const { logout } = useAuth()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mon Compte</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl text-blue-700 font-bold">
              {(companyProfile?.name || 'S').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{companyProfile?.name || currentUser?.full_name}</h2>
              <p className="text-blue-100">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Compte connecté</p>
              <p className="font-semibold">{currentUser?.full_name || 'Utilisateur société'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-semibold">{currentUser?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Rôle</p>
              <p className="font-semibold">{currentUser?.role || 'company'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Plan</p>
              <p className="font-semibold">{subscription.plan}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button onClick={() => navigate('/change-password')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Modifier le mot de passe
            </button>
            <button onClick={() => logout()} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Informations de la société</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Société</span>
              <span className="font-semibold">{companyProfile?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ID de l'entreprise</span>
              <span className="font-semibold font-mono">{companyProfile?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ville</span>
              <span className="font-semibold">{companyProfile?.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Catégorie</span>
              <span className="font-semibold">{companyProfile?.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Téléphone</span>
              <span className="font-semibold">{companyProfile?.phone}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Paramètres de réservation</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Expiration</span>
              <span className="font-semibold">{reservationSettings.expirationHours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Commission</span>
              <span className="font-semibold">{reservationSettings.commissionPercent}%</span>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Instruction super admin</p>
              <p className="font-medium">{companyProfile?.reservationNotes || 'Aucune instruction spécifique.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
