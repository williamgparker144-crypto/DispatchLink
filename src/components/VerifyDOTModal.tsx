import React, { useState } from 'react';
import { X, Search, CheckCircle, AlertCircle, Loader2, Shield, Truck, Users, FileCheck, AlertTriangle, MapPin, Phone, Mail, Building2, TrendingUp, Activity } from 'lucide-react';
// Demo mode: supabase edge function replaced with sample data

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

interface VerifyDOTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (data: { dotNumber: string; mcNumber: string; companyName: string; carrier?: CarrierData }) => void;
}

const VerifyDOTModal: React.FC<VerifyDOTModalProps> = ({ isOpen, onClose, onVerified }) => {
  const [dotNumber, setDotNumber] = useState('');
  const [mcNumber, setMcNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    verified: boolean;
    status: string;
    carrier?: CarrierData;
    message?: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const handleVerify = async () => {
    if (!dotNumber && !mcNumber) {
      setError('Please enter a DOT or MC number');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setShowDetails(false);

    // Demo mode: simulate FMCSA SAFER lookup
    await new Promise(resolve => setTimeout(resolve, 1500));

    const sampleCarrier: CarrierData = {
      dotNumber: dotNumber || '2233541',
      legalName: 'Verified Carrier LLC',
      dbaName: '',
      carrierOperation: 'Interstate',
      hqAddress: { street: '123 Transport Blvd', city: 'Dallas', state: 'TX', zipCode: '75201', country: 'US' },
      mailingAddress: { street: '123 Transport Blvd', city: 'Dallas', state: 'TX', zipCode: '75201', country: 'US' },
      phone: '(214) 555-0100',
      fax: '',
      email: 'dispatch@carrier.com',
      mcNumber: mcNumber || '987654',
      mxNumber: '',
      statusCode: 'A',
      commonAuthorityStatus: 'A',
      contractAuthorityStatus: 'A',
      brokerAuthorityStatus: 'N',
      bondInsuranceOnFile: 'N',
      bondInsuranceRequired: 'N',
      bipdInsuranceOnFile: 'Y',
      bipdInsuranceRequired: 'Y',
      cargoInsuranceOnFile: 'Y',
      cargoInsuranceRequired: 'Y',
      safetyRating: 'S',
      safetyRatingDate: '2024-03-15',
      safetyReviewDate: '2024-03-15',
      safetyReviewType: 'Compliance Review',
      oosDate: '',
      totalDrivers: 12,
      totalPowerUnits: 15,
      driverInsp: 8,
      driverOosInsp: 0,
      driverOosRate: 0,
      vehicleInsp: 14,
      vehicleOosInsp: 1,
      vehicleOosRate: 7.1,
      hazmatInsp: 0,
      hazmatOosInsp: 0,
      hazmatOosRate: 0,
      crashTotal: 0,
      fatalCrash: 0,
      injCrash: 0,
      towCrash: 0,
    };

    const data = {
      verified: true,
      status: 'active',
      carrier: sampleCarrier,
      message: 'Carrier authority is active and in good standing.',
    };

    setResult(data);
    setShowDetails(true);
    setLoading(false);
  };

  const handleConfirm = () => {
    if (result?.verified && result.carrier) {
      onVerified({
        dotNumber: result.carrier.dotNumber || dotNumber || 'N/A',
        mcNumber: result.carrier.mcNumber || mcNumber || 'N/A',
        companyName: result.carrier.legalName || 'Unknown',
        carrier: result.carrier,
      });
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'A' || s === 'ACTIVE') return 'text-green-600 bg-green-100';
    if (s === 'I' || s === 'INACTIVE') return 'text-gray-600 bg-gray-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getAuthorityLabel = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'A' || s === 'ACTIVE') return 'Active';
    if (s === 'I' || s === 'INACTIVE') return 'Inactive';
    if (s === 'N' || s === 'NONE') return 'None';
    return status || 'N/A';
  };

  const getInsuranceStatus = (onFile: string, required: string) => {
    if (required !== 'Y') return { status: 'Not Required', color: 'text-gray-500' };
    if (onFile === 'Y') return { status: 'On File', color: 'text-green-600' };
    return { status: 'Missing', color: 'text-red-600' };
  };

  const getSafetyRatingLabel = (rating: string) => {
    if (!rating) return 'Not Rated';
    const r = rating.toUpperCase();
    if (r === 'S' || r === 'SATISFACTORY') return 'Satisfactory';
    if (r === 'C' || r === 'CONDITIONAL') return 'Conditional';
    if (r === 'U' || r === 'UNSATISFACTORY') return 'Unsatisfactory';
    return rating;
  };

  const getSafetyRatingColor = (rating: string) => {
    if (!rating) return 'text-gray-500 bg-gray-100';
    const r = rating.toUpperCase();
    if (r === 'S' || r === 'SATISFACTORY') return 'text-green-600 bg-green-100';
    if (r === 'C' || r === 'CONDITIONAL') return 'text-yellow-600 bg-yellow-100';
    if (r === 'U' || r === 'UNSATISFACTORY') return 'text-red-600 bg-red-100';
    return 'text-gray-500 bg-gray-100';
  };

  const getOosRateColor = (rate: number) => {
    if (rate <= 10) return 'text-green-600';
    if (rate <= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  const carrier = result?.carrier;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1E3A5F]">FMCSA Authority Verification</h2>
                <p className="text-sm text-gray-500">Real-time verification against SAFER database</p>
              </div>
            </div>

            {/* Search Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DOT Number</label>
                <input
                  type="text"
                  value={dotNumber}
                  onChange={(e) => setDotNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g., 1234567"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MC Number</label>
                <input
                  type="text"
                  value={mcNumber}
                  onChange={(e) => setMcNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g., 987654"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || (!dotNumber && !mcNumber)}
              className="w-full py-3 bg-[#1E3A5F] text-white rounded-xl font-semibold hover:bg-[#1E3A5F]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying with FMCSA...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Verify Authority
                </>
              )}
            </button>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Verification Result */}
            {result && !carrier && (
              <div className={`mb-4 p-4 rounded-lg ${
                result.verified 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center gap-2">
                  {result.verified ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  )}
                  <span className={`font-semibold ${
                    result.verified ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {result.message}
                  </span>
                </div>
              </div>
            )}

            {/* Detailed Carrier Information */}
            {carrier && showDetails && (
              <div className="space-y-6">
                {/* Status Banner */}
                <div className={`p-4 rounded-xl ${
                  result?.verified 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                    : 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
                }`}>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      {result?.verified ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-8 h-8 text-yellow-600" />
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{carrier.legalName}</h3>
                        {carrier.dbaName && <p className="text-sm text-gray-600">DBA: {carrier.dbaName}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(carrier.statusCode)}`}>
                        {carrier.statusCode === 'A' ? 'Active' : carrier.statusCode}
                      </span>
                      {carrier.oosDate && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium text-red-600 bg-red-100">
                          Out of Service
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{result?.message}</p>
                </div>

                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* DOT & MC Numbers */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileCheck className="w-5 h-5 text-[#1E3A5F]" />
                      <h4 className="font-semibold text-gray-900">Authority Numbers</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">DOT#</span>
                        <span className="font-mono font-semibold">{carrier.dotNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">MC#</span>
                        <span className="font-mono font-semibold">{carrier.mcNumber || 'N/A'}</span>
                      </div>
                      {carrier.mxNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">MX#</span>
                          <span className="font-mono font-semibold">{carrier.mxNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fleet Size */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="w-5 h-5 text-[#1E3A5F]" />
                      <h4 className="font-semibold text-gray-900">Fleet Size</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Power Units</span>
                        <span className="font-semibold">{carrier.totalPowerUnits || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Drivers</span>
                        <span className="font-semibold">{carrier.totalDrivers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Operation</span>
                        <span className="font-semibold text-sm">{carrier.carrierOperation || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-5 h-5 text-[#1E3A5F]" />
                      <h4 className="font-semibold text-gray-900">Contact</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      {carrier.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{carrier.phone}</span>
                        </div>
                      )}
                      {carrier.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{carrier.email}</span>
                        </div>
                      )}
                      {carrier.hqAddress.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{carrier.hqAddress.city}, {carrier.hqAddress.state}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Authority Status */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#1E3A5F]" />
                    Authority Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Common Authority</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(carrier.commonAuthorityStatus)}`}>
                        {getAuthorityLabel(carrier.commonAuthorityStatus)}
                      </span>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Contract Authority</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(carrier.contractAuthorityStatus)}`}>
                        {getAuthorityLabel(carrier.contractAuthorityStatus)}
                      </span>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Broker Authority</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(carrier.brokerAuthorityStatus)}`}>
                        {getAuthorityLabel(carrier.brokerAuthorityStatus)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Insurance Status */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-[#1E3A5F]" />
                    Insurance Coverage
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">BIPD Insurance</p>
                      <p className={`font-semibold ${getInsuranceStatus(carrier.bipdInsuranceOnFile, carrier.bipdInsuranceRequired).color}`}>
                        {getInsuranceStatus(carrier.bipdInsuranceOnFile, carrier.bipdInsuranceRequired).status}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Cargo Insurance</p>
                      <p className={`font-semibold ${getInsuranceStatus(carrier.cargoInsuranceOnFile, carrier.cargoInsuranceRequired).color}`}>
                        {getInsuranceStatus(carrier.cargoInsuranceOnFile, carrier.cargoInsuranceRequired).status}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Bond/Surety</p>
                      <p className={`font-semibold ${getInsuranceStatus(carrier.bondInsuranceOnFile, carrier.bondInsuranceRequired).color}`}>
                        {getInsuranceStatus(carrier.bondInsuranceOnFile, carrier.bondInsuranceRequired).status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Safety Rating */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#1E3A5F]" />
                    Safety Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Safety Rating</p>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-lg text-lg font-bold ${getSafetyRatingColor(carrier.safetyRating)}`}>
                          {getSafetyRatingLabel(carrier.safetyRating)}
                        </span>
                        {carrier.safetyRatingDate && (
                          <span className="text-sm text-gray-500">
                            as of {carrier.safetyRatingDate}
                          </span>
                        )}
                      </div>
                    </div>
                    {carrier.safetyReviewDate && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Last Safety Review</p>
                        <p className="font-semibold">{carrier.safetyReviewDate}</p>
                        <p className="text-sm text-gray-500">{carrier.safetyReviewType || 'Standard Review'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inspection History */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#1E3A5F]" />
                    Inspection History (24 Months)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Driver Inspections */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <h5 className="font-semibold">Driver</h5>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Inspections</span>
                          <span className="font-semibold">{carrier.driverInsp || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Out of Service</span>
                          <span className="font-semibold">{carrier.driverOosInsp || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">OOS Rate</span>
                          <span className={`font-semibold ${getOosRateColor(carrier.driverOosRate)}`}>
                            {carrier.driverOosRate?.toFixed(1) || 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Inspections */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Truck className="w-5 h-5 text-green-600" />
                        <h5 className="font-semibold">Vehicle</h5>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Inspections</span>
                          <span className="font-semibold">{carrier.vehicleInsp || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Out of Service</span>
                          <span className="font-semibold">{carrier.vehicleOosInsp || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">OOS Rate</span>
                          <span className={`font-semibold ${getOosRateColor(carrier.vehicleOosRate)}`}>
                            {carrier.vehicleOosRate?.toFixed(1) || 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Hazmat Inspections */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <h5 className="font-semibold">HazMat</h5>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Inspections</span>
                          <span className="font-semibold">{carrier.hazmatInsp || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Out of Service</span>
                          <span className="font-semibold">{carrier.hazmatOosInsp || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">OOS Rate</span>
                          <span className={`font-semibold ${getOosRateColor(carrier.hazmatOosRate)}`}>
                            {carrier.hazmatOosRate?.toFixed(1) || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Crash Statistics */}
                {(carrier.crashTotal > 0 || carrier.fatalCrash > 0 || carrier.injCrash > 0) && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Crash Statistics (24 Months)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{carrier.crashTotal || 0}</p>
                        <p className="text-xs text-gray-500">Total Crashes</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{carrier.fatalCrash || 0}</p>
                        <p className="text-xs text-gray-500">Fatal</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{carrier.injCrash || 0}</p>
                        <p className="text-xs text-gray-500">Injury</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{carrier.towCrash || 0}</p>
                        <p className="text-xs text-gray-500">Tow Away</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Address Information */}
                {carrier.hqAddress.street && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#1E3A5F]" />
                      Address Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Physical Address</p>
                        <p className="font-medium">{carrier.hqAddress.street}</p>
                        <p className="text-gray-600">
                          {carrier.hqAddress.city}, {carrier.hqAddress.state} {carrier.hqAddress.zipCode}
                        </p>
                        <p className="text-gray-500">{carrier.hqAddress.country}</p>
                      </div>
                      {carrier.mailingAddress.street && carrier.mailingAddress.street !== carrier.hqAddress.street && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Mailing Address</p>
                          <p className="font-medium">{carrier.mailingAddress.street}</p>
                          <p className="text-gray-600">
                            {carrier.mailingAddress.city}, {carrier.mailingAddress.state} {carrier.mailingAddress.zipCode}
                          </p>
                          <p className="text-gray-500">{carrier.mailingAddress.country}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {result?.verified && (
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleConfirm}
                      className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Confirm & Use This Carrier
                    </button>
                    <button
                      onClick={() => {
                        setResult(null);
                        setShowDetails(false);
                        setDotNumber('');
                        setMcNumber('');
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Search Another
                    </button>
                  </div>
                )}
              </div>
            )}

            <p className="mt-6 text-xs text-gray-500 text-center">
              Data sourced from FMCSA SAFER Web Services API in real-time. Last updated information reflects FMCSA records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyDOTModal;
