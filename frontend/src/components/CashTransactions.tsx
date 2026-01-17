import { useState, useEffect, useRef } from 'react'
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
    selectedProjectIds: [] as number[],
  })
  const [selectedProject, setSelectedProject] = useState<number | undefined>(undefined)
  const [projectSearchTerm, setProjectSearchTerm] = useState('')
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const projectDropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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
      const amount = parseFloat(formData.amount)
      const selectedProjects = formData.selectedProjectIds
      
      if (selectedProjects.length === 0) {
        // No projects selected, create single transaction without project
        await api.createCashTransaction({
          date: formData.date,
          amount: amount,
          currency: formData.currency,
          description: formData.description,
          project_id: undefined,
        })
      } else if (selectedProjects.length === 1) {
        // Single project selected, create one transaction
        await api.createCashTransaction({
          date: formData.date,
          amount: amount,
          currency: formData.currency,
          description: formData.description,
          project_id: selectedProjects[0],
        })
      } else {
        // Multiple projects selected, split amount across all projects
        const splitAmount = amount / selectedProjects.length
        for (const projectId of selectedProjects) {
          await api.createCashTransaction({
            date: formData.date,
            amount: splitAmount,
            currency: formData.currency,
            description: formData.description,
            project_id: projectId,
          })
        }
      }
      
      setShowForm(false)
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: '',
        currency: 'EUR',
        description: '',
        selectedProjectIds: [],
      })
      setProjectSearchTerm('')
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

  const addProjectTag = (projectId: number) => {
    if (!formData.selectedProjectIds.includes(projectId)) {
      setFormData({
        ...formData,
        selectedProjectIds: [...formData.selectedProjectIds, projectId],
      })
    }
    setProjectSearchTerm('')
    setShowProjectDropdown(false)
  }

  const removeProjectTag = (projectId: number) => {
    setFormData({
      ...formData,
      selectedProjectIds: formData.selectedProjectIds.filter((id) => id !== projectId),
    })
  }

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(projectSearchTerm.toLowerCase()) &&
      !formData.selectedProjectIds.includes(project.id)
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowProjectDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
              {formData.amount && formData.selectedProjectIds.length > 1 && (
                <p className="mt-1 text-sm text-gray-500">
                  Split amount: {(parseFloat(formData.amount) / formData.selectedProjectIds.length).toFixed(2)} {formData.currency} per project
                </p>
              )}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Projects (Tags)</label>
              <div className="relative">
                <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[42px] bg-white">
                  {formData.selectedProjectIds.map((projectId) => {
                    const project = projects.find((p) => p.id === projectId)
                    return project ? (
                      <span
                        key={projectId}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {project.name}
                        <button
                          type="button"
                          onClick={() => removeProjectTag(projectId)}
                          className="text-blue-600 hover:text-blue-800 focus:outline-none"
                        >
                          ×
                        </button>
                      </span>
                    ) : null
                  })}
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={projectSearchTerm}
                    onChange={(e) => {
                      setProjectSearchTerm(e.target.value)
                      setShowProjectDropdown(true)
                    }}
                    onFocus={() => setShowProjectDropdown(true)}
                    placeholder={formData.selectedProjectIds.length === 0 ? 'Type to search projects...' : 'Add another project...'}
                    className="flex-1 min-w-[150px] border-0 outline-none focus:ring-0"
                  />
                </div>
                {showProjectDropdown && filteredProjects.length > 0 && (
                  <div
                    ref={projectDropdownRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                  >
                    {filteredProjects.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          addProjectTag(project.id)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        {project.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {formData.selectedProjectIds.length === 0
                  ? 'No projects selected. Amount will not be assigned to any project.'
                  : formData.selectedProjectIds.length === 1
                  ? 'Single project selected. Full amount will be assigned to this project.'
                  : `${formData.selectedProjectIds.length} projects selected. Amount will be split equally between projects.`}
              </p>
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
