import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Invest in real estate together, without the hassle or expense of managing property
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto italic">
              Alone we can do so little, together we can do so much.
            </p>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">— Helen Keller</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg text-center"
              >
                Contact us
              </Link>
              <Link
                to="/about"
                className="border-2 border-orange-500 text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-50 transition-all text-center"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Who we are ?</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h4 className="text-2xl font-semibold text-gray-900 mb-4">
                Shri Sai Ram Financials
              </h4>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Shri Sai Ram Financials was established to empower the community to be able to invest together 
                into opportunities such as Real Estate, Start-Ups, providing Asset Backed Loans, and such 
                instruments within Europe and outside as well.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                We scale-up by leveraging on the investments to be able to increase ROI, improve portfolio size 
                and de-risk. Investments are pooled to a group which would continue to take enough leverage 
                while managing the risk.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Investments are made with through analysis, review and agreements within the group who is 
                investing per asset.
              </p>
              <Link
                to="/about"
                className="inline-block mt-4 text-orange-600 hover:text-orange-700 font-semibold"
              >
                Learn More →
              </Link>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-2xl p-8 shadow-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">100%</div>
                  <div className="text-gray-600">Member Owned</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
                  <div className="text-gray-600">Access</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">Global</div>
                  <div className="text-gray-600">Reach</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">Ethical</div>
                  <div className="text-gray-600">Investments</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is a Cooperative Section */}
      <section id="cooperative" className="py-20 bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">What is a Cooperative?</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mb-6"></div>
          </div>
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              A cooperative company is formed by a group of individuals who come together to achieve 
              shared economic goals. Members pool their resources and invest collectively, allowing for 
              greater purchasing power and investment opportunities.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-orange-50 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Equal Say</h4>
                <p className="text-gray-600">
                  Each member has an equal say in decision-making, promoting democratic governance.
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Shared Benefits</h4>
                <p className="text-gray-600">
                  Profits are distributed among members based on their contributions, fostering a sense 
                  of community and mutual benefit.
                </p>
              </div>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              Investment Cooperative can be split per portfolio of assets, which would be used to invest 
              and restrict the risks.
            </p>
            <Link
              to="/about"
              className="inline-block mt-6 text-orange-600 hover:text-orange-700 font-semibold"
            >
              Learn More →
            </Link>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section id="vision-mission" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-2xl p-8 shadow-lg">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Vision</h3>
              <p className="text-xl text-gray-700 italic leading-relaxed">
                Building a network of investors to scale great heights.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-8 shadow-lg">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Mission</h3>
              <p className="text-xl text-gray-700 italic leading-relaxed">
                To pool, work and invest together in opportunities and take bigger steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Estate Investment Section */}
      <section id="opportunities" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Real Estate Investment</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mb-6"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Commercial',
                description: 'Provides a good regular return, and long term tenancies.',
                icon: '🏢',
              },
              {
                title: 'Residential',
                description: 'Provides good appreciations, with variable rental income.',
                icon: '🏠',
              },
              {
                title: 'Re-Formation',
                description: 'Construction of projects for investment purposes into the right properties.',
                icon: '🏗️',
              },
              {
                title: 'Global',
                description: 'Globally investing based on identifying the right opportunities.',
                icon: '🌍',
              },
            ].map((opportunity, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="text-4xl mb-4">{opportunity.icon}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {opportunity.title}
                </h4>
                <p className="text-gray-600">{opportunity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Let's work together on next project
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/opportunities"
              className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg text-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
