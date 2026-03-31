const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const DB = path.join(__dirname, 'mockdb.json')

function readDB() {
  try {
    const raw = fs.readFileSync(DB, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    return { promos: [], reservations: [] }
  }
}

function writeDB(obj) {
  fs.writeFileSync(DB, JSON.stringify(obj, null, 2), 'utf8')
}

app.get('/api/promos', (req, res) => {
  const db = readDB()
  res.json(db.promos || [])
})

app.post('/api/promos', (req, res) => {
  const db = readDB()
  const promo = req.body
  db.promos = db.promos || []
  db.promos.unshift(promo)
  writeDB(db)
  res.status(201).json(promo)
})

app.put('/api/promos/:id', (req, res) => {
  const db = readDB()
  const id = req.params.id
  db.promos = db.promos || []
  db.promos = db.promos.map(p => p.id === id ? { ...p, ...req.body } : p)
  writeDB(db)
  res.json({ ok: true })
})

app.get('/api/reservations', (req, res) => {
  const db = readDB()
  res.json(db.reservations || [])
})

app.post('/api/reservations', (req, res) => {
  const db = readDB()
  const reservation = req.body
  db.reservations = db.reservations || []
  db.reservations.unshift(reservation)
  writeDB(db)
  res.status(201).json(reservation)
})

const port = process.env.PORT || 3333
app.listen(port, () => console.log('Mock API running on http://localhost:' + port))
