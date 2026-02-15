import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import CarrierCounterOfferModal from './CarrierCounterOfferModal';
import {
  Search, Filter, MapPin, Truck, Calendar, DollarSign, Package,
  ArrowRight, Clock, AlertTriangle, Snowflake, Users, ChevronRight,
  Bell, CheckCircle, XCircle, MessageSquare, Star, RefreshCw,
  Loader2, Heart, Send, Eye, TrendingUp, Navigation, X
} from 'lucide-react';

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
  special_instructions?: string;
}

interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  priority: string;
  is_read: boolean;
  created_at?: string;
  load?: Load;
  negotiation?: any;
}

interface CarrierNegotiation {
  id: string;
  load_id: string;
  original_rate: number;
  current_offer_amount: number;
  current_offer_by: string;
  status: string;
  dispatcher_name?: string;
  dispatcher_message?: string;
  created_at: string;
  load?: Load;
}

// Demo carrier info - in production this would come from auth context
const demoCarrier = {
  id: 'carrier-demo-1',
  legal_name: 'Demo Transport LLC',
  mc_number: '123456',
  dot_number: '7890123',
  equipment_types: ['Dry Van', 'Reefer'],
  preferred_lanes: [
    { origin_state: 'IL', destination_state: 'TX' },
    { origin_state: 'CA', destination_state: 'AZ' },
  ],
  rating: 4.7
};

const equipmentTypes = [
  'Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Tanker', 
  'Lowboy', 'Double Drop', 'Conestoga', 'Power Only'
];

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function CarrierLoadSearch() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [negotiations, setNegotiations] = useState<CarrierNegotiation[]>([]);
  const [savedLoads, setSavedLoads] = useState<Set<string>>(new Set());
  const [interestedLoads, setInterestedLoads] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('search');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [showLoadDetail, setShowLoadDetail] = useState(false);
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [originStateFilter, setOriginStateFilter] = useState<string>('all');
  const [destStateFilter, setDestStateFilter] = useState<string>('all');
  const [minRate, setMinRate] = useState('');
  const [maxMiles, setMaxMiles] = useState('');
  const [showHazmat, setShowHazmat] = useState(true);
  const [showTeamRequired, setShowTeamRequired] = useState(true);
  const [sortBy, setSortBy] = useState('pickup_date');

  useEffect(() => {
    fetchLoads();
    fetchNotifications();
    fetchNegotiations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [loads, searchQuery, equipmentFilter, originStateFilter, destStateFilter, minRate, maxMiles, showHazmat, showTeamRequired, sortBy]);

  const fetchLoads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('load-matching', {
        body: { action: 'get_loads', status: 'available' }
      });
      if (error) throw error;
      setLoads(data.loads || []);
    } catch (err) {
      console.error('Error fetching loads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('load-matching', {
        body: { action: 'get_carrier_notifications', carrier_id: demoCarrier.id }
      });
      if (error) throw error;
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const fetchNegotiations = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('load-matching', {
        body: { action: 'get_carrier_negotiations', carrier_id: demoCarrier.id }
      });
      if (error) throw error;
      setNegotiations(data.negotiations || []);
    } catch (err) {
      console.error('Error fetching negotiations:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...loads];

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(load =>
        load.origin_city.toLowerCase().includes(query) ||
        load.destination_city.toLowerCase().includes(query) ||
        load.commodity.toLowerCase().includes(query) ||
        load.reference_number.toLowerCase().includes(query)
      );
    }

    // Equipment type
    if (equipmentFilter && equipmentFilter !== 'all') {
      filtered = filtered.filter(load => load.equipment_type === equipmentFilter);
    }

    // Origin state
    if (originStateFilter && originStateFilter !== 'all') {
      filtered = filtered.filter(load => load.origin_state === originStateFilter);
    }

    // Destination state
    if (destStateFilter && destStateFilter !== 'all') {
      filtered = filtered.filter(load => load.destination_state === destStateFilter);
    }

    // Min rate
    if (minRate) {
      filtered = filtered.filter(load => load.rate_amount >= parseFloat(minRate));
    }

    // Max miles
    if (maxMiles) {
      filtered = filtered.filter(load => load.miles <= parseFloat(maxMiles));
    }

    // Hazmat filter
    if (!showHazmat) {
      filtered = filtered.filter(load => !load.hazmat);
    }

    // Team required filter
    if (!showTeamRequired) {
      filtered = filtered.filter(load => !load.team_required);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rate_high':
          return b.rate_amount - a.rate_amount;
        case 'rate_low':
          return a.rate_amount - b.rate_amount;
        case 'miles_short':
          return a.miles - b.miles;
        case 'miles_long':
          return b.miles - a.miles;
        case 'pickup_date':
        default:
          return new Date(a.pickup_date).getTime() - new Date(b.pickup_date).getTime();
      }
    });

    setFilteredLoads(filtered);
  };

  const handleExpressInterest = async (load: Load) => {
    try {
      const { data, error } = await supabase.functions.invoke('load-matching', {
        body: {
          action: 'carrier_express_interest',
          load_id: load.id,
          carrier_id: demoCarrier.id,
          carrier_name: demoCarrier.legal_name,
          carrier_mc_number: demoCarrier.mc_number,
          carrier_dot_number: demoCarrier.dot_number
        }
      });
      if (error) throw error;
      setInterestedLoads(prev => new Set([...prev, load.id]));
    } catch (err) {
      console.error('Error expressing interest:', err);
    }
  };

  const handleSaveLoad = (loadId: string) => {
    setSavedLoads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(loadId)) {
        newSet.delete(loadId);
      } else {
        newSet.add(loadId);
      }
      return newSet;
    });
  };

  const handleViewDetails = (load: Load) => {
    setSelectedLoad(load);
    setShowLoadDetail(true);
  };

  const handleCounterOffer = (load: Load) => {
    setSelectedLoad(load);
    setShowCounterOffer(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setEquipmentFilter('all');
    setOriginStateFilter('all');
    setDestStateFilter('all');
    setMinRate('');
    setMaxMiles('');
    setShowHazmat(true);
    setShowTeamRequired(true);
    setSortBy('pickup_date');
  };

  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  const getEquipmentColor = (type: string) => {
    const colors: Record<string, string> = {
      'Dry Van': 'bg-blue-100 text-blue-800',
      'Reefer': 'bg-cyan-100 text-cyan-800',
      'Flatbed': 'bg-amber-100 text-amber-800',
      'Step Deck': 'bg-orange-100 text-orange-800',
      'Tanker': 'bg-purple-100 text-purple-800',
      'Lowboy': 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const renderLoadCard = (load: Load) => {
    const isSaved = savedLoads.has(load.id);
    const isInterested = interestedLoads.has(load.id);
    const isPreferredLane = demoCarrier.preferred_lanes.some(
      lane => lane.origin_state === load.origin_state && lane.destination_state === load.destination_state
    );
    const isPreferredEquipment = demoCarrier.equipment_types.includes(load.equipment_type);

    return (
      <Card key={load.id} className={`hover:shadow-lg transition-all ${isPreferredLane ? 'ring-2 ring-green-500' : ''}`}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge className={getEquipmentColor(load.equipment_type)}>
                {load.equipment_type}
              </Badge>
              {isPreferredLane && (
                <Badge className="bg-green-100 text-green-800">
                  <Star className="h-3 w-3 mr-1" />
                  Preferred Lane
                </Badge>
              )}
              {load.hazmat && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Hazmat
                </Badge>
              )}
              {load.team_required && (
                <Badge variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  Team
                </Badge>
              )}
            </div>
            <button
              onClick={() => handleSaveLoad(load.id)}
              className={`p-1.5 rounded-full transition-colors ${isSaved ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
            >
              <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Route */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="font-semibold">{load.origin_city}, {load.origin_state}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-red-600" />
              <span className="font-semibold">{load.destination_city}, {load.destination_state}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-4 gap-3 mb-4 text-sm">
            <div>
              <p className="text-gray-500">Miles</p>
              <p className="font-semibold">{load.miles.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Weight</p>
              <p className="font-semibold">{(load.weight_lbs / 1000).toFixed(0)}k lbs</p>
            </div>
            <div>
              <p className="text-gray-500">Pickup</p>
              <p className="font-semibold">{new Date(load.pickup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-gray-500">Commodity</p>
              <p className="font-semibold truncate" title={load.commodity}>{load.commodity}</p>
            </div>
          </div>

          {/* Rate */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-4">
            <div>
              <p className="text-sm text-gray-500">Posted Rate</p>
              <p className="text-2xl font-bold text-green-600">${load.rate_amount.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Rate/Mile</p>
              <p className="text-lg font-semibold">${load.rate_per_mile.toFixed(2)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleViewDetails(load)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Details
            </Button>
            {isInterested ? (
              <Button size="sm" className="flex-1 bg-green-600" disabled>
                <CheckCircle className="h-4 w-4 mr-1" />
                Interested
              </Button>
            ) : (
              <Button
                size="sm"
                className="flex-1 bg-[#1a365d] hover:bg-[#2d4a6f]"
                onClick={() => handleExpressInterest(load)}
              >
                <Send className="h-4 w-4 mr-1" />
                Express Interest
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => handleCounterOffer(load)}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Counter
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a365d] text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Find Loads</h1>
              <p className="text-blue-200 mt-1">Browse available loads matching your equipment and lanes</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 rounded-lg hover:bg-[#2d4a6f] transition-colors"
              >
                <Bell className="h-6 w-6" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <div className="text-right">
                <p className="font-medium">{demoCarrier.legal_name}</p>
                <p className="text-sm text-blue-200">MC# {demoCarrier.mc_number}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Loads
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Saved ({savedLoads.size})
            </TabsTrigger>
            <TabsTrigger value="interested" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              My Interest ({interestedLoads.size})
            </TabsTrigger>
            <TabsTrigger value="negotiations" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Negotiations ({negotiations.length})
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search">
            {/* Search Bar & Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search by city, commodity, or reference..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Quick Filters */}
                <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Truck className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Equipment</SelectItem>
                    {equipmentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={originStateFilter} onValueChange={setOriginStateFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Origin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Origins</SelectItem>
                    {usStates.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={destStateFilter} onValueChange={setDestStateFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Destinations</SelectItem>
                    {usStates.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-blue-50 border-blue-300' : ''}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>

                <Button variant="ghost" onClick={fetchLoads}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div>
                      <Label className="text-sm">Min Rate ($)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={minRate}
                        onChange={(e) => setMinRate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Max Miles</Label>
                      <Input
                        type="number"
                        placeholder="Any"
                        value={maxMiles}
                        onChange={(e) => setMaxMiles(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Sort By</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pickup_date">Pickup Date</SelectItem>
                          <SelectItem value="rate_high">Highest Rate</SelectItem>
                          <SelectItem value="rate_low">Lowest Rate</SelectItem>
                          <SelectItem value="miles_short">Shortest Trip</SelectItem>
                          <SelectItem value="miles_long">Longest Trip</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="showHazmat"
                          checked={showHazmat}
                          onCheckedChange={(checked) => setShowHazmat(checked as boolean)}
                        />
                        <Label htmlFor="showHazmat" className="text-sm">Hazmat</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="showTeam"
                          checked={showTeamRequired}
                          onCheckedChange={(checked) => setShowTeamRequired(checked as boolean)}
                        />
                        <Label htmlFor="showTeam" className="text-sm">Team</Label>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button variant="ghost" onClick={clearFilters} className="text-sm">
                        Clear All
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredLoads.length}</span> available loads
              </p>
              {demoCarrier.preferred_lanes.length > 0 && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Loads matching your preferred lanes are highlighted
                </p>
              )}
            </div>

            {/* Load Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#1a365d]" />
              </div>
            ) : filteredLoads.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No loads found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLoads.map(load => renderLoadCard(load))}
              </div>
            )}
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved">
            {savedLoads.size === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No saved loads</h3>
                <p className="text-gray-500 mt-1">Save loads you're interested in to review later</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loads.filter(l => savedLoads.has(l.id)).map(load => renderLoadCard(load))}
              </div>
            )}
          </TabsContent>

          {/* Interested Tab */}
          <TabsContent value="interested">
            {interestedLoads.size === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Send className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No interest expressed</h3>
                <p className="text-gray-500 mt-1">Express interest in loads to let dispatchers know you're available</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loads.filter(l => interestedLoads.has(l.id)).map(load => renderLoadCard(load))}
              </div>
            )}
          </TabsContent>

          {/* Negotiations Tab */}
          <TabsContent value="negotiations">
            {negotiations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No active negotiations</h3>
                <p className="text-gray-500 mt-1">Submit counter-offers on loads to start negotiating rates</p>
              </div>
            ) : (
              <div className="space-y-4">
                {negotiations.map(neg => (
                  <Card key={neg.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={
                              neg.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              neg.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {neg.status.charAt(0).toUpperCase() + neg.status.slice(1)}
                            </Badge>
                            <span className="text-sm text-gray-500">Load #{neg.load_id.slice(-6)}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Original Rate</p>
                              <p className="font-semibold">${neg.original_rate.toLocaleString()}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Current Offer</p>
                              <p className="font-semibold text-green-600">${neg.current_offer_amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Last Action By</p>
                              <p className="font-semibold capitalize">{neg.current_offer_by}</p>
                            </div>
                          </div>
                        </div>
                        {neg.status === 'pending' && neg.current_offer_by === 'dispatcher' && (
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button size="sm" variant="outline">
                              Counter
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Load Detail Modal */}
      <Dialog open={showLoadDetail} onOpenChange={setShowLoadDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Details</DialogTitle>
            <DialogDescription>
              {selectedLoad?.reference_number}
            </DialogDescription>
          </DialogHeader>
          {selectedLoad && (
            <div className="space-y-4">
              {/* Route */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Origin</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <span className="text-lg font-semibold">{selectedLoad.origin_city}, {selectedLoad.origin_state}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {new Date(selectedLoad.pickup_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-center px-4">
                    <div className="text-sm text-gray-500">{selectedLoad.miles} mi</div>
                    <div className="w-16 h-0.5 bg-gray-300 my-2"></div>
                    <Navigation className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm text-gray-500 mb-1">Destination</p>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-lg font-semibold">{selectedLoad.destination_city}, {selectedLoad.destination_state}</span>
                      <MapPin className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {new Date(selectedLoad.delivery_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border rounded-lg p-3">
                  <p className="text-sm text-gray-500">Equipment</p>
                  <p className="font-semibold">{selectedLoad.equipment_type}</p>
                </div>
                <div className="bg-white border rounded-lg p-3">
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-semibold">{selectedLoad.weight_lbs.toLocaleString()} lbs</p>
                </div>
                <div className="bg-white border rounded-lg p-3">
                  <p className="text-sm text-gray-500">Commodity</p>
                  <p className="font-semibold">{selectedLoad.commodity}</p>
                </div>
                <div className="bg-white border rounded-lg p-3">
                  <p className="text-sm text-gray-500">Special Requirements</p>
                  <div className="flex gap-1 mt-1">
                    {selectedLoad.hazmat && <Badge variant="destructive" className="text-xs">Hazmat</Badge>}
                    {selectedLoad.team_required && <Badge variant="secondary" className="text-xs">Team</Badge>}
                    {!selectedLoad.hazmat && !selectedLoad.team_required && <span className="text-sm text-gray-400">None</span>}
                  </div>
                </div>
              </div>

              {/* Rate */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Posted Rate</p>
                    <p className="text-3xl font-bold text-green-700">${selectedLoad.rate_amount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600">Rate per Mile</p>
                    <p className="text-xl font-semibold text-green-700">${selectedLoad.rate_per_mile.toFixed(2)}/mi</p>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedLoad.special_instructions && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-800 mb-1">Special Instructions</p>
                  <p className="text-sm text-yellow-700">{selectedLoad.special_instructions}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowLoadDetail(false)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-[#1a365d] hover:bg-[#2d4a6f]"
                  onClick={() => {
                    handleExpressInterest(selectedLoad);
                    setShowLoadDetail(false);
                  }}
                  disabled={interestedLoads.has(selectedLoad.id)}
                >
                  {interestedLoads.has(selectedLoad.id) ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Interest Expressed
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Express Interest
                    </>
                  )}
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setShowLoadDetail(false);
                    handleCounterOffer(selectedLoad);
                  }}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Submit Counter-Offer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Counter Offer Modal */}
      <CarrierCounterOfferModal
        isOpen={showCounterOffer}
        onClose={() => setShowCounterOffer(false)}
        load={selectedLoad}
        carrier={demoCarrier}
        onSuccess={() => {
          fetchNegotiations();
          setShowCounterOffer(false);
        }}
      />

      {/* Notifications Panel */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${notification.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      notification.notification_type === 'load_match' ? 'bg-green-100 text-green-600' :
                      notification.notification_type === 'booking_confirmed' ? 'bg-blue-100 text-blue-600' :
                      notification.notification_type === 'negotiation_response' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {notification.notification_type === 'load_match' && <TrendingUp className="h-4 w-4" />}
                      {notification.notification_type === 'booking_confirmed' && <CheckCircle className="h-4 w-4" />}
                      {notification.notification_type === 'negotiation_response' && <MessageSquare className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      {notification.load && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-[#1a365d]"
                          onClick={() => {
                            setSelectedLoad(notification.load!);
                            setShowNotifications(false);
                            setShowLoadDetail(true);
                          }}
                        >
                          View Load <ChevronRight className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
