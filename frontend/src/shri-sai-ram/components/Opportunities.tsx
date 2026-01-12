import { useState, useEffect } from 'react'
import { opportunityAPI } from '../../api/portfolioClient'
import { getPortfolioUrl } from '../App'

interface Opportunity {
  id: number
  title: string
  category: string
  location?: string
  description: string
  minInvestment: string
  expectedReturn?: string
  duration?: string
  riskLevel?: 'Low' | 'Medium' | 'High'
  status: 'Open' | 'Filling' | 'Closed'
  image: string
  currency: string
  investment_amount?: number
}

// Map API type to display category
const typeToCategory: Record<string, string> = {
  'real_estate': 'Real Estate',
  'commercial': 'Commercial',
  'residential': 'Residential',
  're_formation': 'Re-Formation',
  'global': 'Global',
  'private_equity': 'Private Equity',
  'building_loan': 'Building Loan',
  'technology': 'Technology',
  'infrastructure': 'Infrastructure',
  'renewable_energy': 'Renewable Energy',
}

// Get icon based on category/type
const getCategoryIcon = (category: string): string => {
  const categoryLower = category.toLowerCase()
  if (categoryLower.includes('commercial')) return '🏢'
  if (categoryLower.includes('residential')) return '🏠'
  if (categoryLower.includes('re-formation') || categoryLower.includes('formation')) return '🏗️'
  if (categoryLower.includes('global')) return '🌍'
  if (categoryLower.includes('technology') || categoryLower.includes('tech')) return '💻'
  if (categoryLower.includes('infrastructure')) return '🏗️'
  if (categoryLower.includes('renewable') || categoryLower.includes('energy')) return '⚡'
  if (categoryLower.includes('real estate')) return '🏘️'
  return '📊'
}

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  
  useEffect(() => {
    loadOpportunities()
  }, [])

  const loadOpportunities = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await opportunityAPI.getOpportunities()
      
      // Map API data to component interface
      const mappedOpportunities: Opportunity[] = data.map((opp: any) => {
        const category = typeToCategory[opp.type] || opp.type || 'Other'
        return {
          id: opp.id,
          title: opp.title,
          category: category,
          description: opp.description || '',
          minInvestment: opp.investment_amount 
            ? `${opp.currency || 'EUR'} ${opp.investment_amount.toLocaleString()}`
            : 'Contact for details',
          status: opp.status === 'open' ? 'Open' : opp.status === 'closed' ? 'Closed' : 'Filling',
          image: getCategoryIcon(category),
          currency: opp.currency || 'EUR',
          investment_amount: opp.investment_amount,
        }
      })
      
      setOpportunities(mappedOpportunities)
    } catch (err: any) {
      console.error('Failed to load opportunities:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to load opportunities')
    } finally {
      setLoading(false)
    }
  }

  const filteredOpportunities = opportunities.filter(opp => {
    const categoryMatch = selectedCategory === 'All' || opp.category === selectedCategory
    const statusMatch = selectedStatus === 'All' || opp.status.toLowerCase() === selectedStatus.toLowerCase()
    return categoryMatch && statusMatch
  })
  
  // Get unique categories from loaded opportunities
  const availableCategories = ['All', ...Array.from(new Set(opportunities.map(opp => opp.category))).sort()]

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'open') return 'bg-blue-100 text-blue-800'
    if (statusLower === 'filling') return 'bg-orange-100 text-orange-800'
    if (statusLower === 'closed') return 'bg-gray-100 text-gray-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Real Estate <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Investment</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore diverse real estate investment opportunities from commercial properties to global markets
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600">Loading opportunities...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadOpportunities}
            className="mt-4 text-red-600 hover:text-red-700 font-medium underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Content (only show if not loading) */}
      {!loading && !error && (
        <>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {['All', 'Open', 'Filling', 'Closed'].map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === status
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredOpportunities.map(opportunity => (
          <div
            key={opportunity.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-orange-50 to-blue-50 p-6 text-center">
              <div className="text-6xl mb-4">{opportunity.image}</div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(opportunity.status)} mb-2`}>
                {opportunity.status}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{opportunity.title}</h3>
              {opportunity.location && (
                <p className="text-sm text-gray-600 mb-4">{opportunity.location}</p>
              )}
              {opportunity.category && (
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                  {opportunity.category}
                </span>
              )}
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">{opportunity.description || 'No description available.'}</p>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Minimum Investment:</span>
                  <span className="text-sm font-semibold text-gray-900">{opportunity.minInvestment}</span>
                </div>
                {opportunity.expectedReturn && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expected Return:</span>
                    <span className="text-sm font-semibold text-green-600">{opportunity.expectedReturn} p.a.</span>
                  </div>
                )}
                {opportunity.duration && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="text-sm font-semibold text-gray-900">{opportunity.duration}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <a
                  href={getPortfolioUrl('/login')}
                  className="block w-full text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOpportunities.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            {opportunities.length === 0 
              ? 'No investment opportunities available at the moment. Please check back later.'
              : 'No opportunities match your selected filters.'}
          </p>
          {opportunities.length > 0 && (
            <button
              onClick={() => {
                setSelectedCategory('All')
                setSelectedStatus('All')
              }}
              className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-8 text-white mt-12">
        <h2 className="text-2xl font-bold mb-4">Ready to Invest?</h2>
        <p className="mb-6 text-orange-50">
          Join Shri Sai Ram Financials today and start exploring these exciting investment opportunities. 
          Our expert team is here to guide you through the process.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={getPortfolioUrl('/login')}
            className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all text-center"
          >
            Become a Member
          </a>
          <button
            onClick={() => {
              window.location.href = '/contact';
            }}
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-all"
          >
            Contact Our Team
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
