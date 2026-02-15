import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { 
  DollarSign, MessageSquare, Clock, CheckCircle, XCircle, 
  ArrowRight, ArrowDown, User, Truck, Star, Loader2,
  TrendingUp, TrendingDown, Minus, RefreshCw, Send
} from 'lucide-react';

interface Negotiation {
  id: string;
  load_id: string;
  carrier_id: string;
  original_rate: number;
  current_offer_amount: number;
  current_offer_by: 'carrier' | 'dispatcher';
  current_offer_at: string;
  agreed_rate: number | null;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  carrier_name: string;
  carrier_mc_number: string;
  carrier_dot_number: string;
  carrier_equipment_type: string;
  carrier_rating: number;
  carrier_message: string | null;
  dispatcher_message: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

interface NegotiationHistoryItem {
  id: string;
  negotiation_id: string;
  offer_amount: number;
  offered_by: 'carrier' | 'dispatcher';
  offer_type: 'initial' | 'counter' | 'accept' | 'reject';
  message: string | null;
  rate_per_mile: number | null;
  created_at: string;
}

interface Load {
  id: string;
  reference_number: string;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
  rate_amount: number;
  rate_per_mile: number;
  miles: number;
  equipment_type: string;
}

interface RateNegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  load: Load | null;
  onNegotiationComplete?: (negotiation: Negotiation) => void;
}

export default function RateNegotiationModal({ 
  isOpen, 
  onClose, 
  load,
  onNegotiationComplete 
}: RateNegotiationModalProps) {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null);
  const [history, setHistory] = useState<NegotiationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Response form state
  const [responseType, setResponseType] = useState<'accept' | 'reject' | 'counter' | null>(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    if (isOpen && load) {
      fetchNegotiations();
    }
  }, [isOpen, load]);

  useEffect(() => {
    if (selectedNegotiation) {
      fetchHistory(selectedNegotiation.id);
    }
  }, [selectedNegotiation]);

  const fetchNegotiations = async () => {
    if (!load) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('load-matching', {
        body: { action: 'get_negotiations', load_id: load.id }
      });
      if (error) throw error;
      setNegotiations(data.negotiations || []);
    } catch (err) {
      console.error('Error fetching negotiations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async (negotiationId: string) => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase.functions.invoke('load-matching', {
        body: { action: 'get_negotiation_history', negotiation_id: negotiationId }
      });
      if (error) throw error;
      setHistory(data.history || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedNegotiation || !responseType) return;
    
    if (responseType === 'counter' && !counterAmount) {
      alert('Please enter a counter amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('load-matching', {
        body: {
          action: 'respond_to_offer',
          negotiation_id: selectedNegotiation.id,
          response_type: responseType,
          counter_amount: responseType === 'counter' ? parseFloat(counterAmount) : undefined,
          message: responseMessage,
          miles: load?.miles
        }
      });

      if (error) throw error;

      // Refresh negotiations
      await fetchNegotiations();
      
      // Reset form
      setResponseType(null);
      setCounterAmount('');
      setResponseMessage('');
      setSelectedNegotiation(null);

      if (data.load_status === 'booked' && onNegotiationComplete) {
        onNegotiationComplete(data.negotiation);
      }

      alert(data.message || 'Response sent successfully');
    } catch (err) {
      console.error('Error responding to offer:', err);
      alert('Failed to send response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-700">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-700">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOfferTrend = (current: number, original: number) => {
    const diff = current - original;
    const percent = ((diff / original) * 100).toFixed(1);
    if (diff > 0) {
      return (
        <span className="flex items-center text-red-600 text-sm">
          <TrendingUp className="h-4 w-4 mr-1" />
          +${diff.toLocaleString()} ({percent}%)
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="flex items-center text-green-600 text-sm">
          <TrendingDown className="h-4 w-4 mr-1" />
          -${Math.abs(diff).toLocaleString()} ({Math.abs(parseFloat(percent))}%)
        </span>
      );
    }
    return (
      <span className="flex items-center text-gray-600 text-sm">
        <Minus className="h-4 w-4 mr-1" />
        No change
      </span>
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const pendingNegotiations = negotiations.filter(n => n.status === 'pending');
  const completedNegotiations = negotiations.filter(n => n.status !== 'pending');

  if (!load) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Rate Negotiations - {load.reference_number}
          </DialogTitle>
          <DialogDescription>
            {load.origin_city}, {load.origin_state} → {load.destination_city}, {load.destination_state} | 
            Posted Rate: ${load.rate_amount.toLocaleString()} (${load.rate_per_mile}/mi)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-4">
          {/* Negotiations List */}
          <div className="w-1/2 flex flex-col overflow-hidden border-r pr-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Counter-Offers</h3>
              <Button variant="ghost" size="sm" onClick={fetchNegotiations}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending" className="text-xs">
                  Pending ({pendingNegotiations.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">
                  Completed ({completedNegotiations.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="flex-1 overflow-y-auto mt-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : pendingNegotiations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No pending counter-offers</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingNegotiations.map((neg) => (
                      <Card 
                        key={neg.id} 
                        className={`cursor-pointer transition-all ${
                          selectedNegotiation?.id === neg.id 
                            ? 'ring-2 ring-blue-500 bg-blue-50' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedNegotiation(neg)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{neg.carrier_name}</span>
                                {neg.carrier_rating && (
                                  <span className="flex items-center text-xs text-yellow-600">
                                    <Star className="h-3 w-3 mr-0.5 fill-yellow-400" />
                                    {neg.carrier_rating}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">MC: {neg.carrier_mc_number}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">${neg.current_offer_amount.toLocaleString()}</p>
                              {getOfferTrend(neg.current_offer_amount, neg.original_rate)}
                            </div>
                          </div>
                          {neg.carrier_message && (
                            <p className="text-xs text-gray-600 mt-2 line-clamp-2 bg-gray-100 p-2 rounded">
                              "{neg.carrier_message}"
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(neg.current_offer_at)}
                            </span>
                            {neg.current_offer_by === 'carrier' && (
                              <Badge variant="outline" className="text-xs">Awaiting Response</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="flex-1 overflow-y-auto mt-2">
                {completedNegotiations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No completed negotiations</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {completedNegotiations.map((neg) => (
                      <Card 
                        key={neg.id} 
                        className={`cursor-pointer transition-all ${
                          selectedNegotiation?.id === neg.id 
                            ? 'ring-2 ring-blue-500' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedNegotiation(neg)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-medium text-sm">{neg.carrier_name}</span>
                              <p className="text-xs text-gray-500">MC: {neg.carrier_mc_number}</p>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(neg.status)}
                              {neg.agreed_rate && (
                                <p className="font-bold text-green-600 mt-1">
                                  ${neg.agreed_rate.toLocaleString()}
                                </p>
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
          </div>

          {/* Negotiation Detail & Response */}
          <div className="w-1/2 flex flex-col overflow-hidden">
            {selectedNegotiation ? (
              <>
                {/* History Timeline */}
                <div className="flex-1 overflow-y-auto mb-4">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Negotiation History
                  </h3>
                  
                  {isLoadingHistory ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item, idx) => (
                        <div 
                          key={item.id} 
                          className={`flex ${item.offered_by === 'dispatcher' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[85%] rounded-lg p-3 ${
                              item.offered_by === 'dispatcher' 
                                ? 'bg-blue-100 text-blue-900' 
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">
                                {item.offered_by === 'dispatcher' ? 'You' : selectedNegotiation.carrier_name}
                              </span>
                              {item.offer_type === 'accept' && (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              )}
                              {item.offer_type === 'reject' && (
                                <XCircle className="h-3 w-3 text-red-600" />
                              )}
                            </div>
                            <p className="font-bold text-lg">${item.offer_amount.toLocaleString()}</p>
                            {item.rate_per_mile && (
                              <p className="text-xs opacity-75">${item.rate_per_mile}/mi</p>
                            )}
                            {item.message && (
                              <p className="text-sm mt-2 opacity-90">"{item.message}"</p>
                            )}
                            <p className="text-xs opacity-60 mt-2">{formatTime(item.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Response Form */}
                {selectedNegotiation.status === 'pending' && selectedNegotiation.current_offer_by === 'carrier' && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-3">Respond to Offer</h4>
                    
                    <div className="flex gap-2 mb-3">
                      <Button
                        size="sm"
                        variant={responseType === 'accept' ? 'default' : 'outline'}
                        className={responseType === 'accept' ? 'bg-green-600 hover:bg-green-700' : ''}
                        onClick={() => setResponseType('accept')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant={responseType === 'counter' ? 'default' : 'outline'}
                        className={responseType === 'counter' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                        onClick={() => setResponseType('counter')}
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Counter
                      </Button>
                      <Button
                        size="sm"
                        variant={responseType === 'reject' ? 'default' : 'outline'}
                        className={responseType === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
                        onClick={() => setResponseType('reject')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>

                    {responseType === 'counter' && (
                      <div className="mb-3">
                        <label className="text-xs text-gray-600 mb-1 block">Your Counter Offer ($)</label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={counterAmount}
                          onChange={(e) => setCounterAmount(e.target.value)}
                          className="mb-1"
                        />
                        {counterAmount && load.miles && (
                          <p className="text-xs text-gray-500">
                            ${(parseFloat(counterAmount) / load.miles).toFixed(2)}/mi
                          </p>
                        )}
                      </div>
                    )}

                    {responseType && (
                      <>
                        <Textarea
                          placeholder="Add a message (optional)"
                          value={responseMessage}
                          onChange={(e) => setResponseMessage(e.target.value)}
                          rows={2}
                          className="mb-3"
                        />
                        <Button 
                          className="w-full" 
                          onClick={handleRespond}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          {responseType === 'accept' ? 'Accept & Book' : 
                           responseType === 'reject' ? 'Reject Offer' : 'Send Counter'}
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {selectedNegotiation.status === 'accepted' && (
                  <div className="border-t pt-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-700">Rate Agreed!</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        ${selectedNegotiation.agreed_rate?.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Load booked with {selectedNegotiation.carrier_name}
                      </p>
                    </div>
                  </div>
                )}

                {selectedNegotiation.status === 'rejected' && (
                  <div className="border-t pt-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <p className="font-semibold text-red-700">Negotiation Rejected</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a negotiation to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
