import { useState, useEffect } from 'react'
import { subscriptionAPI, portfolioAPI } from '../../api/portfolioClient'

interface User {
  id: number
  email: string
  full_name: string | null
}

interface Opportunity {
  id: number
  title: string
  currency: string
  type: string
  investment_amount: number | null
}

interface Subscription {
  id: number
  user_id: number
  opportunity_id: number
  subscribed_amount: number | null
  status: string
  notes: string | null
  created_at: string
  updated_at: string
  opportunity: Opportunity
  user?: User
  investment?: { id: number } | null
}

interface Portfolio {
  id: number
  name: string
  currency: string
}

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [convertFormData, setConvertFormData] = useState({
    portfolio_id: '',
    investment_date: new Date().toISOString().split('T')[0],
    current_value: '',
    notes: '',
  })

  useEffect(() => {
    loadSubscriptions()
    loadPortfolios()
  }, [filterStatus])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      const data = await subscriptionAPI.getAllSubscriptions()
      let filtered = data
      if (filterStatus) {
        filtered = data.filter((sub: Subscription) => sub.status === filterStatus)
      }
      setSubscriptions(filtered)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  const loadPortfolios = async () => {
    try {
      const data = await portfolioAPI.getPortfolios()
      // Filter portfolios - if they have a status field, filter by it, otherwise include all
      setPortfolios(data.filter((p: any) => !('is_active' in p) || p.is_active === true))
    } catch (err: any) {
      console.error('Failed to load portfolios:', err)
    }
  }

  const handleApprove = async (subscriptionId: number) => {
    if (!confirm('Approve this subscription?')) return
    try {
      await subscriptionAPI.updateSubscription(subscriptionId, { status: 'approved' })
      loadSubscriptions()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to approve subscription')
    }
  }

  const handleReject = async (subscriptionId: number) => {
    if (!confirm('Reject this subscription?')) return
    try {
      await subscriptionAPI.updateSubscription(subscriptionId, { status: 'rejected' })
      loadSubscriptions()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reject subscription')
    }
  }

  const handleConvertClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    const amount = subscription.subscribed_amount || subscription.opportunity.investment_amount || 0
    setConvertFormData({
      portfolio_id: '',
      investment_date: new Date().toISOString().split('T')[0],
      current_value: amount.toString(),
      notes: subscription.notes || '',
    })
    setShowConvertModal(true)
  }

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubscription) return

    try {
      await subscriptionAPI.convertToInvestment(selectedSubscription.id, {
        portfolio_id: parseInt(convertFormData.portfolio_id),
        investment_date: convertFormData.investment_date,
        current_value: convertFormData.current_value ? parseFloat(convertFormData.current_value) : null,
        notes: convertFormData.notes || null,
      })
      setShowConvertModal(false)
      setSelectedSubscription(null)
      loadSubscriptions()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to convert subscription to investment')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading && subscriptions.length === 0) {
    return <div className="text-center py-8">Loading subscriptions...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
        <p className="mt-1 text-sm text-gray-600">Review and manage investment subscriptions</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full max-w-xs border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {subscriptions.map((subscription) => {
            const amount = subscription.subscribed_amount || subscription.opportunity.investment_amount || 0
            return (
              <li key={subscription.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {subscription.opportunity.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            subscription.opportunity.type === 'real_estate'
                              ? 'bg-purple-100 text-purple-800'
                              : subscription.opportunity.type === 'private_equity'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {subscription.opportunity.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                            subscription.status
                          )}`}
                        >
                          {subscription.status.toUpperCase()}
                        </span>
                        {subscription.investment && (
                          <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded">
                            CONVERTED
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">User:</span>{' '}
                          {subscription.user?.full_name || subscription.user?.email || `User ID: ${subscription.user_id}`}
                        </p>
                        <p>
                          <span className="font-medium">Subscribed Amount:</span>{' '}
                          {amount.toLocaleString('en-US', {
                            style: 'currency',
                            currency: subscription.opportunity.currency,
                          })}
                        </p>
                        {subscription.notes && (
                          <p>
                            <span className="font-medium">Notes:</span> {subscription.notes}
                          </p>
                        )}
                        <p className="text-gray-500">
                          Created: {new Date(subscription.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {subscription.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(subscription.id)}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(subscription.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {subscription.status === 'approved' && !subscription.investment && (
                        <button
                          onClick={() => handleConvertClick(subscription)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Convert to Investment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {subscriptions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No subscriptions found.</p>
        </div>
      )}

      {showConvertModal && selectedSubscription && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Convert Subscription to Investment
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Converting: <strong>{selectedSubscription.opportunity.title}</strong>
              <br />
              User: {selectedSubscription.user?.full_name || selectedSubscription.user?.email}
              <br />
              Amount:{' '}
              {(selectedSubscription.subscribed_amount ||
                selectedSubscription.opportunity.investment_amount ||
                0
              ).toLocaleString('en-US', {
                style: 'currency',
                currency: selectedSubscription.opportunity.currency,
              })}
            </p>
            <form onSubmit={handleConvertSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Portfolio *</label>
                <select
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={convertFormData.portfolio_id}
                  onChange={(e) =>
                    setConvertFormData({ ...convertFormData, portfolio_id: e.target.value })
                  }
                >
                  <option value="">Select Portfolio</option>
                  {portfolios.map((portfolio) => (
                    <option key={portfolio.id} value={portfolio.id}>
                      {portfolio.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Investment Date *</label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={convertFormData.investment_date}
                  onChange={(e) =>
                    setConvertFormData({ ...convertFormData, investment_date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Value</label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={convertFormData.current_value}
                  onChange={(e) =>
                    setConvertFormData({ ...convertFormData, current_value: e.target.value })
                  }
                  placeholder="Leave empty to use subscribed amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  value={convertFormData.notes}
                  onChange={(e) =>
                    setConvertFormData({ ...convertFormData, notes: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConvertModal(false)
                    setSelectedSubscription(null)
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Convert to Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
