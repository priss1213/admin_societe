import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CalendarIcon, ShieldCheckIcon, UserGroupIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function Profile() {
  const { currentUser, updateCurrentUser, users, addUser, removeUser, updateUser, activateUser, deactivateUser } = useApp()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editData, setEditData] = useState(currentUser)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [newUserData, setNewUserData] = useState({ name: '', email: '', role: 'editor' })

  const handleSaveProfile = () => {
    updateCurrentUser(editData)
    setIsEditingProfile(false)
  }

  const handleAddUser = () => {
    if (newUserData.name && newUserData.email) {
      addUser({
        name: newUserData.name,
        email: newUserData.email,
        role: newUserData.role,
      })
      setNewUserData({ name: '', email: '', role: 'editor' })
      setIsAddingUser(false)
    }
  }

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'Administrateur',
      editor: 'Éditeur',
      viewer: 'Lecteur',
    }
    return roles[role] || role
  }

  const getRoleColor = (role) => {
    const colors = {
      admin: 'text-red-700 bg-red-100',
      editor: 'text-blue-700 bg-blue-100',
      viewer: 'text-gray-700 bg-gray-100',
    }
    return colors[role] || 'bg-gray-100'
  }

  const getStatusBadge = (status) => {
    const configs = {
      active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Actif' },
      invited: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Invité' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactif' },
    }
    return configs[status] || configs.inactive
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mon Compte</h1>

      {/* Current User Profile */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
              {currentUser.avatar}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentUser.name}</h2>
              <p className="text-blue-100">{currentUser.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Info */}
          {!isEditingProfile ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nom complet</p>
                <p className="font-semibold">{currentUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-semibold">{currentUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Rôle</p>
                <p className={`inline-block px-3 py-1 rounded text-sm font-medium ${getRoleColor(currentUser.role)}`}>
                  {getRoleLabel(currentUser.role)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Statut</p>
                <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusBadge(currentUser.status).bg} ${getStatusBadge(currentUser.status).text}`}>
                  {getStatusBadge(currentUser.status).label}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Membre depuis</p>
                <p className="font-semibold">{new Date(currentUser.joinDate).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Dernière activité</p>
                <p className="font-semibold">
                  {currentUser.lastActive 
                    ? `Il y a ${Math.round((Date.now() - currentUser.lastActive) / 1000 / 60)} min`
                    : 'Jamais'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Modifier le profil
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Annuler
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Membres de l'équipe</h2>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setIsAddingUser(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="w-5 h-5" />
              Ajouter un membre
            </button>
          )}
        </div>

        {/* Add User Form */}
        {isAddingUser && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nom complet"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <select
                value={newUserData.role}
                onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                className="border rounded px-3 py-2"
              >
                <option value="editor">Éditeur</option>
                <option value="viewer">Lecteur</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Ajouter
              </button>
              <button
                onClick={() => setIsAddingUser(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{user.name}</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(user.status).bg} ${getStatusBadge(user.status).text}`}>
                      {getStatusBadge(user.status).label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              {currentUser.role === 'admin' && user.id !== currentUser.id && (
                <div className="flex gap-2">
                  {user.status === 'invited' && (
                    <button
                      onClick={() => activateUser(user.id)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Activer
                    </button>
                  )}
                  {user.status === 'active' && (
                    <button
                      onClick={() => deactivateUser(user.id)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Désactiver
                    </button>
                  )}
                  <button
                    onClick={() => removeUser(user.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Account Info */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Informations du compte</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type de compte</span>
              <span className="font-semibold">Professionnel</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ID de l'entreprise</span>
              <span className="font-semibold font-mono">CECADO-2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pays</span>
              <span className="font-semibold">France</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Langue</span>
              <span className="font-semibold">Français</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Sécurité</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 text-left font-medium">
              Modifier le mot de passe
            </button>
            <button className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 text-left font-medium">
              Authentification à deux facteurs
            </button>
            <button className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 text-left font-medium">
              Sessions actives
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
