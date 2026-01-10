import { useState, useEffect } from 'react'
import { portfolioAPI, investmentAPI } from '../../api/portfolioClient'

interface Portfolio {
  id: number
  name: string
  description: string | null
  initial_value: number
  current_value: number
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Investment {
  id: number
  name: string
  initial_amount: number
  current_value: number | null
  currency: string
  type: string
  status: string
  subscription_id: number | null
}

export default function PortfolioManagement() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [investments, setInvestments] = useState<Record<number, Investment[]>>({})
  const [expandedPortfolios, setExpandedPortfolios] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    initial_value: '',
    currency: 'EUR',
    current_value: '',
    is_active: true,
  })

  useEffect(() => {
    loadPortfolios()
  }, [])

  const loadPortfolios = async () => {
    try {
      setLoading(true)
      const data = await portfolioAPI.getPortfolios()
      setPortfolios(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load portfolios')
    } finally {
      setLoading(false)
    }
  }

  const loadInvestments = async (portfolioId: number) => {
    try {
      const data = await investmentAPI.getInvestments(portfolioId)
      setInvestments((prev) => ({ ...prev, [portfolioId]: data }))
    } catch (err: any) {
      console.error('Failed to load investments:', err)
    }
  }

  const togglePortfolioExpanded = (portfolioId: number) => {
    const newExpanded = new Set(expandedPortfolios)
    if (newExpanded.has(portfolioId)) {
      newExpanded.delete(portfolioId)
    } else {
      newExpanded.add(portfolioId)
      if (!investments[portfolioId]) {
        loadInvestments(portfolioId)
      }
    }
    setExpandedPortfolios(newExpanded)
  }

  const handleCreate = () => {
    setEditingPortfolio(null)
    setFormData({
      name: '',
      description: '',
      initial_value: '',
      currency: 'EUR',
      current_value: '',
      is_active: true,
    })
    setShowModal(true)
  }

  const handleEdit = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio)
    setFormData({
      name: portfolio.name,
      description: portfolio.description || '',
      initial_value: portfolio.initial_value.toString(),
      currency: portfolio.currency,
      current_value: portfolio.current_value.toString(),
      is_active: portfolio.is_active,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPortfolio) {
        await portfolioAPI.updatePortfolio(editingPortfolio.id, {
          name: formData.name,
          description: formData.description || null,
          current_value: parseFloat(formData.current_value),
          is_active: formData.is_active,
        })
      } else {
        await portfolioAPI.createPortfolio({
          name: formData.name,
          description: formData.description || null,
          initial_value: parseFloat(formData.initial_value),
          currency: formData.currency,
        })
      }
      setShowModal(false)
      loadPortfolios()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save portfolio')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this portfolio?')) return
    try {
      await portfolioAPI.deletePortfolio(id)
      loadPortfolios()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete portfolio')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading portfolios...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage investment portfolios</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Portfolio
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {portfolios.map((portfolio) => {
            const portfolioInvestments = investments[portfolio.id] || []
            const isExpanded = expandedPortfolios.has(portfolio.id)
            const totalInvested = portfolioInvestments.reduce((sum, inv) => sum + inv.initial_amount, 0)
            const totalCurrentValue = portfolioInvestments.reduce(
              (sum, inv) => sum + (inv.current_value || inv.initial_amount),
              0
            )

            return (
              <li key={portfolio.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <button
                          onClick={() => togglePortfolioExpanded(portfolio.id)}
                          className="mr-2 text-gray-400 hover:text-gray-600"
                        >
                          {isExpanded ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </button>
                        <h3 className="text-lg font-medium text-gray-900">{portfolio.name}</h3>
                        {!portfolio.is_active && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      {portfolio.description && (
                        <p className="mt-1 text-sm text-gray-600 ml-7">{portfolio.description}</p>
                      )}
                      <div className="mt-2 ml-7 flex space-x-4 text-sm text-gray-500">
                        <span>
                          Initial: {portfolio.initial_value.toLocaleString('en-US', {
                            style: 'currency',
                            currency: portfolio.currency,
                          })}
                        </span>
                        <span>
                          Current: {portfolio.current_value.toLocaleString('en-US', {
                            style: 'currency',
                            currency: portfolio.currency,
                          })}
                        </span>
                        <span>
                          Return: {((portfolio.current_value - portfolio.initial_value) / portfolio.initial_value * 100).toFixed(2)}%
                        </span>
                        {portfolioInvestments.length > 0 && (
                          <span className="text-blue-600">
                            {portfolioInvestments.length} investment{portfolioInvestments.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(portfolio)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(portfolio.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 ml-7 border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-900">Investments</h4>
                        {portfolioInvestments.length > 0 && (
                          <div className="text-sm text-gray-500">
                            Total Invested: {totalInvested.toLocaleString('en-US', {
                              style: 'currency',
                              currency: portfolio.currency,
                            })}{' '}
                            | Current Value: {totalCurrentValue.toLocaleString('en-US', {
                              style: 'currency',
                              currency: portfolio.currency,
                            })}
                          </div>
                        )}
                      </div>
                      {portfolioInvestments.length === 0 ? (
                        <p className="text-sm text-gray-500">No investments attached to this portfolio.</p>
                      ) : (
                        <div className="space-y-2">
                          {portfolioInvestments.map((investment) => {
                            const returnAmount = (investment.current_value || investment.initial_amount) - investment.initial_amount
                            const returnPercent = (returnAmount / investment.initial_amount) * 100
                            return (
                              <div
                                key={investment.id}
                                className="bg-gray-50 rounded-md p-3 flex justify-between items-center"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-900">{investment.name}</span>
                                    <span
                                      className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded ${
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
                                      className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded ${
                                        investment.status === 'active'
                                          ? 'bg-green-100 text-green-800'
                                          : investment.status === 'sold'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      {investment.status}
                                    </span>
                                    {investment.subscription_id && (
                                      <span className="ml-2 text-xs text-blue-600">
                                        (From Subscription #{investment.subscription_id})
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1 text-sm text-gray-600">
                                    <span>
                                      Initial: {investment.initial_amount.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: investment.currency,
                                      })}
                                    </span>
                                    {investment.current_value && (
                                      <>
                                        <span className="ml-4">
                                          Current: {investment.current_value.toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: investment.currency,
                                          })}
                                        </span>
                                        <span
                                          className={`ml-4 font-medium ${
                                            returnAmount >= 0 ? 'text-green-600' : 'text-red-600'
                                          }`}
                                        >
                                          {returnAmount >= 0 ? '+' : ''}
                                          {returnAmount.toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: investment.currency,
                                          })}{' '}
                                          ({returnPercent >= 0 ? '+' : ''}
                                          {returnPercent.toFixed(2)}%)
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingPortfolio ? 'Edit Portfolio' : 'Create Portfolio'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
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
              {!editingPortfolio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Initial Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.initial_value}
                    onChange={(e) => setFormData({ ...formData, initial_value: e.target.value })}
                  />
                </div>
              )}
              {editingPortfolio && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Value</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      value={formData.current_value}
                      onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                </>
              )}
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
                  {editingPortfolio ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
