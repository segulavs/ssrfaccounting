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

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('portfolio_token')
    if (token) {
      try {
        const { authAPI } = await import('../api/portfolioClient')
        const userData = await authAPI.getMe()
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem('portfolio_token')
        localStorage.removeItem('portfolio_user')
        setIsAuthenticated(false)
      }
    }
    setLoading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  // Determine basename - check if we're being served from /portfolio route
  // This works whether accessed via /portfolio or /portfolio.html
  const getBasename = () => {
    const path = window.location.pathname
    // Check if path starts with /portfolio (portfolio app)
    if (path.startsWith('/portfolio')) {
      return '/portfolio'
    }
    return '/'
  }

  return (
    <Router basename={getBasename()}>
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
