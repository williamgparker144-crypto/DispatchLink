import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Grid, List, X, MapPin, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import CarrierCard from './CarrierCard';
import CarrierScoutUpgradeCTA from './CarrierScoutUpgradeCTA';
import { getUsersByType } from '@/lib/api';

const equipmentOptions = ['Flatbed', 'Reefer', 'Dry Van', 'Tanker', 'Hazmat', 'Heavy Haul', 'Auto Transport', 'LTL', 'Intermodal'];
const regionOptions = ['Nationwide', 'Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast'];

interface CarrierDirectoryProps {
  onViewProfile: (id: string) => void;
  onRequestPermission: (id: string) => void;
  onVerifyCarrier?: (dot: string, mc: string) => void;
  initialSearchQuery?: string;
}

interface CarrierItem {
  id: string;
  name: string;
  company: string;
  image: string;
  rating: number;
  reviews: number;
  dotNumber: string;
  mcNumber: string;
  fleetSize: number;
  equipmentTypes: string[];
  regions: string[];
  verified: boolean;
  insuranceVerified: boolean;
}

const CarrierDirectory: React.FC<CarrierDirectoryProps> = ({ onViewProfile, onRequestPermission, onVerifyCarrier, initialSearchQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  useEffect(() => { setSearchQuery(initialSearchQuery); }, [initialSearchQuery]);
  const [carriers, setCarriers] = useState<CarrierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  // Fetch carriers from Supabase
  const fetchCarriers = useCallback(async (signal?: { cancelled: boolean }) => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await getUsersByType('carrier');
      if (signal?.cancelled) return;
      if (data) {
        const mapped: CarrierItem[] = data.map((row: any) => {
          const profile = Array.isArray(row.carrier_profiles)
            ? row.carrier_profiles[0]
            : row.carrier_profiles;
          return {
            id: row.id,
            name: `${row.first_name} ${row.last_name}`,
            company: row.company_name || `${row.first_name} ${row.last_name}`,
            image: row.profile_image_url || '',
            rating: 0,
            reviews: 0,
            dotNumber: profile?.dot_number || '',
            mcNumber: profile?.mc_number || '',
            fleetSize: profile?.fleet_size || 1,
            equipmentTypes: profile?.equipment_types || [],
            regions: profile?.operating_regions || [],
            verified: row.verified || false,
            insuranceVerified: false,
          };
        });
        setCarriers(mapped);
      }
    } catch (err) {
      console.warn('Failed to fetch carriers from Supabase:', err);
      if (!signal?.cancelled) setFetchError(true);
    } finally {
      if (!signal?.cancelled) setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    const signal = { cancelled: false };
    fetchCarriers(signal);
    return () => { signal.cancelled = true; };
  }, [fetchCarriers]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'fleetSize' | 'reviews'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filteredCarriers = useMemo(() => {
    let results = [...carriers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.company.toLowerCase().includes(query) ||
        c.dotNumber.toLowerCase().includes(query) ||
        c.mcNumber.toLowerCase().includes(query) ||
        c.equipmentTypes.some(e => e.toLowerCase().includes(query))
      );
    }

    // Equipment filter
    if (selectedEquipment.length > 0) {
      results = results.filter(c =>
        selectedEquipment.some(e => c.equipmentTypes.includes(e))
      );
    }

    // Region filter
    if (selectedRegions.length > 0) {
      results = results.filter(c =>
        selectedRegions.some(r => c.regions.includes(r) || c.regions.includes('Nationwide'))
      );
    }

    // Sort
    results.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'fleetSize':
          return b.fleetSize - a.fleetSize;
        case 'reviews':
          return b.reviews - a.reviews;
        default:
          return 0;
      }
    });

    return results;
  }, [carriers, searchQuery, selectedEquipment, selectedRegions, sortBy]);

  // FMCSA lookup: when query looks like a DOT/MC number, navigate to verify page
  const handleFMCSASearch = () => {
    if (!searchQuery.trim() || !onVerifyCarrier) return;
    const digits = searchQuery.replace(/[^0-9]/g, '');
    if (digits.length >= 7) {
      // Likely DOT number
      onVerifyCarrier(digits, '');
    } else if (digits.length >= 4) {
      // Likely MC number
      onVerifyCarrier('', digits);
    } else if (searchQuery.trim()) {
      // Non-numeric — still send to verify to let user refine
      onVerifyCarrier('', '');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const digits = searchQuery.replace(/[^0-9]/g, '');
      // If it's a number (DOT/MC), trigger FMCSA verification
      if (digits.length >= 4 && onVerifyCarrier) {
        handleFMCSASearch();
      }
    }
  };

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev =>
      prev.includes(equipment)
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  return (
    <section className="py-12 page-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Find Carriers</h1>
          <p className="text-gray-600">Browse verified carriers with active DOT MC# authority</p>
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
                onKeyDown={handleSearchKeyDown}
                placeholder="Search by company, DOT#, MC#, or equipment type..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
              />
            </div>

            {/* Search & Filter Controls */}
            <div className="flex gap-3">
              {onVerifyCarrier && searchQuery.trim() && (
                <button
                  onClick={handleFMCSASearch}
                  className="flex items-center gap-2 px-4 py-3 bg-[#3B82F6] text-white rounded-lg font-medium hover:bg-[#2563EB] transition-colors whitespace-nowrap"
                >
                  <Search className="w-5 h-5" />
                  Verify FMCSA
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                  showFilters ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
                {(selectedEquipment.length + selectedRegions.length) > 0 && (
                  <span className="bg-[#3B82F6] text-white text-xs px-2 py-0.5 rounded-full">
                    {selectedEquipment.length + selectedRegions.length}
                  </span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
              >
                <option value="rating">Sort by Rating</option>
                <option value="fleetSize">Sort by Fleet Size</option>
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
              <div className="grid md:grid-cols-2 gap-6">
                {/* Equipment Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Types</label>
                  <div className="flex flex-wrap gap-2">
                    {equipmentOptions.map((equipment) => (
                      <button
                        key={equipment}
                        onClick={() => toggleEquipment(equipment)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedEquipment.includes(equipment)
                            ? 'bg-[#3B82F6] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {equipment}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Operating Regions</label>
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

              {/* Clear Filters */}
              {(selectedEquipment.length > 0 || selectedRegions.length > 0) && (
                <button
                  onClick={() => {
                    setSelectedEquipment([]);
                    setSelectedRegions([]);
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
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading carriers...
            </span>
          ) : fetchError ? (
            <span className="text-amber-600">Could not load carriers from server</span>
          ) : (
            `Showing ${filteredCarriers.length} carrier${filteredCarriers.length !== 1 ? 's' : ''}`
          )}
        </div>

        {/* Fetch Error State */}
        {!loading && fetchError && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Unable to Load Carriers</h3>
            <p className="text-gray-500 mb-4 max-w-md mx-auto">
              This can happen due to a slow connection or browser privacy settings.
              Please try again.
            </p>
            <button
              onClick={() => fetchCarriers()}
              className="px-5 py-2.5 bg-[#3B82F6] text-white rounded-lg font-medium hover:bg-[#2563EB] transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Carrier Grid */}
        {!fetchError && (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {filteredCarriers.map((carrier) => (
              <CarrierCard
                key={carrier.id}
                carrier={carrier}
                onViewProfile={onViewProfile}
                onRequestPermission={onRequestPermission}
              />
            ))}
          </div>
        )}

        {/* CarrierScout CTA */}
        <div className="mt-8">
          <CarrierScoutUpgradeCTA
            featureName="Load Matching & Loadboard Integration"
            onGetNotified={() => {}}
          />
        </div>

        {/* No Results */}
        {!loading && !fetchError && filteredCarriers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No carriers found</h3>
            <p className="text-gray-500 mb-4">No carriers found. Use Verify DOT/MC to look up carriers.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedEquipment([]);
                setSelectedRegions([]);
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

export default CarrierDirectory;
