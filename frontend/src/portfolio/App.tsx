import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authAPI } from '../api/portfolioClient'
import Login from './components/Login'
import Register from './components/Register'
import PortfolioDashboard from './components/PortfolioDashboard'
import PortfolioManagement from './components/PortfolioManagement'
import InvestmentManagement from './components/InvestmentManagement'
import InvestmentOpportunities from './components/InvestmentOpportunities'
import OpportunityManagement from './components/OpportunityManagement'
import MySubscriptions from './components/MySubscriptions'
import SubscriptionManagement from './components/SubscriptionManagement'
import InvitationManagement from './components/InvitationManagement'
import Layout from './components/Layout'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('portfolio_token')
      if (token) {
        try {
          const userData = await authAPI.getMe()
          setUser(userData)
          setIsAuthenticated(true)
          setError(null)
        } catch (error: any) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('portfolio_token')
          localStorage.removeItem('portfolio_user')
          setIsAuthenticated(false)
          // Don't set error for auth failures - just show login page
          setError(null)
        }
      } else {
        setIsAuthenticated(false)
        setError(null)
      }
    } catch (error: any) {
      console.error('Error during auth check:', error)
      setIsAuthenticated(false)
      setError('Failed to check authentication. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData: any) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    authAPI.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  // Determine basename - check if we're being served from /portfolio route
  // Handle both /portfolio and /portfolio/ paths
  const getBasename = () => {
    const path = window.location.pathname
    // Check if path starts with /portfolio (portfolio app)
    if (path.startsWith('/portfolio')) {
      // If we're on /portfolio.html, the backend should redirect, but handle it here too
      if (path === '/portfolio.html') {
        // Backend should redirect, but if we're here, do client-side redirect
        setTimeout(() => {
          window.location.replace('/portfolio/')
        }, 0)
        return '/portfolio' // Return value during redirect
      }
      return '/portfolio'
    }
    return '/'
  }

  // Determine basename - must be done before Router
  const basename = getBasename()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-600 mb-2">Loading...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router basename={basename}>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Register onRegister={handleLogin} />
            )
          }
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<PortfolioDashboard />} />
                  <Route
                    path="portfolios/manage"
                    element={
                      user?.is_admin ? (
                        <PortfolioManagement />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />
                  <Route
                    path="investments/manage"
                    element={
                      user?.is_admin ? (
                        <InvestmentManagement />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />
                  <Route path="opportunities" element={<InvestmentOpportunities />} />
                  <Route
                    path="opportunities/manage"
                    element={
                      user?.is_admin ? (
                        <OpportunityManagement />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />
                  <Route path="subscriptions" element={<MySubscriptions />} />
                  <Route
                    path="subscriptions/manage"
                    element={
                      user?.is_admin ? (
                        <SubscriptionManagement />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />
                  <Route
                    path="invitations"
                    element={
                      user?.is_admin ? (
                        <InvitationManagement />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App
