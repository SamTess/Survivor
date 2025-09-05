export default async function AboutPage() {
  return (
    <div className="h-screen bg-white overflow-y-auto snap-y snap-mandatory">
      {/* Hero Section */}
      <section className="min-h-[20vh] flex items-center justify-center snap-start mt-30">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-light text-black mb-6">About JEB Platform</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connecting innovation with opportunity through our startup incubator showcase platform
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="min-h-[40vh] flex items-center justify-center snap-center">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-light text-black mb-8 text-center">Our Mission</h2>
          <div className="bg-gray-50 rounded-2xl p-8">
            <p className="text-lg text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
              We bridge the gap between innovative startups and the resources they need to thrive.
              Our platform provides visibility for emerging projects, facilitates meaningful connections
              with investors and partners, and promotes a culture of innovation and collaboration.
            </p>
          </div>
        </div>
      </section>

      {/* Key Objectives Section */}
      <section className="min-h-[40vh] flex items-center justify-center snap-center py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-light text-black mb-8 text-center">What We Do</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Visibility</h3>
              <p className="text-gray-600 text-sm">Showcase startups and project leaders to a wider audience</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Connections</h3>
              <p className="text-gray-600 text-sm">Facilitate networking with investors, partners, and clients</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Innovation</h3>
              <p className="text-gray-600 text-sm">Promote cutting-edge ideas and collaborative solutions</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Progress</h3>
              <p className="text-gray-600 text-sm">Track and showcase dynamic project updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="min-h-[40vh] flex items-center justify-center snap-center py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-light text-black mb-8 text-center">Who We Serve</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Startups & Alumni</h3>
              <p className="text-gray-600 text-sm">Current incubated projects and successful graduates</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Investors & Funders</h3>
              <p className="text-gray-600 text-sm">Angel investors, VCs, and funding organizations</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Partners & Institutions</h3>
              <p className="text-gray-600 text-sm">Strategic partners, local authorities, and media</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="min-h-[40vh] flex items-center justify-center snap-center py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-light text-black mb-8 text-center">Platform Features</h2>
          <div className="space-y-8">
            {/* Public Features */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <h3 className="text-xl font-medium text-black mb-4">For Everyone</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Project Showcase</h4>
                    <p className="text-gray-600 text-sm">Comprehensive startup profiles and project catalog</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">News & Updates</h4>
                    <p className="text-gray-600 text-sm">Latest fundraising rounds, events, and announcements</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Smart Search</h4>
                    <p className="text-gray-600 text-sm">Advanced filters by sector, maturity, and location</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Events Calendar</h4>
                    <p className="text-gray-600 text-sm">Pitch sessions, conferences, and workshops</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Startup Features */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
              <h3 className="text-xl font-medium text-black mb-4">For Startups</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Profile Management</h4>
                    <p className="text-gray-600 text-sm">Create and update detailed project profiles</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Direct Messaging</h4>
                    <p className="text-gray-600 text-sm">Connect with investors and partners</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Opportunity Tracking</h4>
                    <p className="text-gray-600 text-sm">Access funding calls and partnership opportunities</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Features */}
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-8">
              <h3 className="text-xl font-medium text-black mb-4">Admin Dashboard</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Content Management</h4>
                    <p className="text-gray-600 text-sm">Manage projects, startups, and user accounts</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Analytics Dashboard</h4>
                    <p className="text-gray-600 text-sm">Track engagement and platform statistics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="min-h-[40vh] flex items-center justify-center snap-center py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center bg-gray-900 rounded-2xl p-12">
            <h2 className="text-3xl font-light text-white mb-4">Ready to Get Started?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Whether you&apos;re a startup looking for visibility, an investor seeking opportunities,
              or a partner wanting to collaborate, our platform connects you with the right people.
            </p>
            <div className="space-x-4">
              <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Explore Projects
              </button>
              <button className="border border-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                Join the Community
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
