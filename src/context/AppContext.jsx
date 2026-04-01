import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'

const AppContext = createContext(null)
const SHARED_SOCIETIES_KEY = 'mespromos_admin_society_details'
const ACTIVE_SOCIETY_KEY = 'mespromos_active_society_id'

const initialPromos = [
  { 
    id: 'p1', 
    title: "Viande de bœuf — 20%", 
    description: "Promotion sur la viande de bœuf locale : -20% sur le kilo, valable cette semaine.", 
    active: true, 
    views: 312,
    clicks: 87,
    likes: 45,
    comments: 12,
    expiresIn: '3j', 
    category: 'Alimentation', 
    featured: true, 
    reservations: 18, 
    status: 'active',
    engagement: {
      views: [45, 52, 48, 67, 55, 58, 50],
      clicks: [12, 15, 14, 18, 16, 15, 17],
      date_range: 'Derniers 7 jours'
    },
    daily_stats: [
      { date: '2026-03-25', views: 45, clicks: 12, likes: 5, comments: 2 },
      { date: '2026-03-26', views: 52, clicks: 15, likes: 7, comments: 3 },
      { date: '2026-03-27', views: 48, clicks: 14, likes: 6, comments: 2 },
      { date: '2026-03-28', views: 67, clicks: 18, likes: 9, comments: 4 },
      { date: '2026-03-29', views: 55, clicks: 16, likes: 8, comments: 2 },
      { date: '2026-03-30', views: 58, clicks: 15, likes: 8, comments: 3 },
      { date: '2026-03-31', views: 50, clicks: 17, likes: 6, comments: 1 }
    ],
    monthly_stats: [
      { month: 'Janvier', views: 1200, clicks: 320, likes: 180, comments: 45 },
      { month: 'Février', views: 1850, clicks: 480, likes: 280, comments: 62 },
      { month: 'Mars', views: 312, clicks: 87, likes: 45, comments: 12 }
    ],
    sold: 45,
    reserved_count: 18,
    customer_comments: [
      { id: 'c1', author: 'Jean Dupont', rating: 5, text: 'Excellent produit ! Très frais et de bonne qualité.', date: '2026-03-30', likes: 12, status: 'approved' },
      { id: 'c2', author: 'Marie Bernard', rating: 4, text: 'Bon rapport qualité-prix. Je recommande !', date: '2026-03-29', likes: 8, status: 'approved' },
      { id: 'c3', author: 'Pierre Martin', rating: 5, text: 'Absolument fantastique, livraison rapide !', date: '2026-03-28', likes: 15, status: 'approved' },
      { id: 'c4', author: 'Sophie Laurent', rating: 3, text: 'C\'était correct mais j\'aurais aimé plus de portions.', date: '2026-03-27', likes: 3, status: 'approved' },
      { id: 'c5', author: 'Thomas Lefevre', rating: 5, text: 'Viande de qualité exceptionnelle ! À acheter absolument.', date: '2026-03-25', likes: 22, status: 'approved' }
    ]
  },
  { 
    id: 'p2', 
    title: "Produits ménagers — 15%", 
    description: "Réduction sur une sélection de produits ménagers. Offre valable jusqu'à épuisement des stocks.", 
    active: true, 
    views: 128,
    clicks: 42,
    likes: 25,
    comments: 8,
    expiresIn: '7j', 
    category: 'Ménager', 
    featured: false, 
    reservations: 7, 
    status: 'active',
    engagement: {
      views: [15, 18, 16, 22, 19, 21, 17],
      clicks: [4, 5, 5, 7, 6, 7, 8],
      date_range: 'Derniers 7 jours'
    },
    daily_stats: [
      { date: '2026-03-25', views: 15, clicks: 4, likes: 2, comments: 0 },
      { date: '2026-03-26', views: 18, clicks: 5, likes: 3, comments: 1 },
      { date: '2026-03-27', views: 16, clicks: 5, likes: 2, comments: 0 },
      { date: '2026-03-28', views: 22, clicks: 7, likes: 4, comments: 1 },
      { date: '2026-03-29', views: 19, clicks: 6, likes: 3, comments: 1 },
      { date: '2026-03-30', views: 21, clicks: 7, likes: 3, comments: 1 },
      { date: '2026-03-31', views: 17, clicks: 8, likes: 2, comments: 0 }
    ],
    monthly_stats: [
      { month: 'Janvier', views: 450, clicks: 120, likes: 65, comments: 15 },
      { month: 'Février', views: 620, clicks: 165, likes: 92, comments: 22 },
      { month: 'Mars', views: 128, clicks: 42, likes: 25, comments: 8 }
    ],
    sold: 12,
    reserved_count: 7,
    customer_comments: [
      { id: 'c1', author: 'Luc Renard', rating: 4, text: 'Très utiles ! Produits de bonne qualité.', date: '2026-03-29', likes: 5, status: 'approved' },
      { id: 'c2', author: 'Isabelle Garnier', rating: 5, text: 'Exactement ce qu\'il me fallait ! Parfait.', date: '2026-03-27', likes: 9, status: 'approved' },
      { id: 'c3', author: 'Marc Durand', rating: 4, text: 'Bon achat, prix très compétitif.', date: '2026-03-25', likes: 4, status: 'approved' }
    ]
  },
  { 
    id: 'p3', 
    title: "Riz importé — 10%", 
    description: "Riz importé de qualité supérieure, remise de 10% pour les 2 prochains jours.", 
    active: false, 
    views: 245,
    clicks: 68,
    likes: 38,
    comments: 15,
    expiresIn: 'terminée', 
    category: 'Alimentation', 
    featured: false, 
    reservations: 0, 
    status: 'finished',
    engagement: {
      views: [32, 35, 38, 42, 40, 38, 20],
      clicks: [8, 9, 10, 12, 11, 10, 8],
      date_range: 'Derniers 7 jours'
    },
    daily_stats: [
      { date: '2026-03-25', views: 32, clicks: 8, likes: 5, comments: 1 },
      { date: '2026-03-26', views: 35, clicks: 9, likes: 6, comments: 2 },
      { date: '2026-03-27', views: 38, clicks: 10, likes: 7, comments: 2 },
      { date: '2026-03-28', views: 42, clicks: 12, likes: 8, comments: 3 },
      { date: '2026-03-29', views: 40, clicks: 11, likes: 7, comments: 2 },
      { date: '2026-03-30', views: 38, clicks: 10, likes: 5, comments: 3 },
      { date: '2026-03-31', views: 20, clicks: 8, likes: 4, comments: 2 }
    ],
    monthly_stats: [
      { month: 'Janvier', views: 890, clicks: 240, likes: 135, comments: 35 },
      { month: 'Février', views: 1320, clicks: 385, likes: 195, comments: 48 },
      { month: 'Mars', views: 245, clicks: 68, likes: 38, comments: 15 }
    ],
    sold: 38,
    reserved_count: 0,
    customer_comments: [
      { id: 'c1', author: 'Anne Leclerc', rating: 5, text: 'Excellent riz ! Très savoureux et bien blanc.', date: '2026-03-28', likes: 18, status: 'approved' },
      { id: 'c2', author: 'Claude Moreau', rating: 4, text: 'Bonne qualité. Un classique !', date: '2026-03-25', likes: 7, status: 'approved' },
      { id: 'c3', author: 'Françoise Petit', rating: 5, text: 'Parfait pour mes risottos ! Juste fantastique.', date: '2026-03-23', likes: 24, status: 'approved' },
      { id: 'c4', author: 'René Fournier', rating: 3, text: 'Correct mais j\'ai trouvé quelques grains cassés.', date: '2026-03-20', likes: 2, status: 'approved' }
    ]
  }
]

const initialReservationSettings = {
  expirationHours: 48,
  commissionPercent: 2,
}

const initialCompanyProfile = {
  id: '1',
  name: 'Supermarché Mbolo',
  email: 'contact@mbolo.ga',
  phone: '+241 07 123 456',
  city: 'Libreville, Gabon',
  category: 'Supermarché / Grande distribution',
  reservationExpirationHours: 48,
  reservationCommissionPercent: 2,
  reservationNotes: 'Réservation valable 48h avec validation en caisse.',
}

// initial reservations (mock). status: 'pending' | 'confirmed' | 'expired'
const initialReservations = [
  {
    id: 'r1',
    code: 'MPS-A4B2-C9D1',
    receiptNumber: 'REC-2026-00421',
    customer: 'Jean Dupont',
    items: ['Viande de bœuf — 20%'],
    totalAmount: 18000,
    expiryHours: 48,
    commissionPercent: 2,
    commissionAmount: 360,
    status: 'confirmed',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    confirmedAt: Date.now() - 1000 * 60 * 25,
  },
  {
    id: 'r2',
    code: 'MPS-E3F5-G7H2',
    receiptNumber: 'REC-2026-00422',
    customer: 'Marie Bernard',
    items: ['Produits ménagers — 15%'],
    totalAmount: 12500,
    expiryHours: 48,
    commissionPercent: 2,
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
]

// subscription mock: monthlyLimit = number or null for unlimited
const initialSubscription = {
  plan: 'Starter',
  monthlyLimit: 50,
  promoQuota: 3,
  price: 9.99,
  currency: 'EUR',
  renewalDate: '2026-04-30',
  startDate: '2026-03-30',
  autoRenewal: true,
  features: ['Jusqu\'à 3 promotions', 'Jusqu\'à 50 réservations/mois', 'Analytiques de base', 'Support email'],
}

// subscription plans
const subscriptionPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 9.99,
    description: 'Pour démarrer',
    promoQuota: 3,
    monthlyLimit: 50,
    features: ['Jusqu\'à 3 promotions', 'Jusqu\'à 50 réservations/mois', 'Analytiques de base', 'Support email'],
    recommended: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 29.99,
    description: 'Pour grandir',
    promoQuota: 15,
    monthlyLimit: 300,
    features: ['Jusqu\'à 15 promotions', 'Jusqu\'à 300 réservations/mois', 'Analytiques avancées', 'Support prioritaire', 'Export de données'],
    recommended: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 99.99,
    description: 'Illimité',
    promoQuota: null,
    monthlyLimit: null,
    features: ['Promotions illimitées', 'Réservations illimitées', 'Analytiques en temps réel', 'Support 24/7', 'API inclusoite', 'Manager d\'équipe'],
    recommended: false,
  },
]

// initial users
const initialUsers = [
  {
    id: 'u1',
    name: 'Jean Dupont',
    email: 'jean@cecado.com',
    role: 'admin',
    joinDate: '2026-01-15',
    status: 'active',
    lastActive: Date.now() - 1000 * 60 * 30,
    avatar: '🧑‍💼',
  },
  {
    id: 'u2',
    name: 'Marie Leclerc',
    email: 'marie@cecado.com',
    role: 'editor',
    joinDate: '2026-02-01',
    status: 'active',
    lastActive: Date.now() - 1000 * 60 * 60 * 2,
    avatar: '👩‍💻',
  },
  {
    id: 'u3',
    name: 'Pierre Martin',
    email: 'pierre@cecado.com',
    role: 'viewer',
    joinDate: '2026-03-10',
    status: 'invited',
    lastActive: null,
    avatar: '👨‍💼',
  },
]

// current user (the one logged in)
const initialCurrentUser = initialUsers[0]

export function AppProvider({ children }) {
  const [promos, setPromos] = useState(initialPromos)
  const [reservations, setReservations] = useState(initialReservations)
  const [reservationSettings, setReservationSettings] = useState(initialReservationSettings)
  const [companyProfile, setCompanyProfile] = useState(initialCompanyProfile)
  const [subscription, setSubscription] = useState(initialSubscription)
  const [users, setUsers] = useState(initialUsers)
  const [currentUser, setCurrentUser] = useState(initialCurrentUser)
  const [apiAvailable, setApiAvailable] = useState(false)

  // derive categories from promos
  const categories = useMemo(() => {
    const s = new Set()
    promos.forEach((p) => { if (p.category) s.add(p.category) })
    return Array.from(s)
  }, [promos])

  // persist promos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('admin_promos', JSON.stringify(promos))
    } catch (err) {
      // ignore in non-browser environments
    }
  }, [promos])

  useEffect(() => {
    try {
      localStorage.setItem('admin_reservations', JSON.stringify(reservations))
    } catch (err) {
      // ignore
    }
  }, [reservations])

  // load promos from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin_promos')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setPromos(parsed)
      }
      const reservationsRaw = localStorage.getItem('admin_reservations')
      if (reservationsRaw) {
        const parsedReservations = JSON.parse(reservationsRaw)
        if (Array.isArray(parsedReservations)) setReservations(parsedReservations)
      }
      const societiesRaw = localStorage.getItem(SHARED_SOCIETIES_KEY)
      const activeSocietyId = localStorage.getItem(ACTIVE_SOCIETY_KEY)
      if (societiesRaw && activeSocietyId) {
        const parsedSocieties = JSON.parse(societiesRaw)
        const selectedCompany = parsedSocieties?.[activeSocietyId]
        if (selectedCompany) {
          setCompanyProfile({
            id: selectedCompany.id,
            name: selectedCompany.name,
            email: selectedCompany.email,
            phone: selectedCompany.phone,
            city: selectedCompany.city,
            category: selectedCompany.categorie,
            reservationExpirationHours: Number(selectedCompany.reservationExpirationHours ?? 48),
            reservationCommissionPercent: Number(selectedCompany.reservationCommissionPercent ?? 2),
            reservationNotes: selectedCompany.reservationNotes ?? '',
          })
          setReservationSettings({
            expirationHours: Number(selectedCompany.reservationExpirationHours ?? 48),
            commissionPercent: Number(selectedCompany.reservationCommissionPercent ?? 2),
          })
        }
      }
    } catch (err) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // try to detect mock API and load remote data
  useEffect(() => {
    const base = 'http://localhost:4000'
    let mounted = true
    fetch(`${base}/api/promos`).then((r) => {
      if (!mounted) return
      if (!r.ok) throw new Error('no api')
      return r.json()
    }).then((data) => {
      if (!mounted) return
      if (Array.isArray(data) && data.length) {
        setPromos(data)
        setApiAvailable(true)
      }
    }).catch(() => {
      // keep local data
    })

    fetch(`${base}/api/reservations`).then((r) => r.json()).then((data) => {
      if (!mounted) return
      if (Array.isArray(data) && data.length) setReservations(data)
    }).catch(() => {})

    return () => { mounted = false }
  }, [])

  // PROMOS
  function togglePromo(id) {
    setPromos((s) => s.map((p) => (p.id === id ? { ...p, active: !p.active } : p)))
  }

  function addPromo(promo) {
    setPromos((s) => [promo, ...s])
    // if mock API available, post there as well
    if (apiAvailable) {
      try {
        fetch('http://localhost:4000/api/promos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(promo),
        }).catch(() => {})
      } catch (err) {
        // ignore
      }
    }
  }

  // RESERVATIONS
  function generateCode() {
    // simple pseudo-random code
    const parts = []
    for (let i = 0; i < 3; i++) parts.push(Math.random().toString(36).substring(2, 6).toUpperCase())
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
    // Check monthly limit
    const now = new Date(createdAt)
    const year = now.getFullYear()
    const month = now.getMonth()
    const monthlyCount = reservations.filter((r) => {
      const d = new Date(r.createdAt)
      return d.getFullYear() === year && d.getMonth() === month
    }).length

    if (subscription.monthlyLimit != null && monthlyCount >= subscription.monthlyLimit) {
      return { success: false, message: 'Quota mensuel atteint' }
    }

    const newRes = {
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
    }
    setReservations((s) => [newRes, ...s])
    return { success: true, reservation: newRes }
  }

  function validateReservation(id) {
    setReservations((s) => s.map((r) => (
      r.id === id
        ? {
            ...r,
            status: 'confirmed',
            confirmedAt: Date.now(),
            commissionPercent: Number(r.commissionPercent ?? reservationSettings.commissionPercent),
            commissionAmount: calculateReservationCommission(
              r.totalAmount,
              r.commissionPercent ?? reservationSettings.commissionPercent,
            ),
          }
        : r
    )))
  }

  function expireReservation(id) {
    setReservations((s) => s.map((r) => (r.id === id ? { ...r, status: 'expired' } : r)))
  }

  function deleteReservation(id) {
    setReservations((s) => s.filter((r) => r.id !== id))
  }

  function updateReservation(id, patch) {
    setReservations((s) => s.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function expireOldReservations(defaultHours = 24) {
    const cutoffFor = (r) => {
      const hours = r.expiryHours != null ? r.expiryHours : defaultHours
      return r.createdAt < Date.now() - hours * 60 * 60 * 1000
    }
    setReservations((s) => s.map((r) => (r.status === 'pending' && cutoffFor(r) ? { ...r, status: 'expired' } : r)))
  }

  // auto-expire periodically (every minute)
  useEffect(() => {
    const id = setInterval(
      () => expireOldReservations(Number(reservationSettings.expirationHours)),
      60 * 1000,
    )
    // run once on mount
    expireOldReservations(Number(reservationSettings.expirationHours))
    return () => clearInterval(id)
  }, [reservationSettings.expirationHours])

  function upgradeToBusiness() {
    setSubscription((s) => ({ ...s, plan: 'Business', promoQuota: 50 }))
  }

  // USER MANAGEMENT
  function addUser(user) {
    const newUser = {
      id: `u_${Date.now()}`,
      ...user,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'invited',
      avatar: '👤',
    }
    setUsers((s) => [newUser, ...s])
    return newUser
  }

  function removeUser(id) {
    setUsers((s) => s.filter((u) => u.id !== id))
  }

  function updateUser(id, patch) {
    setUsers((s) => s.map((u) => (u.id === id ? { ...u, ...patch } : u)))
  }

  function activateUser(id) {
    updateUser(id, { status: 'active', lastActive: Date.now() })
  }

  function deactivateUser(id) {
    updateUser(id, { status: 'inactive' })
  }

  // SUBSCRIPTION
  function upgradePlan(planId) {
    const plan = subscriptionPlans.find((p) => p.id === planId)
    if (plan) {
      setSubscription((s) => ({
        ...s,
        plan: plan.name,
        price: plan.price,
        promoQuota: plan.promoQuota,
        monthlyLimit: plan.monthlyLimit,
        features: plan.features,
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }))
    }
  }

  function updateCurrentUser(patch) {
    setCurrentUser((s) => ({ ...s, ...patch }))
  }

  const value = {
    promos,
    togglePromo,
    addPromo,
    reservations,
    reservationSettings,
    companyProfile,
    addReservation,
    validateReservation,
    expireReservation,
    deleteReservation,
    updateReservation,
    expireOldReservations,
    calculateReservationCommission,
    subscription,
    upgradeToBusiness,
    subscriptionPlans,
    categories,
    users,
    currentUser,
    addUser,
    removeUser,
    updateUser,
    activateUser,
    deactivateUser,
    upgradePlan,
    updateCurrentUser,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

export default AppContext
