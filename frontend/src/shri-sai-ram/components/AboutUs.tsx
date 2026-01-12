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
        {/* Who we are */}
        <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Who we are ?</h2>
          <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
            <p>
              Shri Sai Ram Financials was established to empower the community to be able to invest together 
              into opportunities such as Real Estate, Start-Ups, providing Asset Backed Loans, and such 
              instruments within Europe and outside as well.
            </p>
            <p>
              We scale-up by leveraging on the investments to be able to increase ROI, improve portfolio size 
              and de-risk. Investments are pooled to a group which would continue to take enough leverage 
              while managing the risk.
            </p>
            <p>
              Investments are made with through analysis, review and agreements within the group who is 
              investing per asset.
            </p>
          </div>
        </section>

        {/* What is a Cooperative */}
        <section className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Cooperative?</h2>
          <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
            <p>
              A cooperative company is formed by a group of individuals who come together to achieve 
              shared economic goals. Members pool their resources and invest collectively, allowing for 
              greater purchasing power and investment opportunities.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Each member</h3>
                <p>
                  has an equal say in decision-making, promoting democratic governance. Profits are 
                  distributed among members based on their contributions, fostering a sense of community 
                  and mutual benefit.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Investment Cooperative</h3>
                <p>
                  can be split per portfolio of assets, which would be used to invest and restrict the risks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Vision</h2>
              <p className="text-xl text-gray-700 italic leading-relaxed">
                Building a network of investors to scale great heights.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Mission</h2>
              <p className="text-xl text-gray-700 italic leading-relaxed">
                To pool, work and invest together in opportunities and take bigger steps.
              </p>
            </div>
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

        {/* Our Team */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Dilip Kumar',
                role: 'Chief Executive Officer',
                description: 'With over 20 years of experience in finance and investments, Dilip leads our strategic vision.',
                image: '👨‍💼',
              },
              {
                name: 'Lakshmi Segu',
                role: 'Chief Investment Officer',
                description: 'Lakshmi brings expertise in global markets and emerging economies, identifying the best opportunities.',
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
              <div className="text-5xl font-bold mb-2">€50M+</div>
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
