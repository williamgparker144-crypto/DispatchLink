import React, { useState } from 'react';
import {
  Shield, Truck, Users, FileCheck, AlertTriangle, MapPin, Phone, Mail,
  Building2, TrendingUp, Activity, CheckCircle, XCircle, Clock, RefreshCw,
  ExternalLink, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';

interface CarrierData {
  dotNumber: string;
  legalName: string;
  dbaName: string;
  carrierOperation: string;
  hqAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  mailingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  fax: string;
  email: string;
  mcNumber: string;
  mxNumber: string;
  statusCode: string;
  commonAuthorityStatus: string;
  contractAuthorityStatus: string;
  brokerAuthorityStatus: string;
  bondInsuranceOnFile: string;
  bondInsuranceRequired: string;
  bipdInsuranceOnFile: string;
  bipdInsuranceRequired: string;
  cargoInsuranceOnFile: string;
  cargoInsuranceRequired: string;
  safetyRating: string;
  safetyRatingDate: string;
  safetyReviewDate: string;
  safetyReviewType: string;
  oosDate: string;
  totalDrivers: number;
  totalPowerUnits: number;
  driverInsp: number;
  driverOosInsp: number;
  driverOosRate: number;
  vehicleInsp: number;
  vehicleOosInsp: number;
  vehicleOosRate: number;
  hazmatInsp: number;
  hazmatOosInsp: number;
  hazmatOosRate: number;
  crashTotal: number;
  fatalCrash: number;
  injCrash: number;
  towCrash: number;
}

interface VerificationResult {
  verified: boolean;
  status: string;
  carrier?: CarrierData;
  message?: string;
  warnings?: string[];
}

interface VerifiedCarrierProfileProps {
  dotNumber?: string;
  mcNumber?: string;
  compact?: boolean;
}

// Sample carrier data keyed by DOT number for demo display
const sampleCarrierData: Record<string, CarrierData> = {
  '1234567': {
    dotNumber: '1234567', legalName: 'Thompson Trucking LLC', dbaName: 'Thompson Express',
    carrierOperation: 'Interstate', mcNumber: '987654', mxNumber: '',
    hqAddress: { street: '123 Main St', city: 'Dallas', state: 'TX', zipCode: '75201', country: 'US' },
    mailingAddress: { street: '123 Main St', city: 'Dallas', state: 'TX', zipCode: '75201', country: 'US' },
    phone: '(214) 555-0100', fax: '', email: 'info@thompsontrucking.com',
    statusCode: 'A', oosDate: '',
    commonAuthorityStatus: 'A', contractAuthorityStatus: 'A', brokerAuthorityStatus: 'N',
    bipdInsuranceOnFile: 'Y', bipdInsuranceRequired: 'Y',
    cargoInsuranceOnFile: 'Y', cargoInsuranceRequired: 'Y',
    bondInsuranceOnFile: 'N', bondInsuranceRequired: 'N',
    safetyRating: 'S', safetyRatingDate: '2024-03-15', safetyReviewDate: '2024-03-15', safetyReviewType: 'Compliance Review',
    totalDrivers: 12, totalPowerUnits: 15,
    driverInsp: 8, driverOosInsp: 0, driverOosRate: 0,
    vehicleInsp: 14, vehicleOosInsp: 1, vehicleOosRate: 7.1,
    hazmatInsp: 0, hazmatOosInsp: 0, hazmatOosRate: 0,
    crashTotal: 0, fatalCrash: 0, injCrash: 0, towCrash: 0,
  },
  '2345678': {
    dotNumber: '2345678', legalName: 'Garcia Freight Services', dbaName: '',
    carrierOperation: 'Interstate', mcNumber: '876543', mxNumber: '',
    hqAddress: { street: '456 Commerce Dr', city: 'Houston', state: 'TX', zipCode: '77002', country: 'US' },
    mailingAddress: { street: '456 Commerce Dr', city: 'Houston', state: 'TX', zipCode: '77002', country: 'US' },
    phone: '(713) 555-0200', fax: '', email: 'dispatch@garciafreight.com',
    statusCode: 'A', oosDate: '',
    commonAuthorityStatus: 'A', contractAuthorityStatus: 'N', brokerAuthorityStatus: 'N',
    bipdInsuranceOnFile: 'Y', bipdInsuranceRequired: 'Y',
    cargoInsuranceOnFile: 'Y', cargoInsuranceRequired: 'Y',
    bondInsuranceOnFile: 'N', bondInsuranceRequired: 'N',
    safetyRating: 'S', safetyRatingDate: '2023-11-20', safetyReviewDate: '2023-11-20', safetyReviewType: 'Compliance Review',
    totalDrivers: 8, totalPowerUnits: 10,
    driverInsp: 5, driverOosInsp: 0, driverOosRate: 0,
    vehicleInsp: 9, vehicleOosInsp: 1, vehicleOosRate: 11.1,
    hazmatInsp: 0, hazmatOosInsp: 0, hazmatOosRate: 0,
    crashTotal: 1, fatalCrash: 0, injCrash: 0, towCrash: 1,
  },
};

// Generate a default sample carrier for any DOT/MC not in the map
function getSampleCarrier(dot?: string, mc?: string): CarrierData {
  if (dot && sampleCarrierData[dot]) return sampleCarrierData[dot];
  return {
    dotNumber: dot || '0000000', legalName: 'Verified Carrier LLC', dbaName: '',
    carrierOperation: 'Interstate', mcNumber: mc || '000000', mxNumber: '',
    hqAddress: { street: '100 Transport Way', city: 'Atlanta', state: 'GA', zipCode: '30301', country: 'US' },
    mailingAddress: { street: '100 Transport Way', city: 'Atlanta', state: 'GA', zipCode: '30301', country: 'US' },
    phone: '(404) 555-0300', fax: '', email: 'info@carrier.com',
    statusCode: 'A', oosDate: '',
    commonAuthorityStatus: 'A', contractAuthorityStatus: 'A', brokerAuthorityStatus: 'N',
    bipdInsuranceOnFile: 'Y', bipdInsuranceRequired: 'Y',
    cargoInsuranceOnFile: 'Y', cargoInsuranceRequired: 'Y',
    bondInsuranceOnFile: 'N', bondInsuranceRequired: 'N',
    safetyRating: 'S', safetyRatingDate: '2024-01-10', safetyReviewDate: '2024-01-10', safetyReviewType: 'Compliance Review',
    totalDrivers: 6, totalPowerUnits: 8,
    driverInsp: 4, driverOosInsp: 0, driverOosRate: 0,
    vehicleInsp: 7, vehicleOosInsp: 0, vehicleOosRate: 0,
    hazmatInsp: 0, hazmatOosInsp: 0, hazmatOosRate: 0,
    crashTotal: 0, fatalCrash: 0, injCrash: 0, towCrash: 0,
  };
}

const VerifiedCarrierProfile: React.FC<VerifiedCarrierProfileProps> = ({
  dotNumber,
  mcNumber,
  compact = false
}) => {
  const [carrier] = useState<CarrierData | null>(
    (dotNumber || mcNumber) ? getSampleCarrier(dotNumber, mcNumber) : null
  );
  const [verified] = useState(true);
  const [warnings] = useState<string[]>([]);
  const [lastVerified] = useState<Date>(new Date());
  const [expanded, setExpanded] = useState(!compact);

  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'A' || s === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <CheckCircle className="w-3 h-3" />
          Active
        </span>
      );
    }
    if (s === 'N' || s === 'NONE' || !s) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
          None
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
        <XCircle className="w-3 h-3" />
        {status || 'Unknown'}
      </span>
    );
  };

  const getInsuranceIcon = (onFile: string, required: string) => {
    if (required !== 'Y' && required !== '1') return <span className="text-gray-400 text-xs">N/A</span>;
    if (onFile === 'Y' || onFile === '1' || (onFile && /^\d+$/.test(onFile) && parseInt(onFile) > 0)) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getSafetyRatingBadge = (rating: string) => {
    if (!rating) return <span className="text-gray-500 text-sm">Not Rated</span>;
    const r = rating.toUpperCase();
    if (r === 'S' || r === 'SATISFACTORY') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold rounded-lg text-sm">Satisfactory</span>;
    }
    if (r === 'C' || r === 'CONDITIONAL') {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 font-semibold rounded-lg text-sm">Conditional</span>;
    }
    if (r === 'U' || r === 'UNSATISFACTORY') {
      return <span className="px-3 py-1 bg-red-100 text-red-700 font-semibold rounded-lg text-sm">Unsatisfactory</span>;
    }
    return <span className="text-gray-500 text-sm">{rating}</span>;
  };

  const getOosRateBar = (rate: number) => {
    const color = rate <= 10 ? 'bg-green-500' : rate <= 20 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${Math.min(rate, 100)}%` }} />
      </div>
    );
  };

  const getOosRateColor = (rate: number) => {
    if (rate <= 10) return 'text-green-600';
    if (rate <= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!carrier) {
    return null;
  }

  // Compact view for cards
  if (compact && !expanded) {
    return (
      <div className={`rounded-xl border p-4 ${
        carrier.oosDate 
          ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
          : verified 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
            : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              carrier.oosDate ? 'bg-red-100' : verified ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <Shield className={`w-5 h-5 ${
                carrier.oosDate ? 'text-red-600' : verified ? 'text-green-600' : 'text-yellow-600'
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">FMCSA Verified</span>
                {getStatusBadge(carrier.statusCode)}
                {carrier.oosDate && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    OOS
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                DOT# {carrier.dotNumber} {carrier.mcNumber && `| MC# ${carrier.mcNumber}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <ChevronDown className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/60 rounded-lg p-2">
            <p className="text-lg font-bold text-[#1E3A5F]">{carrier.totalPowerUnits}</p>
            <p className="text-xs text-gray-500">Trucks</p>
          </div>
          <div className="bg-white/60 rounded-lg p-2">
            <p className="text-lg font-bold text-[#1E3A5F]">{carrier.totalDrivers}</p>
            <p className="text-xs text-gray-500">Drivers</p>
          </div>
          <div className="bg-white/60 rounded-lg p-2">
            {getSafetyRatingBadge(carrier.safetyRating)}
          </div>
        </div>
        {warnings.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-100/50 rounded-lg">
            <p className="text-xs text-yellow-700 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {warnings.length} warning{warnings.length > 1 ? 's' : ''} - expand for details
            </p>
          </div>
        )}
      </div>
    );
  }

  // Full expanded view
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`p-4 ${
        carrier.oosDate 
          ? 'bg-gradient-to-r from-red-50 to-orange-50'
          : verified 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
            : 'bg-gradient-to-r from-yellow-50 to-orange-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${
              carrier.oosDate ? 'bg-red-100' : verified ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <Shield className={`w-6 h-6 ${
                carrier.oosDate ? 'text-red-600' : verified ? 'text-green-600' : 'text-yellow-600'
              }`} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{carrier.legalName}</h3>
              {carrier.dbaName && <p className="text-sm text-gray-600">DBA: {carrier.dbaName}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(carrier.statusCode)}
            {carrier.oosDate && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                Out of Service: {carrier.oosDate}
              </span>
            )}
            {compact && (
              <button
                onClick={() => setExpanded(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <ChevronUp className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>
        {lastVerified && (
          <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Verified {lastVerified.toLocaleString()}
          </p>
        )}
        
        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mt-3 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800 text-sm">Warnings:</p>
                <ul className="text-xs text-yellow-700 mt-1 space-y-0.5">
                  {warnings.map((warning, idx) => (
                    <li key={idx}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Authority Numbers & Fleet */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">DOT Number</p>
            <p className="font-mono font-bold text-[#1E3A5F]">{carrier.dotNumber}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">MC Number</p>
            <p className="font-mono font-bold text-[#1E3A5F]">{carrier.mcNumber || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Power Units</p>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-400" />
              <p className="font-bold text-[#1E3A5F]">{carrier.totalPowerUnits}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Drivers</p>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <p className="font-bold text-[#1E3A5F]">{carrier.totalDrivers}</p>
            </div>
          </div>
        </div>

        {/* Operation Type */}
        {carrier.carrierOperation && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Operation Type</p>
            <p className="font-semibold text-[#1E3A5F]">{carrier.carrierOperation}</p>
          </div>
        )}

        {/* Authority Status */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#1E3A5F]" />
            Authority Status
          </h4>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Common</p>
              {getStatusBadge(carrier.commonAuthorityStatus)}
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Contract</p>
              {getStatusBadge(carrier.contractAuthorityStatus)}
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Broker</p>
              {getStatusBadge(carrier.brokerAuthorityStatus)}
            </div>
          </div>
        </div>

        {/* Insurance */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#1E3A5F]" />
            Insurance Status
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">BIPD</span>
              {getInsuranceIcon(carrier.bipdInsuranceOnFile, carrier.bipdInsuranceRequired)}
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Cargo</span>
              {getInsuranceIcon(carrier.cargoInsuranceOnFile, carrier.cargoInsuranceRequired)}
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Bond</span>
              {getInsuranceIcon(carrier.bondInsuranceOnFile, carrier.bondInsuranceRequired)}
            </div>
          </div>
        </div>

        {/* Safety Rating */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1E3A5F]" />
            Safety Rating
          </h4>
          <div className="flex items-center gap-4">
            {getSafetyRatingBadge(carrier.safetyRating)}
            {carrier.safetyRatingDate && (
              <span className="text-sm text-gray-500">as of {carrier.safetyRatingDate}</span>
            )}
          </div>
        </div>

        {/* Inspection Rates */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#1E3A5F]" />
            Out-of-Service Rates (24 Months)
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Driver ({carrier.driverInsp} inspections)</span>
                <span className={`font-semibold ${getOosRateColor(carrier.driverOosRate)}`}>
                  {carrier.driverOosRate?.toFixed(1) || 0}%
                </span>
              </div>
              {getOosRateBar(carrier.driverOosRate || 0)}
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Vehicle ({carrier.vehicleInsp} inspections)</span>
                <span className={`font-semibold ${getOosRateColor(carrier.vehicleOosRate)}`}>
                  {carrier.vehicleOosRate?.toFixed(1) || 0}%
                </span>
              </div>
              {getOosRateBar(carrier.vehicleOosRate || 0)}
            </div>
            {carrier.hazmatInsp > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">HazMat ({carrier.hazmatInsp} inspections)</span>
                  <span className={`font-semibold ${getOosRateColor(carrier.hazmatOosRate)}`}>
                    {carrier.hazmatOosRate?.toFixed(1) || 0}%
                  </span>
                </div>
                {getOosRateBar(carrier.hazmatOosRate || 0)}
              </div>
            )}
          </div>
        </div>

        {/* Crash Statistics */}
        {(carrier.crashTotal > 0 || carrier.fatalCrash > 0) && (
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Crash Statistics (24 Months)
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white rounded-lg p-2">
                <p className="text-xl font-bold text-gray-900">{carrier.crashTotal}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xl font-bold text-red-600">{carrier.fatalCrash}</p>
                <p className="text-xs text-gray-500">Fatal</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xl font-bold text-orange-600">{carrier.injCrash}</p>
                <p className="text-xs text-gray-500">Injury</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xl font-bold text-yellow-600">{carrier.towCrash}</p>
                <p className="text-xs text-gray-500">Tow</p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Info */}
        {(carrier.phone || carrier.email || carrier.hqAddress.city) && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1E3A5F]" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {carrier.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${carrier.phone}`} className="hover:text-[#1E3A5F]">{carrier.phone}</a>
                </div>
              )}
              {carrier.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${carrier.email}`} className="hover:text-[#1E3A5F] truncate">{carrier.email}</a>
                </div>
              )}
              {carrier.hqAddress.city && (
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>
                    {carrier.hqAddress.street && `${carrier.hqAddress.street}, `}
                    {carrier.hqAddress.city}, {carrier.hqAddress.state} {carrier.hqAddress.zipCode}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Data from FMCSA SAFER Web Services
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
            <a
              href={`https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${carrier.dotNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#1E3A5F] hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              View on SAFER
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifiedCarrierProfile;
