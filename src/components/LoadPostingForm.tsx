import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Truck, MapPin, Calendar, DollarSign, Package, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const US_STATES = [
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

const EQUIPMENT_TYPES = [
  'Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Lowboy', 
  'Tanker', 'Hopper', 'Car Hauler', 'Conestoga', 'Power Only'
];

interface LoadPostingFormProps {
  dispatcherId?: string;
  onSuccess?: (load: any, matches: any[]) => void;
  onCancel?: () => void;
}

export default function LoadPostingForm({ dispatcherId, onSuccess, onCancel }: LoadPostingFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ load: any; matches: any[] } | null>(null);

  const [formData, setFormData] = useState({
    // Origin
    origin_city: '',
    origin_state: '',
    origin_zip: '',
    origin_address: '',
    // Destination
    destination_city: '',
    destination_state: '',
    destination_zip: '',
    destination_address: '',
    // Equipment & Cargo
    equipment_type: 'Dry Van',
    weight_lbs: '',
    length_ft: '',
    commodity: '',
    hazmat: false,
    team_required: false,
    // Dates
    pickup_date: '',
    pickup_time_start: '',
    pickup_time_end: '',
    delivery_date: '',
    delivery_time_start: '',
    delivery_time_end: '',
    // Rates
    rate_amount: '',
    rate_type: 'flat',
    miles: '',
    // Additional
    special_instructions: '',
    load_requirements: [] as string[]
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleRequirement = (req: string) => {
    setFormData(prev => ({
      ...prev,
      load_requirements: prev.load_requirements.includes(req)
        ? prev.load_requirements.filter(r => r !== req)
        : [...prev.load_requirements, req]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('load-matching', {
        body: {
          action: 'post_load',
          dispatcher_id: dispatcherId || 'demo-dispatcher',
          ...formData,
          weight_lbs: formData.weight_lbs ? parseInt(formData.weight_lbs) : null,
          length_ft: formData.length_ft ? parseInt(formData.length_ft) : null,
          rate_amount: parseFloat(formData.rate_amount),
          miles: formData.miles ? parseInt(formData.miles) : null
        }
      });

      if (fnError) throw fnError;
      if (!data.success) throw new Error(data.error || 'Failed to post load');

      setResult({ load: data.load, matches: data.matches || [] });
      setStep(4);
      
      if (onSuccess) {
        onSuccess(data.load, data.matches || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to post load');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateRatePerMile = () => {
    if (formData.rate_amount && formData.miles) {
      return (parseFloat(formData.rate_amount) / parseInt(formData.miles)).toFixed(2);
    }
    return null;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-blue-600 mb-4">
        <MapPin className="h-5 w-5" />
        <h3 className="font-semibold">Origin & Destination</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Origin */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              Pickup Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City *</Label>
                <Input
                  value={formData.origin_city}
                  onChange={(e) => updateField('origin_city', e.target.value)}
                  placeholder="Chicago"
                />
              </div>
              <div>
                <Label>State *</Label>
                <Select value={formData.origin_state} onValueChange={(v) => updateField('origin_state', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(s => (
                      <SelectItem key={s.code} value={s.code}>{s.code} - {s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>ZIP Code</Label>
              <Input
                value={formData.origin_zip}
                onChange={(e) => updateField('origin_zip', e.target.value)}
                placeholder="60601"
              />
            </div>
            <div>
              <Label>Address (Optional)</Label>
              <Input
                value={formData.origin_address}
                onChange={(e) => updateField('origin_address', e.target.value)}
                placeholder="123 Warehouse Dr"
              />
            </div>
          </CardContent>
        </Card>

        {/* Destination */}
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-red-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              Delivery Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City *</Label>
                <Input
                  value={formData.destination_city}
                  onChange={(e) => updateField('destination_city', e.target.value)}
                  placeholder="Dallas"
                />
              </div>
              <div>
                <Label>State *</Label>
                <Select value={formData.destination_state} onValueChange={(v) => updateField('destination_state', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(s => (
                      <SelectItem key={s.code} value={s.code}>{s.code} - {s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>ZIP Code</Label>
              <Input
                value={formData.destination_zip}
                onChange={(e) => updateField('destination_zip', e.target.value)}
                placeholder="75201"
              />
            </div>
            <div>
              <Label>Address (Optional)</Label>
              <Input
                value={formData.destination_address}
                onChange={(e) => updateField('destination_address', e.target.value)}
                placeholder="456 Distribution Center"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-blue-600 mb-4">
        <Truck className="h-5 w-5" />
        <h3 className="font-semibold">Equipment & Cargo Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>Equipment Type *</Label>
            <Select value={formData.equipment_type} onValueChange={(v) => updateField('equipment_type', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Weight (lbs)</Label>
              <Input
                type="number"
                value={formData.weight_lbs}
                onChange={(e) => updateField('weight_lbs', e.target.value)}
                placeholder="42000"
              />
            </div>
            <div>
              <Label>Length (ft)</Label>
              <Input
                type="number"
                value={formData.length_ft}
                onChange={(e) => updateField('length_ft', e.target.value)}
                placeholder="48"
              />
            </div>
          </div>

          <div>
            <Label>Commodity</Label>
            <Input
              value={formData.commodity}
              onChange={(e) => updateField('commodity', e.target.value)}
              placeholder="General freight, electronics, etc."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hazmat"
                checked={formData.hazmat}
                onCheckedChange={(checked) => updateField('hazmat', checked)}
              />
              <Label htmlFor="hazmat" className="flex items-center gap-1 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                Hazmat
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="team"
                checked={formData.team_required}
                onCheckedChange={(checked) => updateField('team_required', checked)}
              />
              <Label htmlFor="team">Team Required</Label>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Load Requirements</Label>
            <div className="flex flex-wrap gap-2">
              {['Tarps', 'Straps', 'Chains', 'Pallet Jack', 'Liftgate', 'Driver Assist', 'TWIC Card', 'E-Track'].map(req => (
                <Badge
                  key={req}
                  variant={formData.load_requirements.includes(req) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleRequirement(req)}
                >
                  {req}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dates */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Calendar className="h-5 w-5" />
            <h3 className="font-semibold">Schedule</h3>
          </div>

          <Card>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label>Pickup Date *</Label>
                <Input
                  type="date"
                  value={formData.pickup_date}
                  onChange={(e) => updateField('pickup_date', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Time From</Label>
                  <Input
                    type="time"
                    value={formData.pickup_time_start}
                    onChange={(e) => updateField('pickup_time_start', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Time To</Label>
                  <Input
                    type="time"
                    value={formData.pickup_time_end}
                    onChange={(e) => updateField('pickup_time_end', e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <Label>Delivery Date *</Label>
                <Input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => updateField('delivery_date', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Time From</Label>
                  <Input
                    type="time"
                    value={formData.delivery_time_start}
                    onChange={(e) => updateField('delivery_time_start', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Time To</Label>
                  <Input
                    type="time"
                    value={formData.delivery_time_end}
                    onChange={(e) => updateField('delivery_time_end', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rate */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <DollarSign className="h-5 w-5" />
            <h3 className="font-semibold">Rate & Distance</h3>
          </div>

          <Card>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label>Rate Type</Label>
                <Select value={formData.rate_type} onValueChange={(v) => updateField('rate_type', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat Rate</SelectItem>
                    <SelectItem value="per_mile">Per Mile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Rate Amount ($) *</Label>
                <Input
                  type="number"
                  value={formData.rate_amount}
                  onChange={(e) => updateField('rate_amount', e.target.value)}
                  placeholder="2500.00"
                />
              </div>

              <div>
                <Label>Total Miles</Label>
                <Input
                  type="number"
                  value={formData.miles}
                  onChange={(e) => updateField('miles', e.target.value)}
                  placeholder="850"
                />
              </div>

              {calculateRatePerMile() && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-700">
                    Rate per mile: <span className="font-bold">${calculateRatePerMile()}/mi</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <Label>Special Instructions</Label>
            <Textarea
              value={formData.special_instructions}
              onChange={(e) => updateField('special_instructions', e.target.value)}
              placeholder="Any special requirements, dock hours, contact info..."
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900">Load Posted Successfully!</h3>
        <p className="text-gray-600 mt-1">Reference: {result?.load?.reference_number}</p>
      </div>

      <Card className="text-left">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Route</p>
              <p className="font-medium">
                {result?.load?.origin_city}, {result?.load?.origin_state} → {result?.load?.destination_city}, {result?.load?.destination_state}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Equipment</p>
              <p className="font-medium">{result?.load?.equipment_type}</p>
            </div>
            <div>
              <p className="text-gray-500">Rate</p>
              <p className="font-medium text-green-600">${result?.load?.rate_amount}</p>
            </div>
            <div>
              <p className="text-gray-500">Pickup Date</p>
              <p className="font-medium">{result?.load?.pickup_date}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {result?.matches && result.matches.length > 0 && (
        <Card className="text-left border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700">
              {result.matches.length} Carrier Matches Found!
            </CardTitle>
            <CardDescription>
              Carriers have been notified based on equipment, location, and availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.matches.slice(0, 5).map((match: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{match.carrier?.legal_name || 'Carrier'}</p>
                    <p className="text-xs text-gray-500">
                      {match.carrier?.physical_city}, {match.carrier?.physical_state}
                    </p>
                  </div>
                  <Badge variant={match.score >= 80 ? 'default' : 'secondary'}>
                    {match.score}% Match
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={() => {
          setStep(1);
          setResult(null);
          setFormData({
            origin_city: '', origin_state: '', origin_zip: '', origin_address: '',
            destination_city: '', destination_state: '', destination_zip: '', destination_address: '',
            equipment_type: 'Dry Van', weight_lbs: '', length_ft: '', commodity: '',
            hazmat: false, team_required: false,
            pickup_date: '', pickup_time_start: '', pickup_time_end: '',
            delivery_date: '', delivery_time_start: '', delivery_time_end: '',
            rate_amount: '', rate_type: 'flat', miles: '',
            special_instructions: '', load_requirements: []
          });
        }}>
          Post Another Load
        </Button>
        <Button onClick={onCancel}>
          View All Loads
        </Button>
      </div>
    </div>
  );

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.origin_city && formData.origin_state && 
               formData.destination_city && formData.destination_state;
      case 2:
        return formData.equipment_type;
      case 3:
        return formData.pickup_date && formData.delivery_date && formData.rate_amount;
      default:
        return true;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Post a New Load
        </CardTitle>
        <CardDescription>
          Create a load posting and automatically match with verified carriers
        </CardDescription>

        {step < 4 && (
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {step < 4 && (
          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => step > 1 ? setStep(step - 1) : onCancel?.()}
            >
              {step > 1 ? 'Back' : 'Cancel'}
            </Button>
            
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Continue
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting Load...
                  </>
                ) : (
                  'Post Load & Find Carriers'
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
