import { useState, useEffect } from 'react'
import { portfolioAPI } from '../../api/portfolioClient'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PortfolioStats {
  portfolio_id: number
  portfolio_name: string
  current_value: number
  initial_value: number
  total_return: number
  total_return_percentage: number
  latest_date: string
  performance_records: Array<{
    id: number
    date: string
    value: number
    return_percentage: number | null
  }>
}

export default function PortfolioDashboard() {
  const [stats, setStats] = useState<PortfolioStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await portfolioAPI.getPerformanceStats()
      setStats(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load portfolio performance')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading portfolio performance...</div>
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-800">{error}</div>
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No portfolio performance data available.</p>
      </div>
    )
  }

  // Prepare chart data
  const chartData: any[] = []
  stats.forEach((stat) => {
    stat.performance_records.forEach((record) => {
      const existing = chartData.find((d) => d.date === record.date)
      if (existing) {
        existing[stat.portfolio_name] = record.value
      } else {
        const newEntry: any = { date: record.date }
        newEntry[stat.portfolio_name] = record.value
        chartData.push(newEntry)
      }
    })
  })

  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Portfolio Performance</h1>
        <p className="mt-1 text-sm text-gray-600">Track your portfolio performance over time</p>
      </div>

      {/* Portfolio Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.portfolio_id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-sm font-medium text-gray-500">Portfolio</div>
                  <div className="text-lg font-semibold text-gray-900">{stat.portfolio_name}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current Value</span>
                  <span className="font-medium text-gray-900">
                    {stat.current_value.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Initial Value</span>
                  <span className="font-medium text-gray-900">
                    {stat.initial_value.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Total Return</span>
                  <span
                    className={`font-medium ${
                      stat.total_return >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.total_return >= 0 ? '+' : ''}
                    {stat.total_return.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Return %</span>
                  <span
                    className={`font-medium ${
                      stat.total_return_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.total_return_percentage >= 0 ? '+' : ''}
                    {stat.total_return_percentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      {chartData.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis
                tickFormatter={(value) =>
                  value.toLocaleString('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
                }
              />
              <Tooltip
                formatter={(value: number) =>
                  value.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })
                }
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              {stats.map((stat, index) => (
                <Line
                  key={stat.portfolio_id}
                  type="monotone"
                  dataKey={stat.portfolio_name}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
