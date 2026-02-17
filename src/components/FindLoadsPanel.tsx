import React, { useState, useEffect } from 'react';
import {
  Shield,
  Truck,
  MapPin,
  DollarSign,
  Calendar,
  Package,
  AlertTriangle,
  Search,
  ChevronRight,
  ArrowRight,
  Users,
  CheckCircle2,
  Info,
  Loader2,
  Rocket,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { getDispatcherMCPermissions } from '@/lib/api';
import type { MCPermissionWithCarrier, DemoLoad } from '@/types';

interface FindLoadsPanelProps {
  onNavigate: (view: string) => void;
}

// Realistic demo loads covering multiple equipment types and regions
const ALL_DEMO_LOADS: DemoLoad[] = [
  {
    id: 'load-001', origin: 'Atlanta', originState: 'GA', destination: 'Dallas', destinationState: 'TX',
    distance: 781, rate: 2340, ratePerMile: 3.0, equipmentType: 'Dry Van', weight: '42,000 lbs',
    pickupDate: '2026-02-18', deliveryDate: '2026-02-19', broker: 'TQL Logistics', commodity: 'Consumer Electronics', status: 'available',
  },
  {
    id: 'load-002', origin: 'Chicago', originState: 'IL', destination: 'Miami', destinationState: 'FL',
    distance: 1380, rate: 3450, ratePerMile: 2.5, equipmentType: 'Reefer', weight: '38,000 lbs',
    pickupDate: '2026-02-17', deliveryDate: '2026-02-20', broker: 'CH Robinson', commodity: 'Frozen Produce', status: 'available',
  },
  {
    id: 'load-003', origin: 'Houston', originState: 'TX', destination: 'Memphis', destinationState: 'TN',
    distance: 586, rate: 1875, ratePerMile: 3.2, equipmentType: 'Flatbed', weight: '45,000 lbs',
    pickupDate: '2026-02-18', deliveryDate: '2026-02-19', broker: 'XPO Logistics', commodity: 'Steel Beams', status: 'available',
  },
  {
    id: 'load-004', origin: 'Los Angeles', originState: 'CA', destination: 'Phoenix', destinationState: 'AZ',
    distance: 373, rate: 1120, ratePerMile: 3.0, equipmentType: 'Dry Van', weight: '40,000 lbs',
    pickupDate: '2026-02-19', deliveryDate: '2026-02-19', broker: 'Echo Global', commodity: 'Retail Goods', status: 'available',
  },
  {
    id: 'load-005', origin: 'Nashville', originState: 'TN', destination: 'Charlotte', destinationState: 'NC',
    distance: 410, rate: 1230, ratePerMile: 3.0, equipmentType: 'Reefer', weight: '36,000 lbs',
    pickupDate: '2026-02-18', deliveryDate: '2026-02-19', broker: 'Coyote Logistics', commodity: 'Dairy Products', status: 'available',
  },
  {
    id: 'load-006', origin: 'Denver', originState: 'CO', destination: 'Kansas City', destinationState: 'MO',
    distance: 604, rate: 1510, ratePerMile: 2.5, equipmentType: 'Flatbed', weight: '48,000 lbs',
    pickupDate: '2026-02-20', deliveryDate: '2026-02-21', broker: 'Landstar', commodity: 'Lumber', status: 'available',
  },
  {
    id: 'load-007', origin: 'Jacksonville', originState: 'FL', destination: 'Savannah', destinationState: 'GA',
    distance: 140, rate: 490, ratePerMile: 3.5, equipmentType: 'Dry Van', weight: '35,000 lbs',
    pickupDate: '2026-02-17', deliveryDate: '2026-02-17', broker: 'RXO Logistics', commodity: 'Paper Products', status: 'available',
  },
  {
    id: 'load-008', origin: 'Seattle', originState: 'WA', destination: 'Portland', destinationState: 'OR',
    distance: 174, rate: 610, ratePerMile: 3.5, equipmentType: 'Reefer', weight: '34,000 lbs',
    pickupDate: '2026-02-19', deliveryDate: '2026-02-19', broker: 'Schneider', commodity: 'Fresh Seafood', status: 'available',
  },
  {
    id: 'load-009', origin: 'Indianapolis', originState: 'IN', destination: 'Detroit', destinationState: 'MI',
    distance: 289, rate: 895, ratePerMile: 3.1, equipmentType: 'Dry Van', weight: '41,000 lbs',
    pickupDate: '2026-02-18', deliveryDate: '2026-02-18', broker: 'J.B. Hunt', commodity: 'Auto Parts', status: 'available',
  },
  {
    id: 'load-010', origin: 'San Antonio', originState: 'TX', destination: 'El Paso', destinationState: 'TX',
    distance: 551, rate: 1380, ratePerMile: 2.5, equipmentType: 'Flatbed', weight: '46,000 lbs',
    pickupDate: '2026-02-20', deliveryDate: '2026-02-21', broker: 'Werner Enterprises', commodity: 'Construction Materials', status: 'available',
  },
  {
    id: 'load-011', origin: 'Columbus', originState: 'OH', destination: 'Pittsburgh', destinationState: 'PA',
    distance: 185, rate: 648, ratePerMile: 3.5, equipmentType: 'Reefer', weight: '32,000 lbs',
    pickupDate: '2026-02-17', deliveryDate: '2026-02-17', broker: 'DAT Freight', commodity: 'Pharmaceuticals', status: 'available',
  },
  {
    id: 'load-012', origin: 'New York', originState: 'NY', destination: 'Boston', destinationState: 'MA',
    distance: 215, rate: 750, ratePerMile: 3.49, equipmentType: 'Dry Van', weight: '39,000 lbs',
    pickupDate: '2026-02-19', deliveryDate: '2026-02-19', broker: 'Uber Freight', commodity: 'E-Commerce Goods', status: 'available',
  },
];

const FindLoadsPanel: React.FC<FindLoadsPanelProps> = ({ onNavigate }) => {
  const { currentUser } = useAppContext();
  const [permissions, setPermissions] = useState<MCPermissionWithCarrier[]>([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [originFilter, setOriginFilter] = useState<string>('');
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Fetch dispatcher's active MC permissions on mount
  useEffect(() => {
    if (!currentUser?.id) return;
    const isSupabaseId = !currentUser.id.startsWith('user-') && !currentUser.id.startsWith('seed-');
    if (!isSupabaseId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await getDispatcherMCPermissions(currentUser.id);
        const active = (data || []).filter((p: MCPermissionWithCarrier) => p.status === 'active');
        setPermissions(active);
      } catch {
        // Silently handle — table may not exist yet
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser?.id]);

  const selectedPermission = permissions.find(p => p.carrier?.id === selectedCarrierId);
  const carrierProfile = selectedPermission?.carrier?.carrier_profiles?.[0];
  const carrierName = selectedPermission?.carrier
    ? (selectedPermission.carrier.company_name || `${selectedPermission.carrier.first_name} ${selectedPermission.carrier.last_name}`)
    : '';
  const carrierMC = carrierProfile?.mc_number || '';
  const carrierEquipment = carrierProfile?.equipment_types || [];

  // Filter demo loads by carrier's equipment types
  const filteredLoads = ALL_DEMO_LOADS.filter(load => {
    // Filter by carrier's equipment
    if (carrierEquipment.length > 0 && !carrierEquipment.some(eq =>
      load.equipmentType.toLowerCase().includes(eq.toLowerCase()) ||
      eq.toLowerCase().includes(load.equipmentType.toLowerCase())
    )) {
      return false;
    }
    // Apply user equipment filter
    if (equipmentFilter !== 'all' && load.equipmentType !== equipmentFilter) return false;
    // Apply origin filter
    if (originFilter && !load.origin.toLowerCase().includes(originFilter.toLowerCase()) &&
        !load.originState.toLowerCase().includes(originFilter.toLowerCase())) return false;
    return true;
  });

  const handleSearch = () => {
    setSearching(true);
    // Simulate search delay
    setTimeout(() => {
      setSearching(false);
      setShowResults(true);
    }, 800);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
      </div>
    );
  }

  // No permissions state — full guidance
  if (permissions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#1E3A5F] mb-3">No Active MC Authorizations</h2>
          <p className="text-gray-600 max-w-lg mx-auto">
            You must be authorized by a carrier before you can search loads on their behalf.
            As a dispatcher, you act as an <strong>agent</strong> for carriers who explicitly grant you
            permission to use their MC# authority.
          </p>
        </div>

        {/* Steps to get authorized */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold text-[#1E3A5F] mb-4">How to Get Authorized</h3>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Connect with a Carrier', desc: 'Find and connect with carriers on the platform who need dispatch services.', icon: <Users className="w-5 h-5" /> },
              { step: 2, title: 'Request MC Permission', desc: 'Ask the carrier to grant you MC# authority through the permission system.', icon: <Shield className="w-5 h-5" /> },
              { step: 3, title: 'Carrier Signs Digital Consent', desc: 'The carrier reviews and signs a digital consent form authorizing you to act on their behalf.', icon: <CheckCircle2 className="w-5 h-5" /> },
              { step: 4, title: 'Search Loads as Their Agent', desc: 'Once approved, you can search and book loads exclusively for that carrier\'s authority.', icon: <Truck className="w-5 h-5" /> },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center text-[#1E3A5F] font-bold text-sm">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {item.icon}
                    <span className="font-medium text-[#1E3A5F]">{item.title}</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legal disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Agent Authorization Notice</p>
              <p>
                Dispatchers may only use a carrier's MC# to find and book loads for that specific carrier.
                Unauthorized use of another carrier's MC# authority is prohibited and may result in legal consequences
                under federal transportation regulations.
              </p>
            </div>
          </div>
        </div>

        {/* CarrierScout CTA */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white mb-6">
          <div className="flex items-start gap-4">
            <Rocket className="w-8 h-8 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-lg mb-1">Solidify Your Connections with CarrierScout</h4>
              <p className="text-emerald-100 text-sm mb-3">
                Sign up at carrierscout.vip to access enhanced workflow tools, integrated load boards,
                and streamlined carrier-dispatcher partnerships. 14-day free trial for dispatchers!
              </p>
              <a
                href="https://carrierscout.vip"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 rounded-lg font-medium text-sm hover:bg-emerald-50 transition-colors"
              >
                Visit CarrierScout.vip <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => onNavigate('carriers')}
            className="px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-medium hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Find Carriers to Connect With
          </button>
        </div>
      </div>
    );
  }

  // Active permissions — show load search pipeline
  return (
    <div className="space-y-6">
      {/* Carrier Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-[#1E3A5F] mb-1">Select Authorized Carrier</h3>
        <p className="text-sm text-gray-500 mb-4">
          You may only search loads for carriers who have granted you MC# authority.
        </p>
        <select
          value={selectedCarrierId}
          onChange={(e) => {
            setSelectedCarrierId(e.target.value);
            setShowResults(false);
            setEquipmentFilter('all');
            setOriginFilter('');
          }}
          className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
        >
          <option value="">-- Choose a carrier --</option>
          {permissions.map(perm => {
            const cp = perm.carrier?.carrier_profiles?.[0];
            const name = perm.carrier?.company_name || `${perm.carrier?.first_name || ''} ${perm.carrier?.last_name || ''}`.trim();
            return (
              <option key={perm.carrier?.id} value={perm.carrier?.id || ''}>
                {name} {cp?.mc_number ? `(MC# ${cp.mc_number})` : ''}
              </option>
            );
          })}
        </select>
      </div>

      {/* Agent Authorization Banner */}
      {selectedCarrierId && selectedPermission && (
        <>
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2B4F7E] rounded-xl p-5 text-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <Shield className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">
                  Acting as Authorized Agent for {carrierName}
                </h4>
                <p className="text-blue-200 text-sm mt-1">
                  MC# {carrierMC} &bull; Authorized since {new Date(selectedPermission.granted_at).toLocaleDateString()}
                </p>
                <p className="text-blue-300 text-xs mt-2">
                  Loads displayed are exclusively for this carrier's authority. You may not use this MC# for any other carrier.
                </p>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Agent Authorization:</strong> You are only permitted to find and book loads for{' '}
                <strong>{carrierName} (MC# {carrierMC})</strong>. Using this MC# for unauthorized purposes
                may result in legal consequences under FMCSA regulations.
              </span>
            </div>
          </div>

          {/* Loadboard Access Portal */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-[#1E3A5F] flex items-center gap-2 mb-1">
                <Globe className="w-5 h-5" />
                Loadboard Access
              </h3>
              <p className="text-sm text-gray-500">
                Access your loadboard subscriptions to find loads for {carrierName} (MC# {carrierMC})
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              {/* DAT One */}
              <div className="border border-blue-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-blue-50/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
                    <span className="text-white font-bold text-xs">DAT</span>
                  </div>
                  <h4 className="font-semibold text-[#1E3A5F]">DAT One</h4>
                </div>
                <p className="text-xs text-gray-500 mb-3">Largest freight network in North America</p>
                <a
                  href="https://one.dat.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
                >
                  Open DAT One <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <p className="text-[10px] text-gray-400 mt-2 text-center">Log in with your existing subscription</p>
              </div>

              {/* Truckstop */}
              <div className="border border-green-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-green-50/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#16A34A] flex items-center justify-center">
                    <span className="text-white font-bold text-xs">TS</span>
                  </div>
                  <h4 className="font-semibold text-[#1E3A5F]">Truckstop</h4>
                </div>
                <p className="text-xs text-gray-500 mb-3">Real-time load matching and rate data</p>
                <a
                  href="https://main.truckstop.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#16A34A] text-white rounded-lg text-sm font-medium hover:bg-[#15803D] transition-colors"
                >
                  Open Truckstop <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <p className="text-[10px] text-gray-400 mt-2 text-center">Log in with your existing subscription</p>
              </div>

              {/* 123Loadboard */}
              <div className="border border-orange-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-orange-50/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#EA580C] flex items-center justify-center">
                    <span className="text-white font-bold text-xs">123</span>
                  </div>
                  <h4 className="font-semibold text-[#1E3A5F]">123Loadboard</h4>
                </div>
                <p className="text-xs text-gray-500 mb-3">Affordable load board with credit reports</p>
                <a
                  href="https://www.123loadboard.com/members/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#EA580C] text-white rounded-lg text-sm font-medium hover:bg-[#C2410C] transition-colors"
                >
                  Open 123Loadboard <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <p className="text-[10px] text-gray-400 mt-2 text-center">Log in with your existing subscription</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500">
                These links connect you to external loadboard services. You must have an active subscription
                with each service to access loads. Your browser's saved credentials will be used for login.
              </p>
            </div>
          </div>

          {/* Search Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-[#1E3A5F] mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Sample Loads Preview
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Type</label>
                <select
                  value={equipmentFilter}
                  onChange={(e) => setEquipmentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                >
                  <option value="all">All Authorized Equipment</option>
                  {(carrierEquipment.length > 0 ? carrierEquipment : ['Dry Van', 'Reefer', 'Flatbed']).map(eq => (
                    <option key={eq} value={eq}>{eq}</option>
                  ))}
                </select>
                {carrierEquipment.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Filtered to {carrierName}'s registered equipment
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin (City/State)</label>
                <input
                  type="text"
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value)}
                  placeholder="e.g. Atlanta, GA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="w-full px-4 py-2 bg-[#3B82F6] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {searching ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</>
                  ) : (
                    <><Search className="w-4 h-4" /> Search Loads</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Demo Data Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Sample Preview:</strong> These are sample loads demonstrating the carrier-specific pipeline.
                Use the loadboard links above to access real loads via your existing subscriptions, or visit{' '}
                <a href="https://carrierscout.vip" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                  CarrierScout.vip
                </a>{' '}for integrated loadboard access.
              </span>
            </div>
          </div>

          {/* Load Results */}
          {showResults && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#1E3A5F]">
                  {filteredLoads.length} Load{filteredLoads.length !== 1 ? 's' : ''} Available for {carrierName}
                </h3>
              </div>

              {filteredLoads.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No loads match your filters</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your equipment or origin filters</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLoads.map(load => (
                    <div key={load.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Route */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-green-500" />
                            <span className="font-semibold text-[#1E3A5F]">{load.origin}, {load.originState}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <MapPin className="w-4 h-4 text-red-500" />
                            <span className="font-semibold text-[#1E3A5F]">{load.destination}, {load.destinationState}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> {load.equipmentType}</span>
                            <span>&bull;</span>
                            <span>{load.distance} mi</span>
                            <span>&bull;</span>
                            <span>{load.weight}</span>
                            <span>&bull;</span>
                            <span>{load.commodity}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Pickup: {load.pickupDate}</span>
                            <span>Delivery: {load.deliveryDate}</span>
                            <span>&bull;</span>
                            <span>Broker: {load.broker}</span>
                          </div>
                        </div>

                        {/* Rate & Action */}
                        <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-xl font-bold text-green-600">
                              <DollarSign className="w-5 h-5" />
                              {load.rate.toLocaleString()}
                            </div>
                            <p className="text-xs text-gray-400">${load.ratePerMile.toFixed(2)}/mi</p>
                          </div>
                          <button
                            onClick={() => onNavigate('carrierscout')}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap"
                          >
                            Book Load
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CarrierScout upsell at bottom of results */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-5 text-white">
                <div className="flex items-center gap-4">
                  <Rocket className="w-8 h-8 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Unlock Real-Time Load Boards with CarrierScout</h4>
                    <p className="text-emerald-100 text-sm mt-1">
                      Get access to live loads, AI rate intelligence, and automated booking.
                      14-day free trial for dispatchers!
                    </p>
                  </div>
                  <a
                    href="https://carrierscout.vip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white text-emerald-700 rounded-lg font-medium text-sm hover:bg-emerald-50 transition-colors whitespace-nowrap flex items-center gap-2"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FindLoadsPanel;
