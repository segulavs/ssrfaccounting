import { useState, useEffect } from 'react'
import { invitationAPI } from '../../api/portfolioClient'

interface Invitation {
  id: number
  email: string
  token: string
  is_used: boolean
  expires_at: string
  created_at: string
  invited_by_id: number
}

export default function InvitationManagement() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadInvitations()
  }, [])

  const loadInvitations = async () => {
    try {
      setLoading(true)
      const data = await invitationAPI.getInvitations()
      setInvitations(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load invitations')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) return

    try {
      setCreating(true)
      await invitationAPI.createInvitation(newEmail.trim())
      setNewEmail('')
      loadInvitations()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create invitation')
    } finally {
      setCreating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Invitation token copied to clipboard!')
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return <div className="text-center py-8">Loading invitations...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invitation Management</h1>
        <p className="mt-1 text-sm text-gray-600">Create and manage user invitations</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Invitation</h2>
        <form onSubmit={handleCreateInvitation} className="flex space-x-2">
          <input
            type="email"
            required
            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
            placeholder="Email address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Invitation'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {invitations.map((invitation) => (
            <li key={invitation.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">{invitation.email}</p>
                      {invitation.is_used && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded">
                          Used
                        </span>
                      )}
                      {!invitation.is_used && isExpired(invitation.expires_at) && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded">
                          Expired
                        </span>
                      )}
                      {!invitation.is_used && !isExpired(invitation.expires_at) && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        Created: {new Date(invitation.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                    {!invitation.is_used && (
                      <div className="mt-3 flex items-center space-x-2">
                        <code className="px-3 py-1 bg-gray-100 rounded text-sm font-mono">
                          {invitation.token}
                        </code>
                        <button
                          onClick={() => copyToClipboard(invitation.token)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {invitations.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No invitations created yet.</p>
        </div>
      )}
    </div>
  )
}
