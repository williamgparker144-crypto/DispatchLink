import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Grid, List, X, MapPin } from 'lucide-react';
import BrokerCard from './BrokerCard';

const sampleBrokers: any[] = [];

const specialtyOptions = ['Heavy Haul', 'Reefer', 'Dry Van', 'Flatbed', 'Hazmat', 'Intermodal', 'Auto Transport', 'LTL'];
const regionOptions = ['Nationwide', 'Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast'];

const BrokerDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'yearsInBusiness' | 'reviews'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filteredBrokers = useMemo(() => {
    let results = [...sampleBrokers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(b =>
        b.name.toLowerCase().includes(query) ||
        b.company.toLowerCase().includes(query) ||
        b.mcNumber.toLowerCase().includes(query) ||
        b.specialties.some(s => s.toLowerCase().includes(query))
      );
    }

    if (selectedSpecialties.length > 0) {
      results = results.filter(b =>
        selectedSpecialties.some(s => b.specialties.includes(s))
      );
    }

    if (selectedRegions.length > 0) {
      results = results.filter(b =>
        selectedRegions.some(r => b.regions.includes(r) || b.regions.includes('Nationwide'))
      );
    }

    results.sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'yearsInBusiness': return b.yearsInBusiness - a.yearsInBusiness;
        case 'reviews': return b.reviews - a.reviews;
        default: return 0;
      }
    });

    return results;
  }, [searchQuery, selectedSpecialties, selectedRegions, sortBy]);

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty) ? prev.filter(s => s !== specialty) : [...prev, specialty]
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Find Brokers</h1>
          <p className="text-gray-600">Browse verified freight brokers and connect with them directly</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 glass-light">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company, MC#, or specialty..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                  showFilters ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
                {(selectedSpecialties.length + selectedRegions.length) > 0 && (
                  <span className="bg-[#3B82F6] text-white text-xs px-2 py-0.5 rounded-full">
                    {selectedSpecialties.length + selectedRegions.length}
                  </span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
              >
                <option value="rating">Sort by Rating</option>
                <option value="yearsInBusiness">Sort by Experience</option>
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

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid md:grid-cols-2 gap-6">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Regions</label>
                  <div className="flex flex-wrap gap-2">
                    {regionOptions.map((region) => (
                      <button
                        key={region}
                        onClick={() => toggleRegion(region)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                          selectedRegions.includes(region)
                            ? 'bg-[#1E3A5F] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <MapPin className="w-3 h-3" />
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {(selectedSpecialties.length > 0 || selectedRegions.length > 0) && (
                <button
                  onClick={() => { setSelectedSpecialties([]); setSelectedRegions([]); }}
                  className="mt-4 flex items-center gap-2 text-sm text-[#3B82F6] hover:text-[#2563EB]"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredBrokers.length} broker{filteredBrokers.length !== 1 ? 's' : ''}
        </div>

        <div className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        }`}>
          {filteredBrokers.map((broker) => (
            <BrokerCard
              key={broker.id}
              broker={broker}
              onViewProfile={(id) => console.log('View broker profile:', id)}
            />
          ))}
        </div>

        {filteredBrokers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No brokers found</h3>
            <p className="text-gray-500 mb-4">No brokers listed yet.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedSpecialties([]); setSelectedRegions([]); }}
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

export default BrokerDirectory;
