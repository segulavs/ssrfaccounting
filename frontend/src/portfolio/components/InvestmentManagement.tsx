import { useState, useEffect } from 'react'
import { investmentAPI, portfolioAPI } from '../../api/portfolioClient'

interface Portfolio {
  id: number
  name: string
  currency: string
}

interface Investment {
  id: number
  name: string
  description: string | null
  initial_amount: number
  current_value: number | null
  currency: string
  type: string
  investment_date: string
  status: string
  notes: string | null
  portfolio_id: number
  subscription_id: number | null
  portfolio?: Portfolio
}

export default function InvestmentManagement() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)
  const [filterPortfolioId, setFilterPortfolioId] = useState<number | ''>('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    initial_amount: '',
    current_value: '',
    currency: 'EUR',
    type: 'real_estate',
    investment_date: new Date().toISOString().split('T')[0],
    status: 'active',
    notes: '',
    portfolio_id: '',
  })

  useEffect(() => {
    loadInvestments()
    loadPortfolios()
  }, [filterPortfolioId])

  const loadInvestments = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filterPortfolioId) {
        params.portfolio_id = Number(filterPortfolioId)
      }
      const data = await investmentAPI.getInvestments(params.portfolio_id, undefined, undefined)
      setInvestments(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load investments')
    } finally {
      setLoading(false)
    }
  }

  const loadPortfolios = async () => {
    try {
      const data = await portfolioAPI.getPortfolios()
      setPortfolios(data)
    } catch (err: any) {
      console.error('Failed to load portfolios:', err)
    }
  }

  const handleCreate = () => {
    setEditingInvestment(null)
    setFormData({
      name: '',
      description: '',
      initial_amount: '',
      current_value: '',
      currency: 'EUR',
      type: 'real_estate',
      investment_date: new Date().toISOString().split('T')[0],
      status: 'active',
      notes: '',
      portfolio_id: '',
    })
    setShowModal(true)
  }

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment)
    setFormData({
      name: investment.name,
      description: investment.description || '',
      initial_amount: investment.initial_amount.toString(),
      current_value: investment.current_value?.toString() || '',
      currency: investment.currency,
      type: investment.type,
      investment_date: investment.investment_date,
      status: investment.status,
      notes: investment.notes || '',
      portfolio_id: investment.portfolio_id.toString(),
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const investmentData: any = {
        name: formData.name,
        description: formData.description || null,
        initial_amount: parseFloat(formData.initial_amount),
        current_value: formData.current_value ? parseFloat(formData.current_value) : null,
        currency: formData.currency,
        type: formData.type,
        investment_date: formData.investment_date,
        status: formData.status,
        notes: formData.notes || null,
        portfolio_id: parseInt(formData.portfolio_id),
        opportunity_id: null, // Investments are independent from opportunities
      }

      if (editingInvestment) {
        await investmentAPI.updateInvestment(editingInvestment.id, investmentData)
      } else {
        await investmentAPI.createInvestment(investmentData)
      }
      setShowModal(false)
      loadInvestments()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save investment')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this investment?')) return
    try {
      await investmentAPI.deleteInvestment(id)
      loadInvestments()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete investment')
    }
  }

  const calculateReturn = (investment: Investment) => {
    if (!investment.current_value) return null
    const returnAmount = investment.current_value - investment.initial_amount
    const returnPercent = (returnAmount / investment.initial_amount) * 100
    return { returnAmount, returnPercent }
  }

  if (loading && investments.length === 0) {
    return <div className="text-center py-8">Loading investments...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage investments independently and attach them to portfolios</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Investment
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Portfolio</label>
          <select
            value={filterPortfolioId}
            onChange={(e) => setFilterPortfolioId(e.target.value ? Number(e.target.value) : '')}
            className="block w-full max-w-xs border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Portfolios</option>
            {portfolios.map((portfolio) => (
              <option key={portfolio.id} value={portfolio.id}>
                {portfolio.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {investments.map((investment) => {
            const returnData = calculateReturn(investment)
            return (
              <li key={investment.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">{investment.name}</h3>
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${
                            investment.type === 'real_estate'
                              ? 'bg-purple-100 text-purple-800'
                              : investment.type === 'private_equity'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {investment.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${
                            investment.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : investment.status === 'sold'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {investment.status.toUpperCase()}
                        </span>
                      </div>
                      {investment.description && (
                        <p className="mt-1 text-sm text-gray-600">{investment.description}</p>
                      )}
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Portfolio:</span>
                          <span className="ml-2 font-medium">
                            {investment.portfolio?.name || `ID: ${investment.portfolio_id}`}
                          </span>
                        </div>
                        {investment.subscription_id && (
                          <div>
                            <span className="text-gray-500">From Subscription:</span>
                            <span className="ml-2 font-medium text-blue-600">#{investment.subscription_id}</span>
                            <span className="ml-2 text-xs text-gray-400">(Converted from subscription)</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Initial:</span>
                          <span className="ml-2 font-medium">
                            {investment.initial_amount.toLocaleString('en-US', {
                              style: 'currency',
                              currency: investment.currency,
                            })}
                          </span>
                        </div>
                        {investment.current_value && (
                          <div>
                            <span className="text-gray-500">Current:</span>
                            <span className="ml-2 font-medium">
                              {investment.current_value.toLocaleString('en-US', {
                                style: 'currency',
                                currency: investment.currency,
                              })}
                            </span>
                          </div>
                        )}
                        {returnData && (
                          <div>
                            <span className="text-gray-500">Return:</span>
                            <span
                              className={`ml-2 font-medium ${
                                returnData.returnAmount >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {returnData.returnAmount.toLocaleString('en-US', {
                                style: 'currency',
                                currency: investment.currency,
                              })}{' '}
                              ({returnData.returnPercent.toFixed(2)}%)
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <span className="ml-2 font-medium">
                            {new Date(investment.investment_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(investment)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(investment.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {investments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No investments found.</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingInvestment ? 'Edit Investment' : 'Create Investment'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Portfolio *</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.portfolio_id}
                    onChange={(e) => setFormData({ ...formData, portfolio_id: e.target.value })}
                  >
                    <option value="">Select Portfolio</option>
                    {portfolios.map((portfolio) => (
                      <option key={portfolio.id} value={portfolio.id}>
                        {portfolio.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Initial Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.initial_amount}
                    onChange={(e) => setFormData({ ...formData, initial_amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Value</label>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.current_value}
                    onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type *</label>
                <select
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="real_estate">Real Estate</option>
                  <option value="private_equity">Private Equity</option>
                  <option value="building_loan">Building Loan</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Investment Date *</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.investment_date}
                    onChange={(e) => setFormData({ ...formData, investment_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="sold">Sold</option>
                    <option value="written_off">Written Off</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingInvestment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
