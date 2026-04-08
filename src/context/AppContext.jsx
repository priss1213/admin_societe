import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)
const SHARED_SOCIETIES_KEY = 'mespromos_admin_society_details'
const ACTIVE_SOCIETY_KEY = 'mespromos_active_society_id'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const PLAN_DETAILS = {
  Starter: {
    id: 'starter',
    name: 'Starter',
    price: 5000,
    currency: 'XOF',
    promoQuota: 3,
    monthlyLimit: 50,
    features: ['Jusqu’à 3 promotions', 'Jusqu’à 50 réservations/mois', 'Analytiques de base', 'Support email'],
    description: 'Pour démarrer',
    recommended: false,
  },
  Business: {
    id: 'business',
    name: 'Business',
    price: 15000,
    currency: 'XOF',
    promoQuota: 15,
    monthlyLimit: 300,
    features: ['Jusqu’à 15 promotions', 'Jusqu’à 300 réservations/mois', 'Analytiques avancées', 'Support prioritaire'],
    description: 'Pour grandir',
    recommended: true,
  },
  Premium: {
    id: 'premium',
    name: 'Premium',
    price: 35000,
    currency: 'XOF',
    promoQuota: null,
    monthlyLimit: null,
    features: ['Promotions illimitées', 'Réservations illimitées', 'Analytiques avancées', 'Support prioritaire'],
    description: 'Illimité',
    recommended: false,
  },
}

const subscriptionPlans = Object.values(PLAN_DETAILS)
const initialReservationSettings = { expirationHours: 48, commissionPercent: 2 }

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getSharedCompany() {
  try {
    const societiesRaw = localStorage.getItem(SHARED_SOCIETIES_KEY)
    const activeSocietyId = localStorage.getItem(ACTIVE_SOCIETY_KEY)
    if (!societiesRaw || !activeSocietyId) return null
    const parsedSocieties = JSON.parse(societiesRaw)
    return parsedSocieties?.[activeSocietyId] || null
  } catch {
    return null
  }
}

function mapCompanyToProfile(company) {
  if (!company) return null
  return {
    id: company.id,
    name: company.name,
    email: company.email,
    phone: company.phone,
    city: company.city,
    address: company.address || company.adresse || '',
    category: company.category || company.categorie || 'Autre',
    reservationExpirationHours: Number(company.reservation_expiration_hours ?? company.reservationExpirationHours ?? 48),
    reservationCommissionPercent: Number(company.reservation_commission_percent ?? company.reservationCommissionPercent ?? 2),
    reservationNotes: company.reservation_notes ?? company.reservationNotes ?? '',
    plan: company.plan || 'Starter',
    createdAt: company.created_at ?? company.dateInscription ?? null,
    status: company.status || 'active',
  }
}

function getReservationStorageKey(companyId) {
  return `admin_societe_reservations_${companyId || 'default'}`
}

function parseStoredReservations(companyId) {
  try {
    const raw = localStorage.getItem(getReservationStorageKey(companyId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function buildSubscription(profile) {
  const plan = PLAN_DETAILS[profile?.plan] || PLAN_DETAILS.Starter
  const startDate = profile?.createdAt ? new Date(profile.createdAt) : new Date()
  const renewalDate = addDays(startDate, 30)
  const now = new Date()
  const daysRemaining = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const alerts = []

  if (daysRemaining <= 14 && daysRemaining > 3) {
    alerts.push({
      level: 'warning',
      title: 'Renouvellement dans 2 semaines',
      message: `Votre abonnement ${plan.name} expire le ${formatDate(renewalDate)}.`,
    })
  }
  if (daysRemaining <= 3 && daysRemaining >= 0) {
    alerts.push({
      level: 'danger',
      title: 'Renouvellement imminent',
      message: `Il reste ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} avant l’échéance du ${formatDate(renewalDate)}.`,
    })
  }

  return {
    ...plan,
    plan: plan.name,
    startDate: startDate.toISOString(),
    renewalDate: renewalDate.toISOString(),
    autoRenewal: true,
    currentPeriodLabel: `${formatDate(startDate)} au ${formatDate(renewalDate)}`,
    alerts,
    daysRemaining,
  }
}

export function AppProvider({ children }) {
  const { token, currentUser } = useAuth()
  const [promos, setPromos] = useState([])
  const [reservations, setReservations] = useState([])
  const [reservationSettings, setReservationSettings] = useState(initialReservationSettings)
  const [companyProfile, setCompanyProfile] = useState(null)
  const [subscriptionRequestMessage, setSubscriptionRequestMessage] = useState('')
  const [loadingPromos, setLoadingPromos] = useState(false)
  const [companyId, setCompanyId] = useState(null)

  const categories = useMemo(() => {
    const values = new Set()
    promos.forEach((promo) => {
      if (promo.category) values.add(promo.category)
    })
    return Array.from(values)
  }, [promos])

  const subscription = useMemo(() => buildSubscription(companyProfile), [companyProfile])
  const subscriptionPlansWithCurrent = useMemo(() => subscriptionPlans.map((plan) => ({
    ...plan,
    current: plan.name === subscription.plan,
  })), [subscription.plan])

  const hydrateCompany = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_URL}/api/companies/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const profile = mapCompanyToProfile(data)
        setCompanyId(Number(profile.id))
        setCompanyProfile(profile)
        setReservationSettings({
          expirationHours: profile.reservationExpirationHours,
          commissionPercent: profile.reservationCommissionPercent,
        })
        return
      }
    } catch {
      // fallback below
    }

    const sharedCompany = getSharedCompany()
    if (sharedCompany) {
      const profile = mapCompanyToProfile(sharedCompany)
      setCompanyId(Number(profile.id))
      setCompanyProfile(profile)
      setReservationSettings({
        expirationHours: profile.reservationExpirationHours,
        commissionPercent: profile.reservationCommissionPercent,
      })
    }
  }, [token])

  useEffect(() => {
    hydrateCompany()
  }, [hydrateCompany])

  useEffect(() => {
    if (!companyId) return
    setReservations(parseStoredReservations(companyId))
  }, [companyId])

  useEffect(() => {
    if (!companyId) return
    localStorage.setItem(getReservationStorageKey(companyId), JSON.stringify(reservations))
  }, [companyId, reservations])

  const loadPromos = useCallback(async () => {
    if (!token) return
    setLoadingPromos(true)
    try {
      const res = await fetch(`${API_URL}/api/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      const mapped = data.map((listing) => ({
        id: String(listing.id),
        title: listing.title,
        description: listing.description || '',
        category: listing.category,
        type: listing.type === 'service' ? 'Service' : 'Produit',
        reference: listing.reference,
        brand: listing.brand,
        weight: listing.weight,
        priceNormal: listing.price,
        pricePromo: listing.promo_price,
        dateStart: listing.starts_at ? listing.starts_at.split('T')[0] : '',
        dateEnd: listing.expires_at ? listing.expires_at.split('T')[0] : '',
        stock: listing.stock,
        featured: !!listing.is_featured,
        images: listing.images || [],
        image: listing.images?.[0] || null,
        active: listing.status === 'active',
        status: listing.status,
        views: listing.views_count || 0,
        clicks: listing.reservations_count || 0,
        likes: 0,
        comments: 0,
        reservations: listing.reservations_count || 0,
        reserved_count: listing.reservations_count || 0,
        sold: 0,
        clickRate: listing.views_count ? `${Math.round((listing.reservations_count / listing.views_count) * 100)}%` : '0%',
        expiresIn: listing.expires_at ? formatDate(listing.expires_at) : 'Sans date',
        company_id: listing.company_id,
        created_at: listing.created_at,
      }))
      setPromos(mapped)
    } finally {
      setLoadingPromos(false)
    }
  }, [token])

  useEffect(() => {
    loadPromos()
  }, [loadPromos])

  async function togglePromo(id) {
    const promo = promos.find((item) => item.id === id)
    if (!promo || !token) return
    const nextStatus = promo.active ? 'draft' : 'active'
    setPromos((state) => state.map((item) => item.id === id ? { ...item, active: !item.active, status: nextStatus } : item))
    try {
      await fetch(`${API_URL}/api/listings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      })
      await loadPromos()
    } catch {
      // keep optimistic state
    }
  }

  async function addPromo(promo) {
    if (!token) return { success: false, message: 'Vous devez être connecté.' }
    const activeCount = promos.filter((item) => item.active).length
    const wantsActive = promo.status === 'active'
    if (wantsActive && subscription.promoQuota != null && activeCount >= subscription.promoQuota) {
      return {
        success: false,
        message: `Quota atteint pour le plan ${subscription.plan}. Passez la promotion en brouillon ou demandez une extension.`,
      }
    }

    const discount = promo.priceNormal && promo.pricePromo
      ? Math.round(((Number(promo.priceNormal) - Number(promo.pricePromo)) / Number(promo.priceNormal)) * 100)
      : 0

    const body = {
      title: promo.title,
      description: promo.description || null,
      type: promo.type === 'Service' ? 'service' : 'product',
      category: promo.category || 'Autre',
      price: Number(promo.priceNormal) || 0,
      promo_price: Number(promo.pricePromo) || 0,
      discount_percent: discount,
      brand: promo.brand || null,
      reference: promo.reference || null,
      weight: promo.weight || null,
      images: promo.images || [],
      status: promo.status || 'draft',
      starts_at: promo.dateStart ? new Date(promo.dateStart).toISOString() : null,
      expires_at: promo.dateEnd ? new Date(promo.dateEnd).toISOString() : null,
      is_featured: promo.featured || false,
      stock: promo.stock ? Number(promo.stock) : null,
      company_id: companyId,
    }

    try {
      const res = await fetch(`${API_URL}/api/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        return { success: false, message: error.detail || 'Erreur lors de la publication.' }
      }
      await loadPromos()
      return {
        success: true,
        message: promo.status === 'active'
          ? 'Promotion publiée. Elle est maintenant visible dans le mobile.'
          : 'Promotion enregistrée en brouillon.',
      }
    } catch {
      return { success: false, message: 'Erreur réseau lors de la publication.' }
    }
  }

  function generateCode() {
    const parts = []
    for (let index = 0; index < 3; index += 1) {
      parts.push(Math.random().toString(36).substring(2, 6).toUpperCase())
    }
    return `MPS-${parts.join('-')}`
  }

  function generateReceiptNumber() {
    return `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`
  }

  function calculateReservationCommission(totalAmount, customPercent) {
    const percent = customPercent != null ? Number(customPercent) : Number(reservationSettings.commissionPercent)
    return Math.round((Number(totalAmount || 0) * percent) / 100)
  }

  function addReservation({ customer = null, items = [], createdAt = Date.now(), totalAmount = 0 } = {}) {
    const now = new Date(createdAt)
    const monthlyCount = reservations.filter((reservation) => {
      const date = new Date(reservation.createdAt)
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
    }).length

    if (subscription.monthlyLimit != null && monthlyCount >= subscription.monthlyLimit) {
      return { success: false, message: 'Quota mensuel de réservations atteint.' }
    }

    const reservation = {
      id: `r_${Date.now()}`,
      code: generateCode(),
      receiptNumber: generateReceiptNumber(),
      customer,
      items,
      totalAmount,
      expiryHours: Number(reservationSettings.expirationHours),
      commissionPercent: Number(reservationSettings.commissionPercent),
      status: 'pending',
      createdAt,
      companyId,
    }
    setReservations((state) => [reservation, ...state])
    return { success: true, reservation }
  }

  function validateReservation(id) {
    setReservations((state) => state.map((reservation) => (
      reservation.id === id
        ? {
            ...reservation,
            status: 'confirmed',
            confirmedAt: Date.now(),
            commissionAmount: calculateReservationCommission(reservation.totalAmount, reservation.commissionPercent),
          }
        : reservation
    )))
  }

  function expireReservation(id) {
    setReservations((state) => state.map((reservation) => (
      reservation.id === id ? { ...reservation, status: 'expired' } : reservation
    )))
  }

  function deleteReservation(id) {
    setReservations((state) => state.filter((reservation) => reservation.id !== id))
  }

  function updateReservation(id, patch) {
    setReservations((state) => state.map((reservation) => (
      reservation.id === id ? { ...reservation, ...patch } : reservation
    )))
  }

  function expireOldReservations(defaultHours = 24) {
    setReservations((state) => state.map((reservation) => {
      if (reservation.status !== 'pending') return reservation
      const hours = reservation.expiryHours != null ? reservation.expiryHours : defaultHours
      const expired = reservation.createdAt < Date.now() - hours * 60 * 60 * 1000
      return expired ? { ...reservation, status: 'expired' } : reservation
    }))
  }

  useEffect(() => {
    const intervalId = setInterval(() => expireOldReservations(Number(reservationSettings.expirationHours)), 60 * 1000)
    expireOldReservations(Number(reservationSettings.expirationHours))
    return () => clearInterval(intervalId)
  }, [reservationSettings.expirationHours])

  async function requestExtraReservations(extraCount, reason) {
    if (!token) return { success: false, message: 'Connexion requise.' }
    try {
      const res = await fetch(`${API_URL}/api/companies/me/reservation-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ extra_count: extraCount, reason }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return { success: false, message: data.detail || 'Impossible d’enregistrer la demande.' }
      setSubscriptionRequestMessage(data.message || 'Demande enregistrée.')
      return { success: true, message: data.message || 'Demande enregistrée.' }
    } catch {
      return { success: false, message: 'Erreur réseau lors de la demande.' }
    }
  }

  const value = {
    promos,
    loadingPromos,
    togglePromo,
    addPromo,
    loadPromos,
    reservations,
    reservationSettings,
    companyProfile,
    companyId,
    currentUser,
    addReservation,
    validateReservation,
    expireReservation,
    deleteReservation,
    updateReservation,
    calculateReservationCommission,
    subscription,
    subscriptionPlans: subscriptionPlansWithCurrent,
    categories,
    requestExtraReservations,
    subscriptionRequestMessage,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}

export default AppContext
