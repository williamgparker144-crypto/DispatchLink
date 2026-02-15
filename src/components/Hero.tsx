import React from 'react';
import { Search, Shield, Users, Handshake, ChevronRight, Briefcase } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted, onLearnMore }) => {
  return (
    <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#1E3A5F] to-[#162d4a] overflow-hidden">
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `url('https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418456859_777c5f8f.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Animated dot grid pattern */}
      <div className="absolute inset-0 dot-grid-bg opacity-40" />

      {/* Animated route lines */}
      <div className="route-lines">
        <svg viewBox="0 0 1200 600" preserveAspectRatio="none">
          <path d="M0,300 Q200,100 400,250 T800,200 T1200,300" />
          <path d="M0,400 Q300,200 500,350 T900,280 T1200,400" />
          <path d="M0,200 Q150,350 350,180 T700,320 T1200,200" />
        </svg>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A5F]/95 to-[#1E3A5F]/75" />

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#3B82F6]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-[#3B82F6]/20 px-4 py-2 rounded-full mb-6 animate-fade-in-up">
              <Shield className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-sm font-medium text-[#3B82F6]">Free Professional Network</span>
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              The Trucking Industry's{' '}
              <span className="text-[#3B82F6]">Professional Network</span>
            </h1>

            <p className="text-lg lg:text-xl text-gray-300 mb-8 max-w-xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Connect with verified dispatchers, carriers, and brokers. Build your professional network,
              share opportunities, and grow your business — completely free.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={onGetStarted}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-[#3B82F6] text-white rounded-xl font-semibold text-lg hover:bg-[#2563EB] transition-all transform hover:scale-105 shadow-lg shadow-[#3B82F6]/30 animate-glow"
              >
                Join Free
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={onLearnMore}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm"
              >
                Browse Network
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
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
                  <p className="text-sm font-semibold text-white">Growing Network</p>
                  <p className="text-xs text-gray-400">Join our community</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-full flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">100% Free</p>
                  <p className="text-xs text-gray-400">No hidden fees</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Search Card */}
          <div className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <div className="backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl shadow-black/20 p-6 lg:p-8 border border-white/50">
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-6">Find Your Match</h2>

              <div className="space-y-4">
                {/* User Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="p-4 border-2 border-[#3B82F6] bg-[#3B82F6]/5 rounded-xl text-center hover:bg-[#3B82F6]/10 transition-colors">
                      <Users className="w-6 h-6 text-[#3B82F6] mx-auto mb-2" />
                      <span className="text-sm font-semibold text-[#1E3A5F]">Dispatcher</span>
                    </button>
                    <button className="p-4 border-2 border-gray-200 rounded-xl text-center hover:border-[#3B82F6] hover:bg-[#3B82F6]/5 transition-colors">
                      <svg className="w-6 h-6 text-gray-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-600">Carrier</span>
                    </button>
                    <button className="p-4 border-2 border-gray-200 rounded-xl text-center hover:border-[#3B82F6] hover:bg-[#3B82F6]/5 transition-colors">
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
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Operating Region:</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition-all bg-white">
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
                  className="w-full py-4 bg-[#1E3A5F] text-white rounded-xl font-semibold hover:bg-[#1E3A5F]/80 transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Search Network
                </button>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-[#1E3A5F]">Dispatchers</p>
                  <p className="text-xs text-gray-500">Growing Network</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[#1E3A5F]">Carriers</p>
                  <p className="text-xs text-gray-500">FMCSA Verified</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[#3B82F6]">Free</p>
                  <p className="text-xs text-gray-500">Always Free</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
