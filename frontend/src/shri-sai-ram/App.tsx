import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './components/LandingPage'
import AboutUs from './components/AboutUs'
import Opportunities from './components/Opportunities'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'

// Helper to get portfolio URL - in development, portfolio runs on backend (port 8000)
// In production, it's on the same domain
export const getPortfolioUrl = (path: string = '/login') => {
  const isDev = import.meta.env.DEV
  if (isDev) {
    // In development, portfolio app is served by backend on port 8000
    return `http://localhost:8000/portfolio${path}`
  }
  // In production, same domain
  return `/portfolio${path}`
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <LandingPage />
            </Layout>
          }
        />
        <Route
          path="/about"
          element={
            <Layout>
              <AboutUs />
            </Layout>
          }
        />
        <Route
          path="/opportunities"
          element={
            <Layout>
              <Opportunities />
            </Layout>
          }
        />
        <Route
          path="/testimonials"
          element={
            <Layout>
              <Testimonials />
            </Layout>
          }
        />
        <Route
          path="/contact"
          element={
            <Layout>
              <Contact />
            </Layout>
          }
        />
        {/* Don't catch portfolio routes - let backend handle them */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
