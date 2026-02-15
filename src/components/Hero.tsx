import React from 'react';
import { Search, Shield, Users, Handshake, ChevronRight, Briefcase } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted, onLearnMore }) => {
  return (
    <section className="relative bg-gradient-to-br from-[#1a365d] via-[#2d4a6f] to-[#1a365d] overflow-hidden">
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418456859_777c5f8f.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a365d]/90 to-[#1a365d]/70" />

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#ff6b35]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#ff6b35]/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-[#ff6b35]/20 px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4 text-[#ff6b35]" />
              <span className="text-sm font-medium text-[#ff6b35]">Free Professional Network</span>
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
              The Trucking Industry's{' '}
              <span className="text-[#ff6b35]">Professional Network</span>
            </h1>

            <p className="text-lg lg:text-xl text-gray-300 mb-8 max-w-xl">
              Connect with verified dispatchers, carriers, and brokers. Build your professional network,
              share opportunities, and grow your business — completely free.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={onGetStarted}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-[#ff6b35] text-white rounded-xl font-semibold text-lg hover:bg-[#e55a2b] transition-all transform hover:scale-105 shadow-lg shadow-[#ff6b35]/30"
              >
                Join Free
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={onLearnMore}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
              >
                Browse Network
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">DOT Verified</p>
                  <p className="text-xs text-gray-400">All carriers checked</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">5,000+</p>
                  <p className="text-xs text-gray-400">Active members</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#ff6b35]/20 rounded-full flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-[#ff6b35]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">100% Free</p>
                  <p className="text-xs text-gray-400">No hidden fees</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Search Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-[#1a365d] mb-6">Find Your Match</h2>

            <div className="space-y-4">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
                <div className="grid grid-cols-3 gap-3">
                  <button className="p-4 border-2 border-[#ff6b35] bg-[#ff6b35]/5 rounded-xl text-center hover:bg-[#ff6b35]/10 transition-colors">
                    <Users className="w-6 h-6 text-[#ff6b35] mx-auto mb-2" />
                    <span className="text-sm font-semibold text-[#1a365d]">Dispatcher</span>
                  </button>
                  <button className="p-4 border-2 border-gray-200 rounded-xl text-center hover:border-[#ff6b35] hover:bg-[#ff6b35]/5 transition-colors">
                    <svg className="w-6 h-6 text-gray-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-600">Carrier</span>
                  </button>
                  <button className="p-4 border-2 border-gray-200 rounded-xl text-center hover:border-[#ff6b35] hover:bg-[#ff6b35]/5 transition-colors">
                    <Briefcase className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                    <span className="text-sm font-semibold text-gray-600">Broker</span>
                  </button>
                </div>
              </div>

              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search by:</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="MC#, DOT#, Company name, or specialty..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operating Region:</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none transition-all bg-white">
                  <option value="">All Regions</option>
                  <option value="nationwide">Nationwide</option>
                  <option value="northeast">Northeast</option>
                  <option value="southeast">Southeast</option>
                  <option value="midwest">Midwest</option>
                  <option value="southwest">Southwest</option>
                  <option value="west">West Coast</option>
                </select>
              </div>

              {/* Search Button */}
              <button
                onClick={onGetStarted}
                className="w-full py-4 bg-[#1a365d] text-white rounded-xl font-semibold hover:bg-[#2d4a6f] transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search Network
              </button>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#1a365d]">2,500+</p>
                <p className="text-xs text-gray-500">Dispatchers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a365d]">8,000+</p>
                <p className="text-xs text-gray-500">Carriers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#ff6b35]">100%</p>
                <p className="text-xs text-gray-500">Free to Join</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
