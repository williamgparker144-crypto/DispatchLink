import React from 'react';
import { Search, Shield, Users, Handshake, ChevronRight, Briefcase } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted, onLearnMore }) => {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f2027 0%, #1E3A5F 30%, #203a5c 50%, #2c5282 70%, #1E3A5F 100%)' }}>
      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)',
      }} />

      {/* Geometric mesh overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Animated dot grid pattern */}
      <div className="absolute inset-0 dot-grid-bg opacity-30" />

      {/* Animated route lines */}
      <div className="route-lines">
        <svg viewBox="0 0 1200 600" preserveAspectRatio="none">
          <path d="M0,300 Q200,100 400,250 T800,200 T1200,300" />
          <path d="M0,400 Q300,200 500,350 T900,280 T1200,400" />
          <path d="M0,200 Q150,350 350,180 T700,320 T1200,200" />
        </svg>
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-10 right-20 w-96 h-96 bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-20 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-[#3B82F6]/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3B82F6]/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in-up border border-white/10">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-300">CarrierScout Logistics</span>
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              The Trucking Industry's{' '}
              <span className="bg-gradient-to-r from-[#3B82F6] via-cyan-400 to-[#8B5CF6] bg-clip-text text-transparent">Professional Network</span>
            </h1>

            <p className="text-lg lg:text-xl text-gray-300/90 mb-8 max-w-xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Connect with verified dispatchers, carriers, and brokers. Build your professional network,
              share opportunities, and grow your business — completely free.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={onGetStarted}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-xl font-bold text-lg hover:from-[#2563EB] hover:to-[#1d4ed8] transition-all transform hover:scale-105 shadow-xl shadow-blue-500/30"
              >
                Join Free
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={onLearnMore}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm"
              >
                Browse Network
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-[#10B981]/30 to-emerald-500/20 rounded-xl flex items-center justify-center border border-[#10B981]/30">
                  <Shield className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">DOT Verified</p>
                  <p className="text-xs text-gray-400">All carriers checked</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-[#3B82F6]/30 to-cyan-500/20 rounded-xl flex items-center justify-center border border-[#3B82F6]/30">
                  <Users className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Growing Network</p>
                  <p className="text-xs text-gray-400">Join our community</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-[#F59E0B]/30 to-amber-500/20 rounded-xl flex items-center justify-center border border-[#F59E0B]/30">
                  <Handshake className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">100% Free</p>
                  <p className="text-xs text-gray-400">No hidden fees</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Search Card */}
          <div className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <div className="backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl shadow-black/30 p-6 lg:p-8 border border-white/60">
              <h2 className="text-2xl font-extrabold text-[#1E3A5F] mb-6">Find Your Match</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">I am a:</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="p-4 border-2 border-[#3B82F6] bg-gradient-to-b from-[#3B82F6]/5 to-[#3B82F6]/10 rounded-xl text-center hover:from-[#3B82F6]/10 hover:to-[#3B82F6]/20 transition-all">
                      <Users className="w-6 h-6 text-[#3B82F6] mx-auto mb-2" />
                      <span className="text-sm font-bold text-[#1E3A5F]">Dispatcher</span>
                    </button>
                    <button className="p-4 border-2 border-gray-200 rounded-xl text-center hover:border-[#3B82F6] hover:bg-[#3B82F6]/5 transition-all">
                      <svg className="w-6 h-6 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span className="text-sm font-bold text-gray-500">Carrier</span>
                    </button>
                    <button className="p-4 border-2 border-gray-200 rounded-xl text-center hover:border-[#3B82F6] hover:bg-[#3B82F6]/5 transition-all">
                      <Briefcase className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm font-bold text-gray-500">Broker</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Search by:</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="MC#, DOT#, Company name, or specialty..."
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Operating Region:</label>
                  <select className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none transition-all bg-white text-sm">
                    <option value="">All Regions</option>
                    <option value="nationwide">Nationwide</option>
                    <option value="northeast">Northeast</option>
                    <option value="southeast">Southeast</option>
                    <option value="midwest">Midwest</option>
                    <option value="southwest">Southwest</option>
                    <option value="west">West Coast</option>
                  </select>
                </div>

                <button
                  onClick={onGetStarted}
                  className="w-full py-4 bg-gradient-to-r from-[#1E3A5F] to-[#3B82F6] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-base"
                >
                  <Search className="w-5 h-5" />
                  Search Network
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-extrabold text-[#3B82F6]">Dispatchers</p>
                  <p className="text-xs text-gray-400 font-medium">Growing Network</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-[#10B981]">Carriers</p>
                  <p className="text-xs text-gray-400 font-medium">FMCSA Verified</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-[#F59E0B]">Brokers</p>
                  <p className="text-xs text-gray-400 font-medium">Always Free</p>
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
