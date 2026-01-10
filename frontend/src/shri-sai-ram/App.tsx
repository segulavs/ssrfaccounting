import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './components/LandingPage'
import AboutUs from './components/AboutUs'
import Opportunities from './components/Opportunities'
import Testimonials from './components/Testimonials'

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect /login to portfolio login */}
        <Route path="/login" element={<Navigate to="/portfolio/login" replace />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
