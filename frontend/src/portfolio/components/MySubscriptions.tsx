import { useState, useEffect } from 'react'
import { subscriptionAPI, opportunityAPI } from '../../api/portfolioClient'

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
}

export default function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      const data = await subscriptionAPI.getMySubscriptions()
      setSubscriptions(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load subscriptions')
    } finally {
      setLoading(false)
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

  if (loading) {
    return <div className="text-center py-8">Loading subscriptions...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Subscriptions</h1>
        <p className="mt-1 text-sm text-gray-600">View your investment subscriptions</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {subscriptions.map((subscription) => (
          <div key={subscription.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-semibold text-gray-900">
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
                  </div>
                  {subscription.opportunity.description && (
                    <p className="mt-2 text-gray-600">{subscription.opportunity.description}</p>
                  )}
                  <div className="mt-4 space-y-1 text-sm">
                    {subscription.subscribed_amount && (
                      <p className="text-gray-700">
                        <span className="font-medium">Subscribed Amount:</span>{' '}
                        {subscription.subscribed_amount.toLocaleString('en-US', {
                          style: 'currency',
                          currency: subscription.opportunity.currency,
                        })}
                      </p>
                    )}
                    {subscription.notes && (
                      <p className="text-gray-700">
                        <span className="font-medium">Notes:</span> {subscription.notes}
                      </p>
                    )}
                    <p className="text-gray-500">
                      Subscribed on:{' '}
                      {new Date(subscription.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {subscription.opportunity.documents && subscription.opportunity.documents.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Documents</h4>
                  <div className="space-y-2">
                    {subscription.opportunity.documents.map((doc) => (
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
                          onClick={() =>
                            handleDownload(
                              subscription.opportunity.id,
                              doc.id,
                              doc.filename
                            )
                          }
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

      {subscriptions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">You have no subscriptions yet.</p>
        </div>
      )}
    </div>
  )
}
