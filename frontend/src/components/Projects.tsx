import { useState, useEffect } from 'react'
import { api, Project } from '../api/client'
import { format } from 'date-fns'

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const data = await api.getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.updateProject(editingId, formData)
        setEditingId(null)
      } else {
        await api.createProject(formData)
      }
      setShowForm(false)
      setFormData({ name: '', description: '' })
      await loadProjects()
    } catch (error: any) {
      alert(`Failed to ${editingId ? 'update' : 'create'} project: ${error.response?.data?.detail || error.message}`)
    }
  }

  const handleEdit = (project: Project) => {
    setEditingId(project.id)
    setFormData({ name: project.name, description: project.description || '' })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project? All transaction tags will be removed.')) return

    try {
      await api.deleteProject(id)
      await loadProjects()
    } catch (error) {
      console.error('Failed to delete project:', error)
      alert('Failed to delete project')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', description: '' })
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
            setFormData({ name: '', description: '' })
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Create Project
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Project' : 'Create New Project'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Project name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                placeholder="Project description (optional)"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No projects found. Create your first project to get started.
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                )}
                <p className="text-xs text-gray-400 mb-4">
                  Created: {format(new Date(project.created_at), 'MMM dd, yyyy')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
