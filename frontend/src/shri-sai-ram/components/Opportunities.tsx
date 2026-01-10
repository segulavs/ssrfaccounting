import { useState } from 'react'

interface Opportunity {
  id: number
  title: string
  category: string
  location: string
  description: string
  minInvestment: string
  expectedReturn: string
  duration: string
  riskLevel: 'Low' | 'Medium' | 'High'
  status: 'Open' | 'Filling' | 'Closed'
  image: string
}

export default function Opportunities() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedRisk, setSelectedRisk] = useState<string>('All')

  const categories = ['All', 'Real Estate', 'Technology', 'Infrastructure', 'Commodities', 'Renewable Energy', 'Emerging Markets']
  const riskLevels = ['All', 'Low', 'Medium', 'High']

  const opportunities: Opportunity[] = [
    {
      id: 1,
      title: 'Bengaluru Tech Park Development',
      category: 'Real Estate',
      location: 'Bangalore, India',
      description: 'Premium commercial real estate development in the heart of India\'s tech capital, targeting IT companies and startups.',
      minInvestment: '₹50,000',
      expectedReturn: '12-15%',
      duration: '5-7 years',
      riskLevel: 'Medium',
      status: 'Open',
      image: '🏢',
    },
    {
      id: 2,
      title: 'Southeast Asia FinTech Startup Fund',
      category: 'Technology',
      location: 'Singapore, Vietnam, Indonesia',
      description: 'Investment in a diversified portfolio of early-stage fintech startups across Southeast Asia\'s rapidly growing markets.',
      minInvestment: '₹25,000',
      expectedReturn: '20-30%',
      duration: '3-5 years',
      riskLevel: 'High',
      status: 'Filling',
      image: '💻',
    },
    {
      id: 3,
      title: 'African Infrastructure Bonds',
      category: 'Infrastructure',
      location: 'Kenya, Ghana, Nigeria',
      description: 'Government-backed infrastructure bonds for renewable energy and transportation projects in rapidly developing African economies.',
      minInvestment: '₹1,00,000',
      expectedReturn: '8-10%',
      duration: '10 years',
      riskLevel: 'Low',
      status: 'Open',
      image: '🏗️',
    },
    {
      id: 4,
      title: 'Solar Power Plant - Rajasthan',
      category: 'Renewable Energy',
      location: 'Rajasthan, India',
      description: 'Large-scale solar power generation facility leveraging India\'s excellent solar resources and government incentives.',
      minInvestment: '₹75,000',
      expectedReturn: '10-12%',
      duration: '15-20 years',
      riskLevel: 'Low',
      status: 'Open',
      image: '⚡',
    },
    {
      id: 5,
      title: 'Brazilian Agricultural Commodities',
      category: 'Commodities',
      location: 'Brazil',
      description: 'Investment in Brazilian soybean and coffee production, benefiting from strong global demand and favorable climate conditions.',
      minInvestment: '₹60,000',
      expectedReturn: '9-11%',
      duration: '3-5 years',
      riskLevel: 'Medium',
      status: 'Open',
      image: '🌾',
    },
    {
      id: 6,
      title: 'Vietnam Manufacturing Hub',
      category: 'Emerging Markets',
      location: 'Ho Chi Minh City, Vietnam',
      description: 'Investment in manufacturing facilities catering to the growing electronics and textiles industries in Vietnam.',
      minInvestment: '₹1,50,000',
      expectedReturn: '15-18%',
      duration: '5-8 years',
      riskLevel: 'Medium',
      status: 'Filling',
      image: '🏭',
    },
    {
      id: 7,
      title: 'Eastern European Real Estate',
      category: 'Real Estate',
      location: 'Poland, Czech Republic',
      description: 'Residential and commercial real estate in growing Eastern European cities with EU membership benefits.',
      minInvestment: '₹2,00,000',
      expectedReturn: '10-13%',
      duration: '7-10 years',
      riskLevel: 'Medium',
      status: 'Open',
      image: '🏠',
    },
    {
      id: 8,
      title: 'Green Hydrogen Production',
      category: 'Renewable Energy',
      location: 'Australia, Chile',
      description: 'Next-generation green hydrogen production facilities using renewable energy, targeting the future energy transition.',
      minInvestment: '₹1,00,000',
      expectedReturn: '18-25%',
      duration: '5-7 years',
      riskLevel: 'High',
      status: 'Open',
      image: '🔋',
    },
  ]

  const filteredOpportunities = opportunities.filter(opp => {
    const categoryMatch = selectedCategory === 'All' || opp.category === selectedCategory
    const riskMatch = selectedRisk === 'All' || opp.riskLevel === selectedRisk
    return categoryMatch && riskMatch
  })

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'High':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800'
      case 'Filling':
        return 'bg-orange-100 text-orange-800'
      case 'Closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Investment <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Opportunities</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore diverse investment opportunities from emerging markets and far-off destinations
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
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
              Risk Level
            </label>
            <div className="flex flex-wrap gap-2">
              {riskLevels.map(risk => (
                <button
                  key={risk}
                  onClick={() => setSelectedRisk(risk)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedRisk === risk
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {risk}
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
              <p className="text-sm text-gray-600 mb-4">{opportunity.location}</p>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">{opportunity.description}</p>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Minimum Investment:</span>
                  <span className="text-sm font-semibold text-gray-900">{opportunity.minInvestment}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Expected Return:</span>
                  <span className="text-sm font-semibold text-green-600">{opportunity.expectedReturn} p.a.</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="text-sm font-semibold text-gray-900">{opportunity.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Risk Level:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(opportunity.riskLevel)}`}>
                    {opportunity.riskLevel}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No opportunities match your selected filters.</p>
          <button
            onClick={() => {
              setSelectedCategory('All')
              setSelectedRisk('All')
            }}
            className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
          >
            Clear filters
          </button>
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
          <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all">
            Become a Member
          </button>
          <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-all">
            Contact Our Team
          </button>
        </div>
      </div>
    </div>
  )
}
