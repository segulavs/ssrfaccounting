import { useState, useEffect } from 'react'
import { opportunityAPI, subscriptionAPI } from '../../api/portfolioClient'

interface Document {
  id: number
  filename: string
  file_size: number | null
  mime_type: string | null
  uploaded_at: string
}

interface Opportunity {
  id: number
  title: string
  description: string | null
  investment_amount: number | null
  currency: string
  type: string
  status: string
  created_at: string
  updated_at: string
  documents: Document[]
}

export default function InvestmentOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [subscribeAmount, setSubscribeAmount] = useState('')
  const [subscribeNotes, setSubscribeNotes] = useState('')

  useEffect(() => {
    loadOpportunities()
  }, [])

  const loadOpportunities = async () => {
    try {
      setLoading(true)
      const data = await opportunityAPI.getOpportunities('open')
      setOpportunities(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load opportunities')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity)
    setSubscribeAmount(opportunity.investment_amount?.toString() || '')
    setSubscribeNotes('')
    setShowSubscribeModal(true)
  }

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOpportunity) return

    try {
      await subscriptionAPI.subscribe(selectedOpportunity.id, {
        subscribed_amount: subscribeAmount ? parseFloat(subscribeAmount) : null,
        notes: subscribeNotes || null,
      })
      setShowSubscribeModal(false)
      alert('Successfully subscribed to this opportunity!')
      loadOpportunities()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to subscribe')
    }
  }

  const handleDownload = (opportunityId: number, documentId: number, filename: string) => {
    const url = opportunityAPI.downloadDocument(opportunityId, documentId)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return <div className="text-center py-8">Loading opportunities...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Investment Opportunities</h1>
        <p className="mt-1 text-sm text-gray-600">Browse and subscribe to investment opportunities</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {opportunities.map((opportunity) => (
          <div key={opportunity.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{opportunity.title}</h3>
                  {opportunity.description && (
                    <p className="mt-2 text-gray-600">{opportunity.description}</p>
                  )}
                  {opportunity.investment_amount && (
                    <p className="mt-2 text-sm text-gray-500">
                      Investment Amount:{' '}
                      <span className="font-medium">
                        {opportunity.investment_amount.toLocaleString('en-US', {
                          style: 'currency',
                          currency: opportunity.currency,
                        })}
                      </span>
                    </p>
                  )}
                  <div className="mt-4 flex space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        opportunity.type === 'real_estate'
                          ? 'bg-purple-100 text-purple-800'
                          : opportunity.type === 'private_equity'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {opportunity.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        opportunity.status === 'open'
                          ? 'bg-green-100 text-green-800'
                          : opportunity.status === 'closed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {opportunity.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                {opportunity.status === 'open' && (
                  <button
                    onClick={() => handleSubscribe(opportunity)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Subscribe
                  </button>
                )}
              </div>

              {opportunity.documents && opportunity.documents.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Documents</h4>
                  <div className="space-y-2">
                    {opportunity.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center">
                          <svg
                            className="h-5 w-5 text-gray-400 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="text-sm text-gray-700">{doc.filename}</span>
                          {doc.file_size && (
                            <span className="ml-2 text-xs text-gray-500">
                              ({(doc.file_size / 1024).toFixed(1)} KB)
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDownload(opportunity.id, doc.id, doc.filename)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {opportunities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No investment opportunities available at the moment.</p>
        </div>
      )}

      {showSubscribeModal && selectedOpportunity && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Subscribe to {selectedOpportunity.title}
            </h3>
            <form onSubmit={handleSubscribeSubmit} className="space-y-4">
              {selectedOpportunity.investment_amount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Investment Amount ({selectedOpportunity.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={subscribeAmount}
                    onChange={(e) => setSubscribeAmount(e.target.value)}
                    placeholder={selectedOpportunity.investment_amount.toString()}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Suggested: {selectedOpportunity.investment_amount.toLocaleString('en-US', {
                      style: 'currency',
                      currency: selectedOpportunity.currency,
                    })}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  value={subscribeNotes}
                  onChange={(e) => setSubscribeNotes(e.target.value)}
                  placeholder="Any additional notes or questions..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSubscribeModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
