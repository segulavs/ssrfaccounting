import { useState, useEffect } from 'react'
import { api, CashTransaction, Project } from '../api/client'
import { format } from 'date-fns'

export default function CashTransactions() {
  const [transactions, setTransactions] = useState<CashTransaction[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    currency: 'EUR',
    description: '',
    project_id: undefined as number | undefined,
  })
  const [selectedProject, setSelectedProject] = useState<number | undefined>(undefined)

  useEffect(() => {
    loadTransactions()
    loadProjects()
  }, [selectedProject])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const data = await api.getCashTransactions(
        selectedProject ? { project_id: selectedProject } : undefined
      )
      setTransactions(data)
    } catch (error) {
      console.error('Failed to load cash transactions:', error)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createCashTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
        project_id: formData.project_id || undefined,
      })
      setShowForm(false)
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: '',
        currency: 'EUR',
        description: '',
        project_id: undefined,
      })
      await loadTransactions()
    } catch (error) {
      console.error('Failed to create cash transaction:', error)
      alert('Failed to create cash transaction')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      await api.deleteCashTransaction(id)
      await loadTransactions()
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      alert('Failed to delete transaction')
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Cash Transactions</h2>
        <div className="flex gap-4">
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
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Cash Transaction'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Add Cash Transaction</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="Negative for expenses"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={formData.project_id || ''}
                onChange={(e) =>
                  setFormData({ ...formData, project_id: e.target.value ? parseInt(e.target.value) : undefined })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">No Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No cash transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
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
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
