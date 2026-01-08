import axios from 'axios'

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '')

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Transaction {
  id: number
  date: string
  amount: number
  currency: string
  reference?: string
  description?: string
  account_number?: string
  statement_number?: string
  project_id?: number
  project?: Project
  projects?: Project[]  // Multiple projects assigned to this transaction
  created_at: string
}

export interface CashTransaction {
  id: number
  date: string
  amount: number
  currency: string
  description?: string
  project_id?: number
  project?: Project
  projects?: Project[]  // Multiple projects assigned to this transaction
  created_at: string
}

export interface Project {
  id: number
  name: string
  description?: string
  created_at: string
}

export interface ProjectStats {
  project_id?: number
  project_name?: string
  income: number
  expenses: number
  net_amount: number
  transaction_count: number
}

export interface DashboardStats {
  project_id?: number
  start_date: string
  end_date: string
  total_income: number
  total_expenses: number
  net_amount: number
  bank_transaction_count: number
  cash_transaction_count: number
  transactions: (Transaction | CashTransaction)[]
  project_stats?: ProjectStats[]
}

export const api = {
  // Transactions
  uploadMT940: async (file: File): Promise<Transaction[]> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/api/upload-mt940', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  previewCSV: async (file: File): Promise<{ columns: string[]; sample_rows: any[] }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/api/preview-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  uploadCSV: async (file: File, columnMapping?: Record<string, string>): Promise<Transaction[]> => {
    const formData = new FormData()
    formData.append('file', file)
    if (columnMapping) {
      formData.append('column_mapping', JSON.stringify(columnMapping))
    }
    const response = await apiClient.post('/api/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  getTransactions: async (params?: {
    project_id?: number
    start_date?: string
    end_date?: string
  }): Promise<Transaction[]> => {
    const response = await apiClient.get('/api/transactions', { params })
    return response.data
  },

  updateTransaction: async (
    id: number,
    data: { project_id?: number | undefined; project_ids?: number[]; description?: string }
  ): Promise<Transaction | Transaction[]> => {
    const response = await apiClient.patch(`/api/transactions/${id}`, data)
    return response.data
  },

  deleteTransaction: async (id: number): Promise<void> => {
    // Bank transactions cannot be deleted
    throw new Error('Bank transactions cannot be deleted')
  },

  // Upload Batches
  getUploadBatches: async (): Promise<Array<{
    upload_batch_id: string
    upload_type: string
    transaction_count: number
    created_at: string
    account_number?: string
    statement_number?: string
  }>> => {
    const response = await apiClient.get('/api/upload-batches')
    return response.data
  },

  deleteUploadBatch: async (batchId: string): Promise<{ message: string; deleted_count: number }> => {
    const response = await apiClient.delete(`/api/upload-batches/${batchId}`)
    return response.data
  },

  deleteAllTransactions: async (): Promise<{ message: string; deleted_count: number }> => {
    try {
      const response = await apiClient.delete('/api/transactions/all')
      return response.data
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data?.detail || error.response.data?.message || `Server error: ${error.response.status}`)
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server. Please check if the backend is running.')
      } else {
        // Something else happened
        throw new Error(error.message || 'Unknown error occurred')
      }
    }
  },

  // Cash Transactions
  createCashTransaction: async (
    data: Omit<CashTransaction, 'id' | 'created_at'>
  ): Promise<CashTransaction> => {
    const response = await apiClient.post('/api/cash-transactions', data)
    return response.data
  },

  getCashTransactions: async (params?: {
    project_id?: number
    start_date?: string
    end_date?: string
  }): Promise<CashTransaction[]> => {
    const response = await apiClient.get('/api/cash-transactions', { params })
    return response.data
  },

  updateCashTransaction: async (
    id: number,
    data: Partial<CashTransaction>
  ): Promise<CashTransaction> => {
    const response = await apiClient.patch(`/api/cash-transactions/${id}`, data)
    return response.data
  },

  deleteCashTransaction: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/cash-transactions/${id}`)
  },

  // Projects
  createProject: async (data: { name: string; description?: string }): Promise<Project> => {
    const response = await apiClient.post('/api/projects', data)
    return response.data
  },

  getProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get('/api/projects')
    return response.data
  },

  updateProject: async (
    id: number,
    data: { name: string; description?: string }
  ): Promise<Project> => {
    const response = await apiClient.put(`/api/projects/${id}`, data)
    return response.data
  },

  deleteProject: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/projects/${id}`)
  },

  // Dashboard
  getDashboardStats: async (data: {
    project_id?: number
    start_date: string
    end_date: string
    period_type?: string
  }): Promise<DashboardStats> => {
    const response = await apiClient.post('/api/dashboard/stats', data)
    return response.data
  },
}

export default apiClient
