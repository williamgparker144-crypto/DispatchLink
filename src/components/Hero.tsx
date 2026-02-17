import React, { useState, useMemo, useEffect } from 'react';
import { Search, Shield, Users, Handshake, ChevronRight, Briefcase, MapPin, CheckCircle, User } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import type { CurrentUser } from '@/contexts/AppContext';
import { getPlatformUserCounts } from '@/lib/api';

interface HeroProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
  onSearch?: (query: string, role: string, region: string) => void;
  onViewProfile?: (userId: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted, onLearnMore, onSearch, onViewProfile }) => {
  const { registeredUsers } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'dispatcher' | 'carrier' | 'broker'>('dispatcher');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Live search across registered users
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();

    return registeredUsers
      .filter((u: CurrentUser) => {
        // Filter by selected role
        if (u.userType !== selectedRole) return false;

        // Search by name, company
        if (u.name.toLowerCase().includes(q)) return true;
        if (u.company.toLowerCase().includes(q)) return true;

        // For carriers/brokers: also match MC# and DOT#
        if (u.userType === 'carrier' || u.userType === 'broker') {
          if (u.mcNumber && u.mcNumber.toLowerCase().includes(q)) return true;
          if (u.dotNumber && u.dotNumber.toLowerCase().includes(q)) return true;
        }

        // For dispatchers: match specialties
        if (u.userType === 'dispatcher') {
          if (u.specialties?.some(s => s.toLowerCase().includes(q))) return true;
          // Match carriers worked with
          if (u.carriersWorkedWith?.some(c =>
            c.carrierName.toLowerCase().includes(q) ||
            c.mcNumber.toLowerCase().includes(q)
          )) return true;
        }

        return false;
      })
      .slice(0, 6); // Limit to 6 results
  }, [searchQuery, selectedRole, registeredUsers]);

  const handleSearch = () => {
    setShowResults(false);
    if (onSearch) {
      onSearch(searchQuery, selectedRole, selectedRegion);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setShowResults(value.trim().length >= 2);
  };

  const handleResultClick = (userId: string) => {
    setShowResults(false);
    if (onViewProfile) {
      onViewProfile(userId);
    }
  };

  // Fetch real platform user counts from Supabase
  const [platformCounts, setPlatformCounts] = useState({ dispatchers: 0, carriers: 0, brokers: 0 });
  useEffect(() => {
    getPlatformUserCounts()
      .then(counts => setPlatformCounts(counts))
      .catch(() => { /* keep at 0 */ });
  }, []);

  const dispatcherCount = platformCounts.dispatchers;
  const carrierCount = platformCounts.carriers;
  const brokerCount = platformCounts.brokers;

  return (
    <section className="relative" style={{ background: 'linear-gradient(135deg, #0f2027 0%, #1E3A5F 30%, #203a5c 50%, #2c5282 70%, #1E3A5F 100%)' }}>
      {/* Decorative elements — clipped to section bounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      </div>

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
                className="flex items-center justify-center gap-2 px-8 py-4 btn-glossy-primary rounded-xl text-lg transition-all transform hover:scale-105"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">I'm looking for a:</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setSelectedRole('dispatcher')}
                      className={`p-4 border-2 rounded-xl text-center transition-all ${
                        selectedRole === 'dispatcher'
                          ? 'border-[#3B82F6] bg-gradient-to-b from-[#3B82F6]/5 to-[#3B82F6]/10'
                          : 'border-gray-200 hover:border-[#3B82F6] hover:bg-[#3B82F6]/5'
                      }`}
                    >
                      <Users className={`w-6 h-6 mx-auto mb-2 ${selectedRole === 'dispatcher' ? 'text-[#3B82F6]' : 'text-gray-400'}`} />
                      <span className={`text-sm font-bold ${selectedRole === 'dispatcher' ? 'text-[#1E3A5F]' : 'text-gray-500'}`}>Dispatcher</span>
                    </button>
                    <button
                      onClick={() => setSelectedRole('carrier')}
                      className={`p-4 border-2 rounded-xl text-center transition-all ${
                        selectedRole === 'carrier'
                          ? 'border-[#3B82F6] bg-gradient-to-b from-[#3B82F6]/5 to-[#3B82F6]/10'
                          : 'border-gray-200 hover:border-[#3B82F6] hover:bg-[#3B82F6]/5'
                      }`}
                    >
                      <svg className={`w-6 h-6 mx-auto mb-2 ${selectedRole === 'carrier' ? 'text-[#3B82F6]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span className={`text-sm font-bold ${selectedRole === 'carrier' ? 'text-[#1E3A5F]' : 'text-gray-500'}`}>Carrier</span>
                    </button>
                    <button
                      onClick={() => setSelectedRole('broker')}
                      className={`p-4 border-2 rounded-xl text-center transition-all ${
                        selectedRole === 'broker'
                          ? 'border-[#3B82F6] bg-gradient-to-b from-[#3B82F6]/5 to-[#3B82F6]/10'
                          : 'border-gray-200 hover:border-[#3B82F6] hover:bg-[#3B82F6]/5'
                      }`}
                    >
                      <Briefcase className={`w-6 h-6 mx-auto mb-2 ${selectedRole === 'broker' ? 'text-[#3B82F6]' : 'text-gray-400'}`} />
                      <span className={`text-sm font-bold ${selectedRole === 'broker' ? 'text-[#1E3A5F]' : 'text-gray-500'}`}>Broker</span>
                    </button>
                  </div>
                </div>

                {/* Search input with live results */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Search by:</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                      onFocus={() => { if (searchQuery.trim().length >= 2) setShowResults(true); }}
                      placeholder={
                        selectedRole === 'dispatcher'
                          ? 'Name, company, or specialty...'
                          : 'MC#, DOT#, company name...'
                      }
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none transition-all text-sm"
                    />
                  </div>

                  {/* Live search results dropdown */}
                  {showResults && searchQuery.trim().length >= 2 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-72 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        <>
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                            <span className="text-xs font-semibold text-gray-500">
                              {searchResults.length} {selectedRole}{searchResults.length !== 1 ? 's' : ''} found on DispatchLink
                            </span>
                          </div>
                          {searchResults.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => handleResultClick(user.id)}
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
                            >
                              <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {user.image ? (
                                  <img src={user.image} alt={user.name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                  <span className="text-white text-sm font-bold">{user.name.charAt(0)}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-gray-900 truncate">{user.name}</span>
                                  {user.verified && <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span className="truncate">{user.company}</span>
                                  {user.location && (
                                    <>
                                      <span className="text-gray-300">|</span>
                                      <span className="flex items-center gap-0.5 truncate">
                                        <MapPin className="w-3 h-3" />
                                        {user.location}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {(user.mcNumber || user.dotNumber) && (
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {user.mcNumber && (
                                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">{user.mcNumber}</span>
                                    )}
                                    {user.dotNumber && (
                                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">DOT {user.dotNumber}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                            </button>
                          ))}
                          <button
                            onClick={handleSearch}
                            className="w-full text-center px-4 py-2.5 text-sm font-semibold text-[#3B82F6] hover:bg-blue-50 transition-colors border-t border-gray-100"
                          >
                            View all results in {selectedRole === 'dispatcher' ? 'Dispatcher' : selectedRole === 'carrier' ? 'Carrier' : 'Broker'} Directory
                          </button>
                        </>
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-500">No {selectedRole}s found for "{searchQuery}"</p>
                          <p className="text-xs text-gray-400 mt-1">Try a different search or browse the full directory</p>
                          <button
                            onClick={handleSearch}
                            className="mt-3 text-xs font-semibold text-[#3B82F6] hover:underline"
                          >
                            Browse {selectedRole === 'dispatcher' ? 'Dispatcher' : selectedRole === 'carrier' ? 'Carrier' : 'Broker'} Directory
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Operating Region:</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none transition-all bg-white text-sm"
                  >
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
                  onClick={handleSearch}
                  className="w-full py-4 btn-glossy-navy rounded-xl text-base transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <Search className="w-5 h-5" />
                  Search Network
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-extrabold text-[#3B82F6]">{dispatcherCount}</p>
                  <p className="text-xs text-gray-400 font-medium">Dispatchers</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-[#10B981]">{carrierCount}</p>
                  <p className="text-xs text-gray-400 font-medium">Carriers</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-[#F59E0B]">{brokerCount}</p>
                  <p className="text-xs text-gray-400 font-medium">Brokers</p>
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
