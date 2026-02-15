import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import LoadPostingForm from './LoadPostingForm';
import RateNegotiationModal from './RateNegotiationModal';
import CarrierCounterOfferModal from './CarrierCounterOfferModal';
import { 
  Truck, MapPin, Calendar, DollarSign, Package, Search, Filter, 
  Plus, Eye, Users, Clock, ArrowRight, RefreshCw, Loader2,
  CheckCircle, AlertCircle, Phone, Mail, MessageSquare, TrendingUp,
  Bell, HandshakeIcon
} from 'lucide-react';

const EQUIPMENT_TYPES = [
  'All', 'Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Lowboy', 
  'Tanker', 'Hopper', 'Car Hauler', 'Conestoga', 'Power Only'
];

const US_STATES = [
  { code: 'all', name: 'All States' },
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];


interface Load {
  id: string;
  reference_number: string;
  status: string;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
  equipment_type: string;
  weight_lbs: number;
  commodity: string;
  hazmat: boolean;
  team_required: boolean;
  pickup_date: string;
  delivery_date: string;
  rate_amount: number;
  rate_per_mile: number;
  miles: number;
  special_instructions: string;
  created_at: string;
  assigned_carrier?: {
    id: string;
    legal_name: string;
    dot_number: string;
  };
}

interface CarrierMatch {
  id: string;
  match_score: number;
  equipment_match: boolean;
  location_match: boolean;
  availability_match: boolean;
  distance_from_origin_miles: number;
  status: string;
  carrier: {
    id: string;
    legal_name: string;
    dot_number: string;
    mc_number: string;
    physical_city: string;
    physical_state: string;
    phone: string;
    email: string;
  };
}

interface Negotiation {
  id: string;
  load_id: string;
  carrier_name: string;
  current_offer_amount: number;
  original_rate: number;
  status: string;
}

// Demo carrier for counter-offer testing
const DEMO_CARRIER = {
  id: 'demo-carrier-1',
  legal_name: 'Your Trucking Company',
  mc_number: '123456',
  dot_number: '7890123',
  equipment_type: 'Dry Van',
  rating: 4.7
};

export default function LoadboardSection() {
  const [activeTab, setActiveTab] = useState('available');
  const [loads, setLoads] = useState<Load[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [loadMatches, setLoadMatches] = useState<CarrierMatch[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  
  // Negotiation state
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [negotiationLoad, setNegotiationLoad] = useState<Load | null>(null);
  const [pendingNegotiationsCount, setPendingNegotiationsCount] = useState(0);
  
  // Carrier counter-offer state
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [counterOfferLoad, setCounterOfferLoad] = useState<Load | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('All');
  const [originStateFilter, setOriginStateFilter] = useState('all');
  const [destStateFilter, setDestStateFilter] = useState('all');


  useEffect(() => {
    fetchLoads();
    fetchPendingNegotiationsCount();
  }, [activeTab]);

  const fetchLoads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('load-matching', {
        body: {
          action: 'get_loads',
          status: activeTab === 'available' ? 'available' : undefined,
          limit: 50
        }
      });

      if (error) throw error;
      setLoads(data.loads || []);
    } catch (err) {
      console.error('Error fetching loads:', err);
      // Use demo data if API fails
      setLoads(generateDemoLoads());
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingNegotiationsCount = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('load-matching', {
        body: { action: 'get_all_negotiations' }
      });
      if (!error && data) {
        setPendingNegotiationsCount(data.pending_count || 0);
      }
    } catch (err) {
      console.error('Error fetching negotiations count:', err);
    }
  };

  const generateDemoLoads = (): Load[] => {
    const routes = [
      { origin: { city: 'Chicago', state: 'IL' }, dest: { city: 'Dallas', state: 'TX' }, miles: 920 },
      { origin: { city: 'Los Angeles', state: 'CA' }, dest: { city: 'Phoenix', state: 'AZ' }, miles: 370 },
      { origin: { city: 'Atlanta', state: 'GA' }, dest: { city: 'Miami', state: 'FL' }, miles: 660 },
      { origin: { city: 'Seattle', state: 'WA' }, dest: { city: 'Denver', state: 'CO' }, miles: 1320 },
      { origin: { city: 'New York', state: 'NY' }, dest: { city: 'Boston', state: 'MA' }, miles: 215 },
      { origin: { city: 'Houston', state: 'TX' }, dest: { city: 'Nashville', state: 'TN' }, miles: 790 },
      { origin: { city: 'Detroit', state: 'MI' }, dest: { city: 'Indianapolis', state: 'IN' }, miles: 280 },
      { origin: { city: 'Phoenix', state: 'AZ' }, dest: { city: 'Las Vegas', state: 'NV' }, miles: 300 },
      { origin: { city: 'Minneapolis', state: 'MN' }, dest: { city: 'Kansas City', state: 'MO' }, miles: 440 },
      { origin: { city: 'Portland', state: 'OR' }, dest: { city: 'Sacramento', state: 'CA' }, miles: 580 },
      { origin: { city: 'Memphis', state: 'TN' }, dest: { city: 'St. Louis', state: 'MO' }, miles: 285 },
      { origin: { city: 'Charlotte', state: 'NC' }, dest: { city: 'Richmond', state: 'VA' }, miles: 295 },
    ];

    const equipment = ['Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Tanker'];
    const commodities = ['General Freight', 'Electronics', 'Food Products', 'Building Materials', 'Auto Parts', 'Machinery'];

    return routes.map((route, idx) => {
      const eq = equipment[idx % equipment.length];
      const ratePerMile = 2.20 + Math.random() * 1.30;
      const rate = Math.round(route.miles * ratePerMile);
      const pickupDate = new Date();
      pickupDate.setDate(pickupDate.getDate() + Math.floor(Math.random() * 7) + 1);
      const deliveryDate = new Date(pickupDate);
      deliveryDate.setDate(deliveryDate.getDate() + Math.ceil(route.miles / 500));

      return {
        id: `load-${idx + 1}`,
        reference_number: `DL-${Date.now().toString(36).toUpperCase()}-${idx}`,
        status: 'available',
        origin_city: route.origin.city,
        origin_state: route.origin.state,
        destination_city: route.dest.city,
        destination_state: route.dest.state,
        equipment_type: eq,
        weight_lbs: 30000 + Math.floor(Math.random() * 15000),
        commodity: commodities[idx % commodities.length],
        hazmat: idx === 4,
        team_required: route.miles > 1000,
        pickup_date: pickupDate.toISOString().split('T')[0],
        delivery_date: deliveryDate.toISOString().split('T')[0],
        rate_amount: rate,
        rate_per_mile: parseFloat(ratePerMile.toFixed(2)),
        miles: route.miles,
        special_instructions: '',
        created_at: new Date().toISOString()
      };
    });
  };

  const fetchLoadMatches = async (loadId: string) => {
    setIsLoadingMatches(true);
    try {
      const { data, error } = await supabase.functions.invoke('load-matching', {
        body: {
          action: 'get_load_matches',
          load_id: loadId
        }
      });

      if (error) throw error;
      setLoadMatches(data.matches || []);
    } catch (err) {
      console.error('Error fetching matches:', err);
      // Demo matches
      setLoadMatches([
        {
          id: '1',
          match_score: 92,
          equipment_match: true,
          location_match: true,
          availability_match: true,
          distance_from_origin_miles: 45,
          status: 'pending',
          carrier: {
            id: 'c1',
            legal_name: 'Swift Transport LLC',
            dot_number: '1234567',
            mc_number: '987654',
            physical_city: 'Chicago',
            physical_state: 'IL',
            phone: '(312) 555-0123',
            email: 'dispatch@swifttransport.com'
          }
        },
        {
          id: '2',
          match_score: 85,
          equipment_match: true,
          location_match: true,
          availability_match: false,
          distance_from_origin_miles: 120,
          status: 'interested',
          carrier: {
            id: 'c2',
            legal_name: 'Midwest Haulers Inc',
            dot_number: '2345678',
            mc_number: '876543',
            physical_city: 'Milwaukee',
            physical_state: 'WI',
            phone: '(414) 555-0456',
            email: 'loads@midwesthaulers.com'
          }
        },
        {
          id: '3',
          match_score: 78,
          equipment_match: true,
          location_match: false,
          availability_match: true,
          distance_from_origin_miles: 210,
          status: 'pending',
          carrier: {
            id: 'c3',
            legal_name: 'Great Lakes Freight',
            dot_number: '3456789',
            mc_number: '765432',
            physical_city: 'Detroit',
            physical_state: 'MI',
            phone: '(313) 555-0789',
            email: 'dispatch@greatlakesfreight.com'
          }
        }
      ]);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleViewLoad = (load: Load) => {
    setSelectedLoad(load);
    fetchLoadMatches(load.id);
  };

  const handleOpenNegotiations = (load: Load) => {
    setNegotiationLoad(load);
    setShowNegotiationModal(true);
  };

  const handleOpenCounterOffer = (load: Load) => {
    setCounterOfferLoad(load);
    setShowCounterOfferModal(true);
  };

  const handleBookCarrier = async (carrierId: string) => {
    if (!selectedLoad) return;
    
    try {
      await supabase.functions.invoke('load-matching', {
        body: {
          action: 'book_load',
          load_id: selectedLoad.id,
          carrier_id: carrierId
        }
      });
      
      // Refresh loads
      fetchLoads();
      setSelectedLoad(null);
    } catch (err) {
      console.error('Error booking carrier:', err);
    }
  };

  const filteredLoads = loads.filter(load => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!load.reference_number.toLowerCase().includes(search) &&
          !load.origin_city.toLowerCase().includes(search) &&
          !load.destination_city.toLowerCase().includes(search) &&
          !load.commodity?.toLowerCase().includes(search)) {
        return false;
      }
    }
    if (equipmentFilter !== 'All' && load.equipment_type !== equipmentFilter) return false;
    if (originStateFilter && originStateFilter !== 'all' && load.origin_state !== originStateFilter) return false;
    if (destStateFilter && destStateFilter !== 'all' && load.destination_state !== destStateFilter) return false;
    return true;
  });


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'booked': return 'bg-blue-100 text-blue-700';
      case 'in_transit': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (showPostForm) {
    return (
      <div className="p-6">
        <LoadPostingForm
          onSuccess={() => {
            setShowPostForm(false);
            fetchLoads();
          }}
          onCancel={() => setShowPostForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Load Board</h1>
          <p className="text-gray-600">Post loads and match with verified carriers</p>
        </div>
        <div className="flex gap-3">
          {/* Negotiations Button with Badge */}
          <Button 
            variant="outline" 
            onClick={() => {
              // Open negotiations for first available load or show all
              if (loads.length > 0) {
                handleOpenNegotiations(loads[0]);
              }
            }}
            className="relative"
          >
            <HandshakeIcon className="h-4 w-4 mr-2" />
            Negotiations
            {pendingNegotiationsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingNegotiationsCount}
              </span>
            )}
          </Button>
          <Button onClick={() => setShowPostForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Post New Load
          </Button>
        </div>
      </div>

      {/* Pending Negotiations Alert */}
      {pendingNegotiationsCount > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Bell className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-yellow-800">
                    You have {pendingNegotiationsCount} pending counter-offer{pendingNegotiationsCount > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-yellow-600">Carriers are waiting for your response</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-yellow-400 text-yellow-700 hover:bg-yellow-100"
                onClick={() => loads.length > 0 && handleOpenNegotiations(loads[0])}
              >
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by reference, city, commodity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Equipment" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={originStateFilter} onValueChange={setOriginStateFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Origin" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(s => (
                  <SelectItem key={s.code} value={s.code}>{s.code === 'all' ? 'All' : s.code} - {s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={destStateFilter} onValueChange={setDestStateFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Destination" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(s => (
                  <SelectItem key={`dest-${s.code}`} value={s.code}>{s.code === 'all' ? 'All' : s.code} - {s.name}</SelectItem>
                ))}
              </SelectContent>

            </Select>
            <Button variant="outline" onClick={fetchLoads}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="available">Available Loads</TabsTrigger>
          <TabsTrigger value="my_loads">My Posted Loads</TabsTrigger>
          <TabsTrigger value="booked">Booked Loads</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredLoads.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No loads found matching your criteria</p>
                <Button className="mt-4" onClick={() => setShowPostForm(true)}>
                  Post a Load
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredLoads.map((load) => (
                <Card key={load.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Route */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(load.status)}>
                            {load.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-500">{load.reference_number}</span>
                          {load.hazmat && (
                            <Badge variant="destructive" className="text-xs">HAZMAT</Badge>
                          )}
                          {load.team_required && (
                            <Badge variant="outline" className="text-xs">Team</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-lg font-semibold">
                          <MapPin className="h-4 w-4 text-green-600" />
                          <span>{load.origin_city}, {load.origin_state}</span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <MapPin className="h-4 w-4 text-red-600" />
                          <span>{load.destination_city}, {load.destination_state}</span>
                        </div>
                        {load.commodity && (
                          <p className="text-sm text-gray-500 mt-1">{load.commodity}</p>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-4 lg:gap-6">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 uppercase">Equipment</p>
                          <p className="font-medium flex items-center gap-1">
                            <Truck className="h-4 w-4 text-gray-400" />
                            {load.equipment_type}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 uppercase">Miles</p>
                          <p className="font-medium">{load.miles?.toLocaleString() || '-'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 uppercase">Weight</p>
                          <p className="font-medium">{load.weight_lbs?.toLocaleString() || '-'} lbs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 uppercase">Pickup</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(load.pickup_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 uppercase">Rate</p>
                          <p className="font-bold text-green-600 text-lg">
                            ${load.rate_amount?.toLocaleString()}
                          </p>
                          {load.rate_per_mile && (
                            <p className="text-xs text-gray-500">${load.rate_per_mile}/mi</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewLoad(load)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {load.status === 'available' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleOpenNegotiations(load)}>
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Offers
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleOpenCounterOffer(load)}>
                              <DollarSign className="h-4 w-4 mr-1" />
                              Counter
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Load Detail Modal */}
      <Dialog open={!!selectedLoad} onOpenChange={() => setSelectedLoad(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedLoad && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Load Details - {selectedLoad.reference_number}
                </DialogTitle>
                <DialogDescription>
                  {selectedLoad.origin_city}, {selectedLoad.origin_state} to {selectedLoad.destination_city}, {selectedLoad.destination_state}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Load Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Equipment</p>
                    <p className="font-semibold">{selectedLoad.equipment_type}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Miles</p>
                    <p className="font-semibold">{selectedLoad.miles?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Weight</p>
                    <p className="font-semibold">{selectedLoad.weight_lbs?.toLocaleString()} lbs</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600">Rate</p>
                    <p className="font-bold text-green-700">${selectedLoad.rate_amount?.toLocaleString()}</p>
                    {selectedLoad.rate_per_mile && (
                      <p className="text-xs text-green-600">${selectedLoad.rate_per_mile}/mi</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Pickup Date</p>
                    <p className="font-semibold">{new Date(selectedLoad.pickup_date).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Delivery Date</p>
                    <p className="font-semibold">{new Date(selectedLoad.delivery_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedLoad.special_instructions && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-xs text-yellow-700 font-medium">Special Instructions</p>
                    <p className="text-sm">{selectedLoad.special_instructions}</p>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedLoad(null);
                      handleOpenNegotiations(selectedLoad);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View Counter-Offers
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setSelectedLoad(null);
                      handleOpenCounterOffer(selectedLoad);
                    }}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Submit Counter-Offer
                  </Button>
                </div>

                {/* Carrier Matches */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Matched Carriers
                  </h3>

                  {isLoadingMatches ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : loadMatches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No carrier matches found yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {loadMatches.map((match) => (
                        <Card key={match.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{match.carrier.legal_name}</h4>
                                  <Badge variant={match.match_score >= 80 ? 'default' : 'secondary'}>
                                    {match.match_score}% Match
                                  </Badge>
                                  {match.status === 'interested' && (
                                    <Badge className="bg-green-100 text-green-700">Interested</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">
                                  DOT: {match.carrier.dot_number} | MC: {match.carrier.mc_number}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {match.carrier.physical_city}, {match.carrier.physical_state} • {match.distance_from_origin_miles} mi from origin
                                </p>
                                <div className="flex gap-2 mt-2">
                                  {match.equipment_match && (
                                    <Badge variant="outline" className="text-xs">
                                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                      Equipment
                                    </Badge>
                                  )}
                                  {match.location_match && (
                                    <Badge variant="outline" className="text-xs">
                                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                      Location
                                    </Badge>
                                  )}
                                  {match.availability_match && (
                                    <Badge variant="outline" className="text-xs">
                                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                      Available
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button size="sm" variant="outline" asChild>
                                  <a href={`tel:${match.carrier.phone}`}>
                                    <Phone className="h-4 w-4 mr-1" />
                                    Call
                                  </a>
                                </Button>
                                <Button size="sm" onClick={() => handleBookCarrier(match.carrier.id)}>
                                  Book
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Rate Negotiation Modal (Dispatcher View) */}
      <RateNegotiationModal
        isOpen={showNegotiationModal}
        onClose={() => {
          setShowNegotiationModal(false);
          setNegotiationLoad(null);
          fetchPendingNegotiationsCount();
        }}
        load={negotiationLoad}
        onNegotiationComplete={() => {
          fetchLoads();
          fetchPendingNegotiationsCount();
        }}
      />

      {/* Carrier Counter-Offer Modal */}
      <CarrierCounterOfferModal
        isOpen={showCounterOfferModal}
        onClose={() => {
          setShowCounterOfferModal(false);
          setCounterOfferLoad(null);
        }}
        load={counterOfferLoad}
        carrier={DEMO_CARRIER}
        onSuccess={() => {
          fetchPendingNegotiationsCount();
        }}
      />
    </div>
  );
}
