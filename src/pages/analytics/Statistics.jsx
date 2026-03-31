import React, { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { EyeIcon, HandRaisedIcon, HeartIcon, ChatBubbleLeftIcon, CalendarIcon, ShoppingCartIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function Statistics() {
  const { promos } = useApp()
  const [view, setView] = useState('day') // day, month, period
  const [selectedPromo, setSelectedPromo] = useState(promos[0]?.id || null)
  const [dateRange, setDateRange] = useState({ start: '2026-03-25', end: '2026-03-31' })

  const currentPromo = useMemo(() => {
    return promos.find((p) => p.id === selectedPromo)
  }, [promos, selectedPromo])

  // Daily stats
  const dailyStats = useMemo(() => {
    if (!currentPromo?.daily_stats) return []
    
    if (view === 'period') {
      return currentPromo.daily_stats.filter(
        (stat) => stat.date >= dateRange.start && stat.date <= dateRange.end
      )
    }
    return currentPromo.daily_stats || []
  }, [currentPromo, view, dateRange])

  // Monthly stats
  const monthlyStats = useMemo(() => {
    return currentPromo?.monthly_stats || []
  }, [currentPromo])

  // Aggregate stats
  const aggregateStats = useMemo(() => {
    const data = view === 'day' ? dailyStats : monthlyStats
    
    return {
      views: data.reduce((sum, d) => sum + d.views, 0),
      clicks: data.reduce((sum, d) => sum + d.clicks, 0),
      likes: data.reduce((sum, d) => sum + d.likes, 0),
      comments: data.reduce((sum, d) => sum + d.comments, 0),
    }
  }, [dailyStats, monthlyStats, view])

  const ctr = aggregateStats.views ? Math.round((aggregateStats.clicks / aggregateStats.views) * 100 * 100) / 100 : 0
  const engagementRate = aggregateStats.views ? Math.round(((aggregateStats.clicks + aggregateStats.likes + aggregateStats.comments) / aggregateStats.views) * 100) : 0

  // Chart component helper
  const BarChart = ({ data, metric, color, label }) => {
    const values = data.map((d) => d[metric])
    const maxValue = Math.max.apply(null, values)
    const labels = data.map((d) => d.date || d.month).map((d) => typeof d === 'string' ? d.substring(5) : d)

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          {label}
        </h3>
        <div className="space-y-2">
          {data.map((d, i) => {
            const value = d[metric]
            const percentage = (value / maxValue) * 100
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-16 text-xs font-medium text-gray-600">{labels[i]}</div>
                <div className="flex-1">
                  <div className={`h-8 ${color} rounded flex items-center justify-end pr-2`} style={{width: `${percentage}%`, minWidth: '30px'}}>
                    <span className="text-xs text-white font-semibold">{value}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Trend Line Chart
  const TrendChart = ({ data, metric, color, label }) => {
    const values = data.map((d) => d[metric])
    if (values.length < 2) return null

    const maxValue = Math.max.apply(null, values)
    const minValue = Math.min.apply(null, values)
    const range = maxValue - minValue || 1

    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 100
      const y = 100 - ((v - minValue) / range) * 100
      return `${x},${y}`
    })

    const pathD = `M ${points.map((p, i) => {
      const [x, y] = p.split(',')
      return `${(i / (values.length - 1)) * 300},${y * 2}`
    }).join(' L ')}`

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          Tendance - {label}
        </h3>
        <svg viewBox="0 0 300 200" className="w-full border rounded">
          {/* Grid */}
          <line x1="40" y1="10" x2="40" y2="180" stroke="#ccc" strokeWidth="1" />
          <line x1="40" y1="180" x2="290" y2="180" stroke="#ccc" strokeWidth="1" />
          
          {/* Line */}
          <polyline
            points={`${values.map((v, i) => `${40 + (i / (values.length - 1)) * 250},${180 - ((v - minValue) / range) * 170}`).join(' ')}`}
            fill="none"
            stroke={color.replace('bg-', '#').split(' ')[0] || '#3b82f6'}
            strokeWidth="2"
          />
          
          {/* Points */}
          {values.map((v, i) => (
            <circle
              key={i}
              cx={40 + (i / (values.length - 1)) * 250}
              cy={180 - ((v - minValue) / range) * 170}
              r="4"
              fill={color.replace('bg-', '#').split(' ')[0] || '#3b82f6'}
            />
          ))}

          {/* Labels */}
          {values.map((v, i) => (
            <text
              key={`label-${i}`}
              x={40 + (i / (values.length - 1)) * 250}
              y="195"
              textAnchor="middle"
              fontSize="10"
              fill="#666"
            >
              {String(v).substring(0, 5)}
            </text>
          ))}
        </svg>
      </div>
    )
  }

  // Comparison chart
  const ComparisonChart = ({ data }) => {
    if (data.length === 0) return null
    
    const metrics = ['views', 'clicks', 'likes', 'comments']
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500']
    const labels = ['Vues', 'Clics', 'Aimes', 'Commentaires']

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-4 text-lg">Comparaison des métriques</h3>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, idx) => (
            <div key={metric} className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${colors[idx]}`}></div>
                <span className="text-sm font-medium">{labels[idx]}</span>
              </div>
              <div className="space-y-1">
                {data.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-12 truncate">{d.date || d.month}</div>
                    <div className={`h-4 ${colors[idx]} rounded`} style={{width: `${(d[metric] / Math.max.apply(null, data.map((x) => x[metric]))) * 100}px`}}></div>
                    <span className="font-semibold">{d[metric]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const currentData = view === 'day' ? dailyStats : monthlyStats

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Statistiques détaillées</h1>

      {/* View selector */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2 bg-white rounded-lg shadow p-2">
          <button
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded font-medium ${view === 'day' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
          >
            Par jour
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded font-medium ${view === 'month' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
          >
            Par mois
          </button>
          <button
            onClick={() => setView('period')}
            className={`px-4 py-2 rounded font-medium ${view === 'period' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
          >
            Période custom
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-2 flex items-center gap-2">
          <span className="text-sm text-gray-600 ml-2">Produit:</span>
          <select
            value={selectedPromo}
            onChange={(e) => setSelectedPromo(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {promos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {view === 'period' && (
          <div className="flex items-center gap-2 bg-white rounded-lg shadow p-2">
            <CalendarIcon className="w-5 h-5 text-gray-600" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="border rounded px-2 py-1 text-sm"
            />
            <span className="text-gray-600">à</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Vues</span>
            <EyeIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600">{aggregateStats.views}</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Clics</span>
            <HandRaisedIcon className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">{aggregateStats.clicks}</div>
          <div className="text-xs text-gray-500 mt-1">CTR: {ctr}%</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Aimes</span>
            <HeartIcon className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600">{aggregateStats.likes}</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Engagement</span>
            <ChatBubbleLeftIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-600">{engagementRate}%</div>
          <div className="text-xs text-gray-500 mt-1">{aggregateStats.comments} commentaires</div>
        </div>
      </div>

      {/* Charts grid */}
      {currentData.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          <BarChart
            data={currentData}
            metric="views"
            color="bg-blue-500"
            label={`Vues - ${view === 'day' ? 'Par jour' : 'Par mois'}`}
          />
          <BarChart
            data={currentData}
            metric="clicks"
            color="bg-green-500"
            label={`Clics - ${view === 'day' ? 'Par jour' : 'Par mois'}`}
          />
          <TrendChart
            data={currentData}
            metric="views"
            color="bg-blue-500"
            label={`Vues - ${view === 'day' ? 'Par jour' : 'Par mois'}`}
          />
          <TrendChart
            data={currentData}
            metric="clicks"
            color="bg-green-500"
            label={`Clics - ${view === 'day' ? 'Par jour' : 'Par mois'}`}
          />
        </div>
      )}

      {/* Comparison */}
      {currentData.length > 0 && (
        <ComparisonChart data={currentData} />
      )}

      {/* Detailed table */}
      {currentData.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b font-bold">
            Détails - {view === 'day' ? 'Par jour' : view === 'month' ? 'Par mois' : 'Période'}
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">{view === 'day' ? 'Date' : 'Mois'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Vues</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Clics</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">CTR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aimes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Commentaires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((d, i) => {
                const ctrVal = d.views ? Math.round((d.clicks / d.views) * 100 * 100) / 100 : 0
                const engageVal = d.views ? Math.round(((d.clicks + d.likes + d.comments) / d.views) * 100) : 0
                return (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-3 text-sm font-medium">{d.date || d.month}</td>
                    <td className="px-6 py-3 text-sm text-blue-600 font-semibold">{d.views}</td>
                    <td className="px-6 py-3 text-sm text-green-600 font-semibold">{d.clicks}</td>
                    <td className="px-6 py-3 text-sm text-green-500">{ctrVal}%</td>
                    <td className="px-6 py-3 text-sm text-red-600 font-semibold">{d.likes}</td>
                    <td className="px-6 py-3 text-sm text-purple-600 font-semibold">{d.comments}</td>
                    <td className="px-6 py-3 text-sm text-purple-500">{engageVal}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Sales & Reservations */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b font-bold text-lg">Statistiques des produits (Ventes & Réservations)</div>
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Vendus</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Réservés</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Total interactions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Taux de conversion</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((promo, i) => {
              const totalInteractions = (promo.sold || 0) + (promo.reserved_count || 0)
              const totalViews = promo.views || 1
              const conversionRate = Math.round((totalInteractions / totalViews) * 100 * 100) / 100
              return (
                <tr key={promo.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-3 text-sm font-medium">
                    <div className="flex flex-col">
                      <span>{promo.title}</span>
                      <span className="text-xs text-gray-500">{promo.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <ShoppingCartIcon className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-600">{promo.sold || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-600">{promo.reserved_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-purple-600">{totalInteractions}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-orange-600">{conversionRate}%</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      promo.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {promo.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
