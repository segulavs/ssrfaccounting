import { useState, useEffect } from 'react'
import { api, DashboardStats, Project, ProjectStats } from '../api/client'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subWeeks, subMonths, subQuarters, subYears } from 'date-fns'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<number | undefined>(undefined)
  const [periodType, setPeriodType] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(format(endOfMonth(new Date()), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    loadStats()
  }, [selectedProject, periodType, startDate, endDate])

  const loadProjects = async () => {
    try {
      const data = await api.getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await api.getDashboardStats({
        project_id: selectedProject,
        start_date: startDate,
        end_date: endDate,
        period_type: periodType,
      })
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (type: 'week' | 'month' | 'quarter' | 'year') => {
    setPeriodType(type)
    const now = new Date()
    let start: Date, end: Date

    switch (type) {
      case 'week':
        start = startOfWeek(now)
        end = endOfWeek(now)
        break
      case 'month':
        start = startOfMonth(now)
        end = endOfMonth(now)
        break
      case 'quarter':
        start = startOfQuarter(now)
        end = endOfQuarter(now)
        break
      case 'year':
        start = startOfYear(now)
        end = endOfYear(now)
        break
    }

    setStartDate(format(start, 'yyyy-MM-dd'))
    setEndDate(format(end, 'yyyy-MM-dd'))
  }

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const currentStart = new Date(startDate)
    let newStart: Date

    if (direction === 'prev') {
      switch (periodType) {
        case 'week':
          newStart = subWeeks(currentStart, 1)
          break
        case 'month':
          newStart = subMonths(currentStart, 1)
          break
        case 'quarter':
          newStart = subQuarters(currentStart, 1)
          break
        case 'year':
          newStart = subYears(currentStart, 1)
          break
      }
    } else {
      switch (periodType) {
        case 'week':
          newStart = new Date(currentStart.getTime() + 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          newStart = new Date(currentStart.getFullYear(), currentStart.getMonth() + 1, 1)
          break
        case 'quarter':
          newStart = new Date(currentStart.getFullYear(), currentStart.getMonth() + 3, 1)
          break
        case 'year':
          newStart = new Date(currentStart.getFullYear() + 1, 0, 1)
          break
      }
    }

    let newEnd: Date
    switch (periodType) {
      case 'week':
        newEnd = endOfWeek(newStart)
        break
      case 'month':
        newEnd = endOfMonth(newStart)
        break
      case 'quarter':
        newEnd = endOfQuarter(newStart)
        break
      case 'year':
        newEnd = endOfYear(newStart)
        break
    }

    setStartDate(format(newStart, 'yyyy-MM-dd'))
    setEndDate(format(newEnd, 'yyyy-MM-dd'))
  }

  const chartData = stats?.transactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t) => ({
      date: format(new Date(t.date), 'MMM dd'),
      income: t.amount > 0 ? t.amount : 0,
      expense: t.amount < 0 ? Math.abs(t.amount) : 0,
    })) || []

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={selectedProject || ''}
                onChange={(e) => setSelectedProject(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period Type</label>
              <select
                value={periodType}
                onChange={(e) => handlePeriodChange(e.target.value as any)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="quarter">Quarter</option>
                <option value="year">Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => navigatePeriod('prev')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              ← Previous
            </button>
            <button
              onClick={() => navigatePeriod('next')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : stats ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Total Income</div>
              <div className="text-2xl font-bold text-green-600 mt-2">
                {stats.total_income.toFixed(2)} {stats.transactions.length > 0 ? (stats.transactions[0] as any).currency || 'EUR' : 'EUR'}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Total Expenses</div>
              <div className="text-2xl font-bold text-red-600 mt-2">
                {stats.total_expenses.toFixed(2)} {stats.transactions.length > 0 ? (stats.transactions[0] as any).currency || 'EUR' : 'EUR'}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Net Amount</div>
              <div className={`text-2xl font-bold mt-2 ${stats.net_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.net_amount.toFixed(2)} {stats.transactions.length > 0 ? (stats.transactions[0] as any).currency || 'EUR' : 'EUR'}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Transactions</div>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {stats.bank_transaction_count + stats.cash_transaction_count}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {stats.bank_transaction_count} bank, {stats.cash_transaction_count} cash
              </div>
            </div>
          </div>

          {/* Project-wise Income/Expense Breakdown */}
          {stats.project_stats && stats.project_stats.length > 0 && (
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Project-wise Income & Expenses</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Income</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expenses</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Amount</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Transactions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.project_stats.map((projectStat: ProjectStats) => (
                      <tr key={projectStat.project_id || 'untagged'} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {projectStat.project_name || 'Untagged'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                          {projectStat.income.toFixed(2)} {stats.transactions.length > 0 ? (stats.transactions[0] as any).currency || 'EUR' : 'EUR'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                          {projectStat.expenses.toFixed(2)} {stats.transactions.length > 0 ? (stats.transactions[0] as any).currency || 'EUR' : 'EUR'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                          projectStat.net_amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {projectStat.net_amount.toFixed(2)} {stats.transactions.length > 0 ? (stats.transactions[0] as any).currency || 'EUR' : 'EUR'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                          {projectStat.transaction_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Total</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-bold">
                        {stats.total_income.toFixed(2)} {stats.transactions.length > 0 ? (stats.transactions[0] as any).currency || 'EUR' : 'EUR'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-bold">
                        {stats.total_expenses.toFixed(2)} {stats.transactions.length > 0 ? (stats.transactions[0] as any).currency || 'EUR' : 'EUR'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                        stats.net_amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stats.net_amount.toFixed(2)} {stats.transactions.length > 0 ? (stats.transactions[0] as any).currency || 'EUR' : 'EUR'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-bold">
                        {stats.bank_transaction_count + stats.cash_transaction_count}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Income" />
                  <Bar dataKey="expense" fill="#ef4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Net Amount Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    name="Income"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    name="Expenses"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.transactions.slice(0, 10).map((t) => (
                    <tr key={t.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(t.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{t.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t.project?.name || '-'}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                          t.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {t.amount.toFixed(2)} {t.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">No data available</div>
      )}
    </div>
  )
}
