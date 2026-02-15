import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Grid, List, X } from 'lucide-react';
import DispatcherCard from './DispatcherCard';
import { useAppContext } from '@/contexts/AppContext';
import { computeVerificationTier, crossReferenceCarriers } from '@/lib/verification';

const specialtyOptions = ['Flatbed', 'Reefer', 'Dry Van', 'Hazmat', 'Tanker', 'Heavy Haul', 'Auto Transport', 'LTL', 'Expedited'];

interface DispatcherDirectoryProps {
  onViewProfile: (id: string) => void;
  onContact: (id: string) => void;
}

const DispatcherDirectory: React.FC<DispatcherDirectoryProps> = ({ onViewProfile, onContact }) => {
  const { registeredUsers } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'reviews'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [experienceFilter, setExperienceFilter] = useState<'all' | 'beginner' | 'intermediate' | 'experienced'>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'beginners'>('all');

  // Build set of registered carrier MC#s for cross-referencing
  const registeredCarrierMCs = useMemo(() => {
    const mcs = new Set<string>();
    registeredUsers.forEach(u => {
      if (u.userType === 'carrier' && u.mcNumber) {
        mcs.add(u.mcNumber.toUpperCase());
      }
    });
    return mcs;
  }, [registeredUsers]);

  const filteredDispatchers = useMemo(() => {
    // Only show dispatchers
    let dispatchers = registeredUsers.filter(u => u.userType === 'dispatcher');

    // Map to the shape DispatcherCard expects, with cross-referenced carriers
    let results = dispatchers.map(d => {
      const carriers = d.carriersWorkedWith
        ? crossReferenceCarriers(d.carriersWorkedWith, registeredCarrierMCs)
        : [];
      const enriched = { ...d, carriersWorkedWith: carriers };
      const tier = computeVerificationTier(enriched);
      return {
        id: d.id,
        name: d.name,
        company: d.company,
        image: d.image || '',
        rating: 0,
        reviews: 0,
        experience: d.yearsExperience ?? 0,
        specialties: d.specialties || [],
        tier: (d.carrierScoutSubscribed ? 'premier' : 'basic') as 'basic' | 'premier',
        verified: d.verified,
        verificationTier: tier,
      };
    });

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.company.toLowerCase().includes(query) ||
        d.specialties.some((s: string) => s.toLowerCase().includes(query))
      );
    }

    // Specialty filter
    if (selectedSpecialties.length > 0) {
      results = results.filter(d =>
        selectedSpecialties.some(s => d.specialties.includes(s))
      );
    }

    // Experience level filter
    if (experienceFilter !== 'all') {
      results = results.filter(d => {
        switch (experienceFilter) {
          case 'beginner': return d.experience <= 1;
          case 'intermediate': return d.experience >= 2 && d.experience <= 4;
          case 'experienced': return d.experience >= 5;
          default: return true;
        }
      });
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      results = results.filter(d => {
        switch (verificationFilter) {
          case 'verified': return d.verificationTier === 'carrierscout_verified' || d.verificationTier === 'experience_verified';
          case 'beginners': return d.verificationTier === 'beginner';
          default: return true;
        }
      });
    }

    // Sort
    results.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.experience - a.experience;
        case 'reviews':
          return b.reviews - a.reviews;
        default:
          return 0;
      }
    });

    return results;
  }, [registeredUsers, registeredCarrierMCs, searchQuery, selectedSpecialties, sortBy, experienceFilter, verificationFilter]);

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const hasActiveFilters = selectedSpecialties.length > 0 || experienceFilter !== 'all' || verificationFilter !== 'all';

  return (
    <section className="py-12 page-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Find Dispatchers</h1>
          <p className="text-gray-600">Browse verified dispatchers ready to help grow your business</p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 glass-light">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, company, or specialty..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                  showFilters ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-[#3B82F6] text-white text-xs px-2 py-0.5 rounded-full">
                    {selectedSpecialties.length + (experienceFilter !== 'all' ? 1 : 0) + (verificationFilter !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
              >
                <option value="rating">Sort by Rating</option>
                <option value="experience">Sort by Experience</option>
                <option value="reviews">Sort by Reviews</option>
              </select>

              <div className="hidden sm:flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 ${viewMode === 'grid' ? 'bg-[#1E3A5F] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 ${viewMode === 'list' ? 'bg-[#1E3A5F] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Specialty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                  <div className="flex flex-wrap gap-2">
                    {specialtyOptions.map((specialty) => (
                      <button
                        key={specialty}
                        onClick={() => toggleSpecialty(specialty)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedSpecialties.includes(specialty)
                            ? 'bg-[#3B82F6] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all' as const, label: 'All Levels' },
                      { value: 'beginner' as const, label: 'Beginner (0-1 yr)' },
                      { value: 'intermediate' as const, label: 'Intermediate (2-4 yr)' },
                      { value: 'experienced' as const, label: 'Experienced (5+ yr)' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setExperienceFilter(opt.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          experienceFilter === opt.value
                            ? 'bg-[#1E3A5F] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verification Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all' as const, label: 'All' },
                      { value: 'verified' as const, label: 'Verified Only' },
                      { value: 'beginners' as const, label: 'Beginners Welcome' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setVerificationFilter(opt.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          verificationFilter === opt.value
                            ? 'bg-[#1E3A5F] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSelectedSpecialties([]);
                    setExperienceFilter('all');
                    setVerificationFilter('all');
                  }}
                  className="mt-4 flex items-center gap-2 text-sm text-[#3B82F6] hover:text-[#2563EB]"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredDispatchers.length} dispatcher{filteredDispatchers.length !== 1 ? 's' : ''}
        </div>

        {/* Dispatcher Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        }`}>
          {filteredDispatchers.map((dispatcher) => (
            <DispatcherCard
              key={dispatcher.id}
              dispatcher={dispatcher}
              onViewProfile={onViewProfile}
              onContact={onContact}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredDispatchers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No dispatchers found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecialties([]);
                setExperienceFilter('all');
                setVerificationFilter('all');
              }}
              className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg font-medium hover:bg-[#2563EB] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default DispatcherDirectory;
