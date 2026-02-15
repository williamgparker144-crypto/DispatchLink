import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { 
  DollarSign, MapPin, Truck, Calendar, Package, 
  ArrowRight, Send, Loader2, TrendingUp, TrendingDown, Info
} from 'lucide-react';

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
  weight_lbs: number;
  commodity: string;
  pickup_date: string;
  delivery_date: string;
  hazmat: boolean;
  team_required: boolean;
}

interface CarrierInfo {
  id: string;
  legal_name: string;
  mc_number: string;
  dot_number: string;
  equipment_type?: string;
  rating?: number;
}

interface CarrierCounterOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  load: Load | null;
  carrier: CarrierInfo;
  onSuccess?: () => void;
}

export default function CarrierCounterOfferModal({ 
  isOpen, 
  onClose, 
  load,
  carrier,
  onSuccess
}: CarrierCounterOfferModalProps) {
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!load || !offerAmount) return;

    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid offer amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('load-matching', {
        body: {
          action: 'submit_counter_offer',
          load_id: load.id,
          carrier_id: carrier.id,
          carrier_name: carrier.legal_name,
          carrier_mc_number: carrier.mc_number,
          carrier_dot_number: carrier.dot_number,
          equipment_type: carrier.equipment_type || load.equipment_type,
          carrier_rating: carrier.rating,
          offer_amount: amount,
          original_rate: load.rate_amount,
          miles: load.miles,
          message
        }
      });

      if (error) throw error;

      setSubmitted(true);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error submitting counter-offer:', err);
      alert('Failed to submit counter-offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOfferAmount('');
    setMessage('');
    setSubmitted(false);
    onClose();
  };

  const calculateRatePerMile = (amount: string) => {
    if (!load || !amount) return null;
    const parsed = parseFloat(amount);
    if (isNaN(parsed)) return null;
    return (parsed / load.miles).toFixed(2);
  };

  const getOfferDiff = () => {
    if (!load || !offerAmount) return null;
    const amount = parseFloat(offerAmount);
    if (isNaN(amount)) return null;
    const diff = amount - load.rate_amount;
    const percent = ((diff / load.rate_amount) * 100).toFixed(1);
    return { diff, percent };
  };

  if (!load) return null;

  const ratePerMile = calculateRatePerMile(offerAmount);
  const offerDiff = getOfferDiff();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Submit Counter-Offer
          </DialogTitle>
          <DialogDescription>
            Negotiate the rate for this load
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Counter-Offer Submitted!</h3>
            <p className="text-gray-600">
              Your offer of <span className="font-bold text-green-600">${parseFloat(offerAmount).toLocaleString()}</span> has been sent to the dispatcher.
            </p>
            <p className="text-sm text-gray-500 mt-2">You'll be notified when they respond.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Load Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Package className="h-4 w-4" />
                <span>{load.reference_number}</span>
                <Badge variant="outline" className="ml-auto">{load.equipment_type}</Badge>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-green-600" />
                <span>{load.origin_city}, {load.origin_state}</span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <MapPin className="h-4 w-4 text-red-600" />
                <span>{load.destination_city}, {load.destination_state}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>{load.miles} miles</span>
                <span>{load.weight_lbs?.toLocaleString()} lbs</span>
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(load.pickup_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Posted Rate */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Posted Rate</p>
                  <p className="text-2xl font-bold text-blue-700">${load.rate_amount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">Rate per Mile</p>
                  <p className="text-lg font-semibold text-blue-700">${load.rate_per_mile}/mi</p>
                </div>
              </div>
            </div>

            {/* Counter-Offer Input */}
            <div>
              <Label htmlFor="offerAmount" className="text-sm font-medium">Your Counter-Offer</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="offerAmount"
                  type="number"
                  placeholder="Enter your rate"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="pl-10 text-lg font-semibold"
                />
              </div>
              
              {/* Rate Analysis */}
              {offerAmount && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {ratePerMile && `$${ratePerMile}/mi`}
                  </span>
                  {offerDiff && (
                    <span className={`flex items-center ${offerDiff.diff > 0 ? 'text-green-600' : offerDiff.diff < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {offerDiff.diff > 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 mr-1" />
                          +${offerDiff.diff.toLocaleString()} ({offerDiff.percent}%)
                        </>
                      ) : offerDiff.diff < 0 ? (
                        <>
                          <TrendingDown className="h-4 w-4 mr-1" />
                          -${Math.abs(offerDiff.diff).toLocaleString()} ({Math.abs(parseFloat(offerDiff.percent))}%)
                        </>
                      ) : (
                        'Same as posted rate'
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message" className="text-sm font-medium">Message to Dispatcher (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Explain why you're requesting this rate, mention your experience with this lane, availability, etc."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Tips for successful negotiations:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    <li>Explain your value (experience, equipment quality, on-time record)</li>
                    <li>Mention if you have backhaul opportunities</li>
                    <li>Be reasonable - offers within 10-15% are more likely to be accepted</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!offerAmount || isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Offer
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
