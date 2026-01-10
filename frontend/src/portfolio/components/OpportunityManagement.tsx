import { useState, useEffect } from 'react'
import { opportunityAPI } from '../../api/portfolioClient'

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

export default function OpportunityManagement() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    investment_amount: '',
    currency: 'EUR',
    type: 'real_estate',
    status: 'open',
  })
  const [uploadingDocument, setUploadingDocument] = useState<number | null>(null)

  useEffect(() => {
    loadOpportunities()
  }, [filterStatus])

  const loadOpportunities = async () => {
    try {
      setLoading(true)
      const data = await opportunityAPI.getOpportunities(filterStatus || undefined)
      setOpportunities(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load opportunities')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingOpportunity(null)
    setFormData({
      title: '',
      description: '',
      investment_amount: '',
      currency: 'EUR',
      type: 'real_estate',
      status: 'open',
    })
    setShowModal(true)
  }

  const handleEdit = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity)
    setFormData({
      title: opportunity.title,
      description: opportunity.description || '',
      investment_amount: opportunity.investment_amount?.toString() || '',
      currency: opportunity.currency,
      type: opportunity.type,
      status: opportunity.status,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const opportunityData: any = {
        title: formData.title,
        description: formData.description || null,
        investment_amount: formData.investment_amount ? parseFloat(formData.investment_amount) : null,
        currency: formData.currency,
        type: formData.type,
      }

      if (editingOpportunity) {
        await opportunityAPI.updateOpportunity(editingOpportunity.id, {
          ...opportunityData,
          status: formData.status,
        })
      } else {
        await opportunityAPI.createOpportunity(opportunityData)
      }
      setShowModal(false)
      loadOpportunities()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save opportunity')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return
    try {
      await opportunityAPI.deleteOpportunity(id)
      loadOpportunities()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete opportunity')
    }
  }

  const handleFileUpload = async (opportunityId: number, file: File) => {
    try {
      setUploadingDocument(opportunityId)
      await opportunityAPI.uploadDocument(opportunityId, file)
      loadOpportunities()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload document')
    } finally {
      setUploadingDocument(null)
    }
  }

  const handleDeleteDocument = async (opportunityId: number, documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    try {
      await opportunityAPI.deleteDocument(opportunityId, documentId)
      loadOpportunities()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete document')
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
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && opportunities.length === 0) {
    return <div className="text-center py-8">Loading opportunities...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Opportunity Management</h1>
          <p className="mt-1 text-sm text-gray-600">Create and manage investment opportunities</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Opportunity
        </button>
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
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {opportunities.map((opportunity) => (
            <li key={opportunity.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">{opportunity.title}</h3>
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${
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
                        className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                          opportunity.status
                        )}`}
                      >
                        {opportunity.status.toUpperCase()}
                      </span>
                    </div>
                    {opportunity.description && (
                      <p className="mt-1 text-sm text-gray-600">{opportunity.description}</p>
                    )}
                    <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                      {opportunity.investment_amount && (
                        <span>
                          Amount:{' '}
                          {opportunity.investment_amount.toLocaleString('en-US', {
                            style: 'currency',
                            currency: opportunity.currency,
                          })}
                        </span>
                      )}
                      <span>
                        Created: {new Date(opportunity.created_at).toLocaleDateString()}
                      </span>
                      {opportunity.documents && opportunity.documents.length > 0 && (
                        <span>{opportunity.documents.length} document(s)</span>
                      )}
                    </div>

                    {opportunity.documents && opportunity.documents.length > 0 && (
                      <div className="mt-4">
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
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    handleDownload(opportunity.id, doc.id, doc.filename)
                                  }
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  Download
                                </button>
                                <button
                                  onClick={() => handleDeleteDocument(opportunity.id, doc.id)}
                                  className="text-sm text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Document
                      </label>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(opportunity.id, file)
                          }
                        }}
                        disabled={uploadingDocument === opportunity.id}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {uploadingDocument === opportunity.id && (
                        <p className="mt-1 text-sm text-gray-500">Uploading...</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(opportunity)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(opportunity.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {opportunities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No opportunities found.</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingOpportunity ? 'Edit Opportunity' : 'Create Opportunity'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Investment Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.investment_amount}
                    onChange={(e) => setFormData({ ...formData, investment_amount: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
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
              </div>
              {editingOpportunity && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
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
                  {editingOpportunity ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
