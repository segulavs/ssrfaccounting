export default function AboutUs() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Shri Sai Ram Financials</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Empowering everyone to invest in opportunities that were once out of reach
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-16">
        {/* Our Story */}
        <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
            <p>
              Shri Sai Ram Financials was founded with a vision to democratize investment opportunities 
              for individuals across all economic backgrounds. We recognized that many promising investment 
              opportunities in emerging markets and far-off destinations were accessible only to wealthy 
              investors or large institutions.
            </p>
            <p>
              As a co-operative company, we pool resources from our members to access these opportunities, 
              making it possible for everyone to participate in investments that would otherwise be out of 
              reach. Our cooperative model ensures that all members share in both the risks and rewards, 
              fostering a sense of community and collective growth.
            </p>
            <p>
              Since our inception, we have helped hundreds of members diversify their portfolios and 
              achieve their financial goals through strategic investments in emerging markets, real estate, 
              technology startups, and infrastructure projects around the globe.
            </p>
          </div>
        </section>

        {/* Our Values */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Accessibility',
                description: 'We believe everyone deserves access to quality investment opportunities, regardless of their financial status or location.',
                icon: '🌍',
              },
              {
                title: 'Transparency',
                description: 'We maintain complete transparency in all our operations, investments, and decision-making processes.',
                icon: '🔍',
              },
              {
                title: 'Cooperation',
                description: 'As a co-operative, we work together for mutual benefit, ensuring all members have a voice and share in success.',
                icon: '🤝',
              },
              {
                title: 'Innovation',
                description: 'We leverage technology and innovative approaches to identify and access unique investment opportunities.',
                icon: '💡',
              },
              {
                title: 'Ethics',
                description: 'We conduct all business with the highest ethical standards, ensuring sustainable and responsible investments.',
                icon: '⚖️',
              },
              {
                title: 'Growth',
                description: 'We are committed to the long-term growth and prosperity of our members and the communities we invest in.',
                icon: '📈',
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How We Work */}
        <section className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How We Work</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-orange-600">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Join as a Member</h3>
                  <p className="text-gray-600">
                    Become a member of our co-operative by contributing to our investment pool. 
                    Membership is open to all, with no minimum investment requirements.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-orange-600">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Explore Opportunities</h3>
                  <p className="text-gray-600">
                    Browse our curated selection of investment opportunities from around the world, 
                    each thoroughly vetted by our expert team.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-orange-600">3</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Invest Together</h3>
                  <p className="text-gray-600">
                    Pool your resources with other members to invest in opportunities that would 
                    be impossible to access individually.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-orange-600">4</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Grow Together</h3>
                  <p className="text-gray-600">
                    Share in the returns and watch your investments grow while supporting 
                    development in emerging markets and communities worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Leadership</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Rajesh Kumar',
                role: 'Chief Executive Officer',
                description: 'With over 20 years of experience in finance and investments, Rajesh leads our strategic vision.',
                image: '👨‍💼',
              },
              {
                name: 'Priya Sharma',
                role: 'Chief Investment Officer',
                description: 'Priya brings expertise in global markets and emerging economies, identifying the best opportunities.',
                image: '👩‍💼',
              },
              {
                name: 'Amit Patel',
                role: 'Head of Operations',
                description: 'Amit ensures smooth operations and maintains the highest standards of transparency and governance.',
                image: '👨‍🔧',
              },
            ].map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md text-center hover:shadow-xl transition-all"
              >
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-orange-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-white">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Impact</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-orange-100">Active Members</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">₹50Cr+</div>
              <div className="text-orange-100">Assets Under Management</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">25+</div>
              <div className="text-orange-100">Countries</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100+</div>
              <div className="text-orange-100">Investment Projects</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
