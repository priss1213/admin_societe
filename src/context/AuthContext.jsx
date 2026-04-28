import React, { createContext, useContext, useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('societe_token'))
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('societe_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(() => !!localStorage.getItem('societe_token'))
  const [error, setError] = useState(null)

  const isAuthenticated = !!token

  // Fetch profile from backend when token changes
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetch(`${API_URL}/auth/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Token invalide')
        return r.json()
      })
      .then((user) => {
        if (cancelled) return
        setCurrentUser(user)
        localStorage.setItem('societe_user', JSON.stringify(user))
      })
      .catch(() => {
        // Token expired or invalid — log out silently
        if (!cancelled) logout()
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  async function login(email, password) {
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const res = await fetch(`${API_URL}/auth/token`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Identifiants incorrects')
      }

      const data = await res.json()
      setToken(data.access_token)
      localStorage.setItem('societe_token', data.access_token)
      if (data.user) {
        setCurrentUser(data.user)
        localStorage.setItem('societe_user', JSON.stringify(data.user))
      }
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    setLoading(false)
    setToken(null)
    setCurrentUser(null)
    localStorage.removeItem('societe_token')
    localStorage.removeItem('societe_user')
  }

  async function changePassword(currentPassword, newPassword) {
    setError(null)
    const res = await fetch(`${API_URL}/auth/users/me/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.detail || 'Erreur lors du changement de mot de passe')
    return data
  }

  return (
    <AuthContext.Provider
      value={{ token, currentUser, isAuthenticated, loading, error, login, logout, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export default AuthContext
