import { useState } from 'react'

interface Testimonial {
  id: number
  name: string
  location: string
  role: string
  image: string
  rating: number
  content: string
  investmentType: string
  memberSince: string
}

export default function Testimonials() {
  const [selectedFilter, setSelectedFilter] = useState<string>('All')

  const filters = ['All', 'Real Estate', 'Technology', 'Emerging Markets', 'Renewable Energy']

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Anita Desai',
      location: 'Mumbai, India',
      role: 'Small Business Owner',
      image: '👩‍💼',
      rating: 5,
      investmentType: 'Real Estate',
      memberSince: '2020',
      content: 'Joining Shri Sai Ram Financials has been one of the best decisions I\'ve made. As a small business owner, I never thought I could invest in premium real estate projects. Through the co-operative, I\'ve been able to invest in three different properties, and the returns have been exceptional. The transparency and support from the team are outstanding.',
    },
    {
      id: 2,
      name: 'Ravi Kumar',
      location: 'Delhi, India',
      role: 'Software Engineer',
      image: '👨‍💻',
      rating: 5,
      investmentType: 'Technology',
      memberSince: '2021',
      content: 'The technology startup fund opportunity exceeded my expectations. I invested in the Southeast Asia FinTech fund and have already seen promising returns. What I love most is how the co-operative makes high-growth tech investments accessible to people like me who don\'t have large capital.',
    },
    {
      id: 3,
      name: 'Sunita Patel',
      location: 'Ahmedabad, India',
      role: 'Teacher',
      image: '👩‍🏫',
      rating: 5,
      investmentType: 'Renewable Energy',
      memberSince: '2019',
      content: 'I\'m passionate about sustainable investments, and the solar power plant opportunity in Rajasthan was perfect for me. Not only am I seeing good returns, but I also know my investment is contributing to clean energy. The long-term nature of this investment aligns perfectly with my retirement planning.',
    },
    {
      id: 4,
      name: 'Vikram Singh',
      location: 'Pune, India',
      role: 'Retired Bank Manager',
      image: '👨‍💼',
      rating: 5,
      investmentType: 'Infrastructure',
      memberSince: '2018',
      content: 'After retiring, I was looking for stable, long-term investments. The African infrastructure bonds have provided exactly that - steady returns with government backing. The co-operative model means I can participate in international projects that would have been impossible to access individually.',
    },
    {
      id: 5,
      name: 'Meera Reddy',
      location: 'Hyderabad, India',
      role: 'Doctor',
      image: '👩‍⚕️',
      rating: 5,
      investmentType: 'Emerging Markets',
      memberSince: '2022',
      content: 'As a doctor with limited time for investment research, I appreciate how Shri Sai Ram Financials handles all the due diligence. The Vietnam manufacturing hub investment has been performing well, and I\'m excited about the potential returns. The team\'s expertise in emerging markets is evident.',
    },
    {
      id: 6,
      name: 'Ajay Sharma',
      location: 'Kolkata, India',
      role: 'Entrepreneur',
      image: '👨‍💼',
      rating: 5,
      investmentType: 'Commodities',
      memberSince: '2021',
      content: 'The Brazilian agricultural commodities investment has been a great diversification for my portfolio. The returns have been consistent, and I appreciate the regular updates from the team. Being part of a co-operative means I\'m investing alongside like-minded people, which adds an extra layer of confidence.',
    },
    {
      id: 7,
      name: 'Kavita Nair',
      location: 'Chennai, India',
      role: 'Marketing Professional',
      image: '👩‍💼',
      rating: 5,
      investmentType: 'Real Estate',
      memberSince: '2020',
      content: 'The Bengaluru Tech Park investment was my first with Shri Sai Ram Financials, and it\'s been fantastic. The location is prime, and with Bangalore\'s growing tech industry, I\'m confident about long-term appreciation. The minimum investment amount was perfect for someone starting their investment journey.',
    },
    {
      id: 8,
      name: 'Rajesh Iyer',
      location: 'Bangalore, India',
      role: 'IT Professional',
      image: '👨‍💻',
      rating: 5,
      investmentType: 'Technology',
      memberSince: '2023',
      content: 'I\'ve always wanted to invest in the green energy transition, and the green hydrogen opportunity was exactly what I was looking for. While it\'s a higher risk investment, the potential returns are significant. The team explained all the risks clearly, which helped me make an informed decision.',
    },
    {
      id: 9,
      name: 'Priya Menon',
      location: 'Kochi, India',
      role: 'Architect',
      image: '👩‍🎨',
      rating: 5,
      investmentType: 'Real Estate',
      memberSince: '2021',
      content: 'The Eastern European real estate investment has been a great addition to my portfolio. As an architect, I understand real estate value, and these properties are in excellent locations. The returns have been steady, and I appreciate being part of a co-operative that makes international real estate accessible.',
    },
  ]

  const filteredTestimonials = selectedFilter === 'All'
    ? testimonials
    : testimonials.filter(t => t.investmentType === selectedFilter)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Members</span> Say
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Read real stories from our members about their investment journey with Shri Sai Ram Financials
        </p>
      </div>

      {/* Filter */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredTestimonials.map(testimonial => (
          <div
            key={testimonial.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start space-x-4 mb-4">
              <div className="text-5xl flex-shrink-0">{testimonial.image}</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
                <p className="text-xs text-gray-500">{testimonial.location}</p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-3">
              {[...Array(testimonial.rating)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Investment Type Badge */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold mr-2">
                {testimonial.investmentType}
              </span>
              <span className="text-xs text-gray-500">Member since {testimonial.memberSince}</span>
            </div>

            {/* Content */}
            <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4 italic">
              "{testimonial.content}"
            </p>
          </div>
        ))}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No testimonials match your selected filter.</p>
          <button
            onClick={() => setSelectedFilter('All')}
            className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
          >
            Show all testimonials
          </button>
        </div>
      )}

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-8 md:p-12 text-white text-center mt-12">
        <h2 className="text-3xl font-bold mb-8">Join Our Growing Community</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-5xl font-bold mb-2">500+</div>
            <div className="text-orange-100">Happy Members</div>
          </div>
          <div>
            <div className="text-5xl font-bold mb-2">4.9/5</div>
            <div className="text-orange-100">Average Rating</div>
          </div>
          <div>
            <div className="text-5xl font-bold mb-2">98%</div>
            <div className="text-orange-100">Satisfaction Rate</div>
          </div>
        </div>
        <div className="mt-8">
          <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg">
            Become a Member Today
          </button>
        </div>
      </div>
    </div>
  )
}
