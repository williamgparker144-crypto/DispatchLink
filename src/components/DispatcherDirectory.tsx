import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, Grid, List, X } from 'lucide-react';
import DispatcherCard from './DispatcherCard';

const dispatcherImages = [
  'https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418478138_3a06fafe.png',
  'https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418479994_627b2454.png',
  'https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418479362_901c4ead.png',
  'https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418482552_750125b3.png',
];

const sampleDispatchers = [
  { id: '1', name: 'Mike Johnson', company: 'Johnson Dispatch Services', image: dispatcherImages[0], rating: 4.9, reviews: 156, experience: 12, specialties: ['Flatbed', 'Heavy Haul', 'Oversized'], tier: 'premier' as const, verified: true },
  { id: '2', name: 'Sarah Williams', company: 'Williams Logistics Group', image: dispatcherImages[1], rating: 4.8, reviews: 98, experience: 8, specialties: ['Reefer', 'Produce', 'Food Grade'], tier: 'premier' as const, verified: true },
  { id: '3', name: 'David Chen', company: 'FreightPro Dispatch', image: dispatcherImages[2], rating: 4.7, reviews: 67, experience: 5, specialties: ['Dry Van', 'LTL', 'Regional'], tier: 'basic' as const, verified: true },
  { id: '4', name: 'Lisa Martinez', company: 'TruckHub Solutions', image: dispatcherImages[3], rating: 4.95, reviews: 203, experience: 15, specialties: ['Hazmat', 'Tanker', 'Chemical'], tier: 'premier' as const, verified: true },
  { id: '5', name: 'James Brown', company: 'Elite Dispatch Co', image: dispatcherImages[0], rating: 4.5, reviews: 34, experience: 3, specialties: ['Dry Van', 'Dedicated', 'OTR'], tier: 'basic' as const, verified: true },
  { id: '6', name: 'Emily Davis', company: 'RoadMaster Dispatch', image: dispatcherImages[1], rating: 4.85, reviews: 142, experience: 10, specialties: ['Auto Transport', 'Car Hauler', 'Enclosed'], tier: 'premier' as const, verified: true },
  { id: '7', name: 'Robert Taylor', company: 'Taylor Freight Services', image: dispatcherImages[2], rating: 4.6, reviews: 78, experience: 7, specialties: ['Flatbed', 'Step Deck', 'Conestoga'], tier: 'basic' as const, verified: true },
  { id: '8', name: 'Jennifer Wilson', company: 'Wilson Dispatch LLC', image: dispatcherImages[3], rating: 4.75, reviews: 112, experience: 9, specialties: ['Reefer', 'Dry Van', 'Intermodal'], tier: 'premier' as const, verified: true },
  { id: '9', name: 'Michael Anderson', company: 'Anderson Logistics', image: dispatcherImages[0], rating: 4.4, reviews: 45, experience: 4, specialties: ['Dry Van', 'Box Truck', 'Local'], tier: 'basic' as const, verified: true },
  { id: '10', name: 'Amanda Moore', company: 'Moore Express Dispatch', image: dispatcherImages[1], rating: 4.9, reviews: 167, experience: 11, specialties: ['Expedited', 'Hot Shot', 'Time Critical'], tier: 'premier' as const, verified: true },
  { id: '11', name: 'Christopher Lee', company: 'Lee Trucking Dispatch', image: dispatcherImages[2], rating: 4.65, reviews: 89, experience: 6, specialties: ['Tanker', 'Bulk', 'Pneumatic'], tier: 'basic' as const, verified: true },
  { id: '12', name: 'Jessica Thomas', company: 'Thomas Freight Solutions', image: dispatcherImages[3], rating: 4.8, reviews: 134, experience: 8, specialties: ['Heavy Haul', 'Oversized', 'Permits'], tier: 'premier' as const, verified: true },
];

const specialtyOptions = ['Flatbed', 'Reefer', 'Dry Van', 'Hazmat', 'Tanker', 'Heavy Haul', 'Auto Transport', 'LTL', 'Expedited'];

interface DispatcherDirectoryProps {
  onViewProfile: (id: string) => void;
  onContact: (id: string) => void;
}

const DispatcherDirectory: React.FC<DispatcherDirectoryProps> = ({ onViewProfile, onContact }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const tierFilter = 'all';
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'reviews'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filteredDispatchers = useMemo(() => {
    let results = [...sampleDispatchers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(d => 
        d.name.toLowerCase().includes(query) ||
        d.company.toLowerCase().includes(query) ||
        d.specialties.some(s => s.toLowerCase().includes(query))
      );
    }

    // Specialty filter
    if (selectedSpecialties.length > 0) {
      results = results.filter(d =>
        selectedSpecialties.some(s => d.specialties.includes(s))
      );
    }

    // Tier filter
    if (tierFilter !== 'all') {
      results = results.filter(d => d.tier === tierFilter);
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
  }, [searchQuery, selectedSpecialties, sortBy]);

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a365d] mb-2">Find Dispatchers</h1>
          <p className="text-gray-600">Browse verified dispatchers ready to help grow your business</p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, company, or specialty..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                  showFilters ? 'bg-[#1a365d] text-white border-[#1a365d]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
                {selectedSpecialties.length > 0 && (
                  <span className="bg-[#ff6b35] text-white text-xs px-2 py-0.5 rounded-full">
                    {selectedSpecialties.length}
                  </span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
              >
                <option value="rating">Sort by Rating</option>
                <option value="experience">Sort by Experience</option>
                <option value="reviews">Sort by Reviews</option>
              </select>

              <div className="hidden sm:flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 ${viewMode === 'grid' ? 'bg-[#1a365d] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 ${viewMode === 'list' ? 'bg-[#1a365d] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid md:grid-cols-2 gap-6">
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
                            ? 'bg-[#ff6b35] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Placeholder for future filters */}
              </div>

              {/* Clear Filters */}
              {selectedSpecialties.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedSpecialties([]);
                  }}
                  className="mt-4 flex items-center gap-2 text-sm text-[#ff6b35] hover:text-[#e55a2b]"
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
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchQuery('');
                setSelectedSpecialties([]);
              }}
              className="px-4 py-2 bg-[#ff6b35] text-white rounded-lg font-medium hover:bg-[#e55a2b] transition-colors"
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
