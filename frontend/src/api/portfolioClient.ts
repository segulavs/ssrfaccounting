import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('portfolio_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('portfolio_token');
      localStorage.removeItem('portfolio_user');
      const path = window.location.pathname;
      // Only redirect if not already on login/register pages (handle both /portfolio/login and /login)
      if (!path.includes('/login') && !path.includes('/register')) {
        // If we're in portfolio app, redirect to /portfolio/login, otherwise /login
        if (path.startsWith('/portfolio')) {
          window.location.href = '/portfolio/login';
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const response = await client.post('/api/portfolio/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (response.data.access_token) {
      localStorage.setItem('portfolio_token', response.data.access_token);
    }
    return response.data;
  },
  
  register: async (userData: { email: string; password: string; full_name?: string; invitation_token?: string }) => {
    const response = await client.post('/api/portfolio/auth/register', userData);
    return response.data;
  },
  
  getMe: async () => {
    const response = await client.get('/api/portfolio/auth/me');
    localStorage.setItem('portfolio_user', JSON.stringify(response.data));
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('portfolio_token');
    localStorage.removeItem('portfolio_user');
  },
};

// Portfolio API
export const portfolioAPI = {
  getPortfolios: async () => {
    const response = await client.get('/api/portfolio/portfolios');
    return response.data;
  },
  
  getPortfolio: async (id: number) => {
    const response = await client.get(`/api/portfolio/portfolios/${id}`);
    return response.data;
  },
  
  createPortfolio: async (data: any) => {
    const response = await client.post('/api/portfolio/portfolios', data);
    return response.data;
  },
  
  updatePortfolio: async (id: number, data: any) => {
    const response = await client.put(`/api/portfolio/portfolios/${id}`, data);
    return response.data;
  },
  
  deletePortfolio: async (id: number) => {
    const response = await client.delete(`/api/portfolio/portfolios/${id}`);
    return response.data;
  },
  
  getPerformanceStats: async () => {
    const response = await client.get('/api/portfolio/portfolios/performance/stats');
    return response.data;
  },
  
  getPortfolioPerformance: async (portfolioId: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await client.get(`/api/portfolio/portfolios/${portfolioId}/performance?${params}`);
    return response.data;
  },
  
  addPerformanceRecord: async (portfolioId: number, data: any) => {
    const response = await client.post(`/api/portfolio/portfolios/${portfolioId}/performance`, data);
    return response.data;
  },
};

// Investment Opportunities API
export const opportunityAPI = {
  getOpportunities: async (status?: string) => {
    const params = status ? `?status=${status}` : '';
    const response = await client.get(`/api/portfolio/opportunities${params}`);
    return response.data;
  },
  
  getOpportunity: async (id: number) => {
    const response = await client.get(`/api/portfolio/opportunities/${id}`);
    return response.data;
  },
  
  createOpportunity: async (data: any) => {
    const response = await client.post('/api/portfolio/opportunities', data);
    return response.data;
  },
  
  updateOpportunity: async (id: number, data: any) => {
    const response = await client.put(`/api/portfolio/opportunities/${id}`, data);
    return response.data;
  },
  
  deleteOpportunity: async (id: number) => {
    const response = await client.delete(`/api/portfolio/opportunities/${id}`);
    return response.data;
  },
  
  uploadDocument: async (opportunityId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await client.post(`/api/portfolio/opportunities/${opportunityId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  downloadDocument: (opportunityId: number, documentId: number) => {
    return `${API_BASE_URL}/api/portfolio/opportunities/${opportunityId}/documents/${documentId}/download`;
  },
  
  deleteDocument: async (opportunityId: number, documentId: number) => {
    const response = await client.delete(`/api/portfolio/opportunities/${opportunityId}/documents/${documentId}`);
    return response.data;
  },
};

// Subscription API
export const subscriptionAPI = {
  subscribe: async (opportunityId: number, data: any) => {
    const response = await client.post(`/api/portfolio/opportunities/${opportunityId}/subscribe`, data);
    return response.data;
  },
  
  getMySubscriptions: async () => {
    const response = await client.get('/api/portfolio/subscriptions');
    return response.data;
  },
  
  getAllSubscriptions: async (opportunityId?: number) => {
    const params = opportunityId ? `?opportunity_id=${opportunityId}` : '';
    const response = await client.get(`/api/portfolio/subscriptions/all${params}`);
    return response.data;
  },
  
  updateSubscription: async (subscriptionId: number, data: any) => {
    const response = await client.patch(`/api/portfolio/subscriptions/${subscriptionId}`, data);
    return response.data;
  },
  
  convertToInvestment: async (subscriptionId: number, data: any) => {
    const response = await client.post(`/api/portfolio/subscriptions/${subscriptionId}/convert-to-investment`, data);
    return response.data;
  },
};

// Invitation API (admin only)
export const invitationAPI = {
  createInvitation: async (email: string) => {
    const response = await client.post('/api/portfolio/invitations', { email });
    return response.data;
  },
  
  getInvitations: async () => {
    const response = await client.get('/api/portfolio/invitations');
    return response.data;
  },
};

// Investment API
export const investmentAPI = {
  getInvestments: async (portfolioId?: number, opportunityId?: number, status?: string) => {
    const params = new URLSearchParams();
    if (portfolioId) params.append('portfolio_id', portfolioId.toString());
    if (opportunityId) params.append('opportunity_id', opportunityId.toString());
    if (status) params.append('status', status);
    const response = await client.get(`/api/portfolio/investments?${params}`);
    return response.data;
  },
  
  getInvestment: async (id: number) => {
    const response = await client.get(`/api/portfolio/investments/${id}`);
    return response.data;
  },
  
  createInvestment: async (data: any) => {
    const response = await client.post('/api/portfolio/investments', data);
    return response.data;
  },
  
  updateInvestment: async (id: number, data: any) => {
    const response = await client.put(`/api/portfolio/investments/${id}`, data);
    return response.data;
  },
  
  deleteInvestment: async (id: number) => {
    const response = await client.delete(`/api/portfolio/investments/${id}`);
    return response.data;
  },
};
