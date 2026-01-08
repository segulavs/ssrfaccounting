import { useState, useEffect } from 'react'
import { api, Transaction, Project } from '../api/client'
import { format } from 'date-fns'

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<number | undefined>(undefined)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editProjectId, setEditProjectId] = useState<number | undefined>(undefined)
  const [csvPreview, setCsvPreview] = useState<{ columns: string[]; sample_rows: any[] } | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [showMappingModal, setShowMappingModal] = useState(false)
  const [draggedField, setDraggedField] = useState<string | null>(null)
  
  // Define field order: Date first, then Amount, then others
  const [fieldOrder, setFieldOrder] = useState<string[]>([
    'date',
    'amount',
    'transaction_type',
    'debit',
    'credit',
    'reference',
    'description',
    'currency',
    'account_number',
    'statement_number'
  ])
  
  const fieldConfig: Record<string, { label: string; required: boolean; helpText?: string }> = {
    date: { label: 'Date', required: true },
    amount: { label: 'Amount', required: true, helpText: 'Or use Transaction Type + Amount, or Debit/Credit columns' },
    transaction_type: { label: 'Transaction Type (Debit or Credit)', required: false, helpText: 'Column containing "Debit" or "Credit" text. If "Debit", amount will be negative. If "Credit", amount will be positive.' },
    debit: { label: 'Debit (will be negative)', required: false },
    credit: { label: 'Credit (will be positive)', required: false },
    reference: { label: 'Reference', required: false },
    description: { label: 'Description', required: false },
    currency: { label: 'Currency', required: false, helpText: 'Defaults to EUR if not specified' },
    account_number: { label: 'Account Number', required: false },
    statement_number: { label: 'Statement Number', required: false }
  }
  const [uploadBatches, setUploadBatches] = useState<Array<{
    upload_batch_id: string
    upload_type: string
    transaction_count: number
    created_at: string
    account_number?: string
    statement_number?: string
  }>>([])
  const [showBatchesModal, setShowBatchesModal] = useState(false)

  useEffect(() => {
    loadTransactions()
    loadProjects()
    loadUploadBatches()
  }, [selectedProject])

  const loadUploadBatches = async () => {
    try {
      const data = await api.getUploadBatches()
      setUploadBatches(data)
    } catch (error) {
      console.error('Failed to load upload batches:', error)
    }
  }

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const data = await api.getTransactions(
        selectedProject ? { project_id: selectedProject } : undefined
      )
      setTransactions(data)
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProjects = async () => {
    try {
      const data = await api.getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const handleMT940Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await api.uploadMT940(file)
      await loadTransactions()
      await loadUploadBatches()
      alert('MT940 file uploaded successfully!')
    } catch (error: any) {
      alert(`Failed to upload: ${error.response?.data?.detail || error.message}`)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleCSVFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const preview = await api.previewCSV(file)
      setCsvPreview(preview)
      setCsvFile(file)
      
      // Auto-detect column mappings
      const autoMapping: Record<string, string> = {}
      const fieldNames = ['date', 'amount', 'debit', 'credit', 'transaction_type', 'reference', 'description', 'currency', 'account_number', 'statement_number']
      
      preview.columns.forEach(col => {
        const colLower = col.toLowerCase()
        for (const field of fieldNames) {
          if (colLower.includes(field) || colLower === field) {
            if (!autoMapping[field]) {
              autoMapping[field] = col
            }
          }
        }
        // Special handling for transaction type column
        if (!autoMapping.transaction_type) {
          const colLower = col.toLowerCase()
          if (colLower.includes('debit or credit') || colLower.includes('debit/credit') || 
              colLower.includes('transaction type') || colLower === 'type' || colLower === 'd/c' || colLower === 'dc') {
            autoMapping.transaction_type = col
          }
        }
      })
      
      setColumnMapping(autoMapping)
      // Reset field order to default when opening modal
      setFieldOrder([
        'date',
        'amount',
        'transaction_type',
        'debit',
        'credit',
        'reference',
        'description',
        'currency',
        'account_number',
        'statement_number'
      ])
      setShowMappingModal(true)
    } catch (error: any) {
      alert(`Failed to preview CSV: ${error.response?.data?.detail || error.message}`)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleCSVUpload = async () => {
    if (!csvFile) return

    setUploading(true)
    try {
      await api.uploadCSV(csvFile, columnMapping)
      await loadTransactions()
      await loadUploadBatches()
      setShowMappingModal(false)
      setCsvPreview(null)
      setCsvFile(null)
      setColumnMapping({})
      alert('CSV file uploaded successfully!')
    } catch (error: any) {
      alert(`Failed to upload: ${error.response?.data?.detail || error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateProject = async (transactionId: number) => {
    try {
      await api.updateTransaction(transactionId, { project_id: editProjectId })
      setEditingId(null)
      await loadTransactions()
    } catch (error) {
      console.error('Failed to update transaction:', error)
      alert('Failed to update transaction')
    }
  }

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm('Are you sure you want to delete all transactions from this upload? This cannot be undone.')) {
      return
    }

    try {
      const result = await api.deleteUploadBatch(batchId)
      await loadTransactions()
      await loadUploadBatches()
      alert(`Successfully deleted ${result.deleted_count} transactions from this upload batch.`)
    } catch (error: any) {
      alert(`Failed to delete batch: ${error.response?.data?.detail || error.message}`)
    }
  }

  const handleDeleteAllTransactions = async () => {
    if (!confirm('Are you sure you want to delete ALL bank transactions? This action cannot be undone and will delete all transactions from all uploads.')) {
      return
    }

    if (!confirm('This is your final warning. All bank transactions will be permanently deleted. Continue?')) {
      return
    }

    try {
      const result = await api.deleteAllTransactions()
      await loadTransactions()
      await loadUploadBatches()
      alert(`Successfully deleted all ${result.deleted_count} transactions.`)
    } catch (error: any) {
      let errorMessage = 'Unknown error occurred'
      if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else {
        errorMessage = JSON.stringify(error)
      }
      alert(`Failed to delete all transactions: ${errorMessage}`)
      console.error('Delete all transactions error:', error)
    }
  }


  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Bank Transactions</h2>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Project</label>
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value ? parseInt(e.target.value) : undefined)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload MT940</label>
              <input
                type="file"
                accept=".940,.txt"
                onChange={handleMT940Upload}
                disabled={uploading}
                className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload CSV</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVFileSelect}
                disabled={uploading}
                className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBatchesModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
              >
                Manage Uploads
              </button>
              <button
                onClick={handleDeleteAllTransactions}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
              >
                Clear All Transactions
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No transactions found. Upload an MT940 or CSV file to get started.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {editingId === t.id ? (
                          <select
                            value={editProjectId || ''}
                            onChange={(e) => setEditProjectId(e.target.value ? parseInt(e.target.value) : undefined)}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                            onBlur={() => handleUpdateProject(t.id)}
                            autoFocus
                          >
                            <option value="">No Project</option>
                            {projects.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className="text-blue-600 cursor-pointer hover:underline"
                            onClick={() => {
                              setEditingId(t.id)
                              setEditProjectId(t.project_id)
                            }}
                          >
                            {t.project?.name || 'Click to tag'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(t.date), 'MMM dd, yyyy')}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                          t.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {t.amount.toFixed(2)} {t.currency}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{t.reference || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{t.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t.account_number || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CSV Column Mapping Modal */}
      {showMappingModal && csvPreview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Map CSV Columns</h3>
              
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600 mb-2">Available columns in your CSV:</p>
                <div className="flex flex-wrap gap-2">
                  {csvPreview.columns.map((col) => (
                    <span key={col} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">Drag rows to reorder fields. Map each field to a column from your CSV.</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8"></th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CSV Column</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {fieldOrder.map((fieldKey, index) => {
                        const field = fieldConfig[fieldKey]
                        if (!field) return null
                        
                        return (
                          <tr
                            key={fieldKey}
                            draggable
                            onDragStart={(e) => {
                              setDraggedField(fieldKey)
                              e.dataTransfer.effectAllowed = 'move'
                            }}
                            onDragOver={(e) => {
                              e.preventDefault()
                              e.dataTransfer.dropEffect = 'move'
                              const target = e.currentTarget
                              if (draggedField && draggedField !== fieldKey) {
                                target.classList.add('opacity-50')
                              }
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.classList.remove('opacity-50')
                            }}
                            onDrop={(e) => {
                              e.preventDefault()
                              e.currentTarget.classList.remove('opacity-50')
                              
                              if (draggedField && draggedField !== fieldKey) {
                                const newOrder = [...fieldOrder]
                                const draggedIndex = newOrder.indexOf(draggedField)
                                const targetIndex = newOrder.indexOf(fieldKey)
                                
                                newOrder.splice(draggedIndex, 1)
                                newOrder.splice(targetIndex, 0, draggedField)
                                
                                setFieldOrder(newOrder)
                                setDraggedField(null)
                              }
                            }}
                            onDragEnd={(e) => {
                              setDraggedField(null)
                              const rows = e.currentTarget.parentElement?.querySelectorAll('tr') || []
                              rows.forEach(row => row.classList.remove('opacity-50'))
                            }}
                            className={`cursor-move hover:bg-gray-50 ${draggedField === fieldKey ? 'opacity-50' : ''}`}
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-gray-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                              </svg>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <label className="text-sm font-medium text-gray-700">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </label>
                              {field.helpText && (
                                <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={columnMapping[fieldKey] || ''}
                                onChange={(e) => setColumnMapping({ ...columnMapping, [fieldKey]: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="">Select column...</option>
                                {csvPreview.columns.map((col) => (
                                  <option key={col} value={col}>
                                    {col}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {csvPreview.sample_rows.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Sample data (first {csvPreview.sample_rows.length} rows):</p>
                  <div className="overflow-x-auto border rounded">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          {csvPreview.columns.map((col) => (
                            <th key={col} className="px-3 py-2 text-left border-b">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.sample_rows.map((row, idx) => (
                          <tr key={idx} className="border-b">
                            {csvPreview.columns.map((col) => (
                              <td key={col} className="px-3 py-2">
                                {row[col] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowMappingModal(false)
                    setCsvPreview(null)
                    setCsvFile(null)
                    setColumnMapping({})
                    setDraggedField(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCSVUpload}
                  disabled={
                    uploading || 
                    !columnMapping.date || 
                    (!columnMapping.amount && !columnMapping.debit && !columnMapping.credit) ||
                    (columnMapping.transaction_type && !columnMapping.amount)
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload CSV'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Batches Modal */}
      {showBatchesModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Upload Batches</h3>
                <button
                  onClick={() => setShowBatchesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {uploadBatches.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No upload batches found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upload Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statement</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Transactions</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {uploadBatches.map((batch) => (
                        <tr key={batch.upload_batch_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              batch.upload_type === 'MT940' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {batch.upload_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(batch.created_at), 'MMM dd, yyyy HH:mm')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {batch.account_number || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {batch.statement_number || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {batch.transaction_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                            <button
                              onClick={() => handleDeleteBatch(batch.upload_batch_id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
