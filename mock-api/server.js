const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(bodyParser.json({ limit: '30mb' }))

// In-memory mock data
let promos = [
  { id: 'p1', title: 'Viande de bœuf — 20%', description: "Promotion sur la viande de bœuf locale : -20%", category: 'Alimentation', active: true, views: 312, reservations: 18 },
  { id: 'p2', title: 'Produits ménagers — 15%', description: "Réduction sur produits ménagers", category: 'Ménager', active: true, views: 128, reservations: 7 },
]

let reservations = [
  { id: 'r1', code: 'MPS-A4B2-C9D1', status: 'collected', createdAt: Date.now() - 1000 * 60 * 60 * 48 },
  { id: 'r2', code: 'MPS-E3F5-G7H2', status: 'pending', createdAt: Date.now() - 1000 * 60 * 60 * 2 },
]

let products = [
  { id: 'prod1', name: 'Viande de bœuf', description: 'Bœuf frais local', price: 1200, promotional_price: 960, category: 'Alimentation', image: null },
  { id: 'prod2', name: 'Lessive Super', description: 'Lessive concentrée', price: 4500, promotional_price: 3825, category: 'Ménager', image: null },
]

let services = [
  { id: 'svc1', name: 'Livraison express', price: 500, duration_minutes: 60 },
]

let categories = [
  { id: 1, code: 'ALIM', label: 'Alimentation' },
  { id: 2, code: 'MEN', label: 'Ménager' },
]

app.get('/api/promos', (req, res) => {
  res.json(promos)
})

app.post('/api/promos', (req, res) => {
  const p = req.body
  if (!p || !p.title) return res.status(400).json({ error: 'title required' })
  p.id = p.id || `p_${Date.now()}`
  promos.unshift(p)
  return res.status(201).json(p)
})

app.get('/api/reservations', (req, res) => {
  res.json(reservations)
})

app.get('/api/auth/products', (req, res) => {
  res.json(products)
})

app.get('/api/auth/services', (req, res) => {
  res.json(services)
})

app.get('/api/auth/categories', (req, res) => {
  res.json(categories)
})

app.post('/api/reservations', (req, res) => {
  const r = req.body
  if (!r) return res.status(400).json({ error: 'body required' })
  r.id = r.id || `r_${Date.now()}`
  r.createdAt = r.createdAt || Date.now()
  reservations.unshift(r)
  return res.status(201).json(r)
})

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`)
})
