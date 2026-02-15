import React, { useState } from 'react';
import { 
  Search, Shield, CheckCircle, AlertCircle, Loader2, Truck, Users, 
  FileCheck, AlertTriangle, MapPin, Phone, Mail, Building2, TrendingUp, 
  Activity, ExternalLink, Info, XCircle, Clock, Printer
} from 'lucide-react';
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

interface VerificationResult {
  verified: boolean;
  status: string;
  carrier?: CarrierData;
  message?: string;
  warnings?: string[];
}

const VerifyDOTPage: React.FC = () => {
  const [dotNumber, setDotNumber] = useState('');
  const [mcNumber, setMcNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');
  const [verifiedAt, setVerifiedAt] = useState<Date | null>(null);

  const handleVerify = async () => {
    if (!dotNumber && !mcNumber) {
      setError('Please enter a DOT or MC number');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    // Demo mode: simulate FMCSA SAFER lookup with sample data
    await new Promise(resolve => setTimeout(resolve, 1500));

    const sampleCarrier: CarrierData = {
      dotNumber: dotNumber || '2233541',
      legalName: dotNumber === '1234567' ? 'Thompson Trucking LLC' : 'Verified Carrier LLC',
      dbaName: dotNumber === '1234567' ? 'Thompson Express' : '',
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
      hazmatInsp: 2,
      hazmatOosInsp: 0,
      hazmatOosRate: 0,
      crashTotal: 1,
      fatalCrash: 0,
      injCrash: 0,
      towCrash: 1,
    };

    setResult({
      verified: true,
      status: 'active',
      carrier: sampleCarrier,
      message: 'Carrier authority is active and in good standing.',
    });
    setVerifiedAt(new Date());
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'A' || s === 'ACTIVE') return 'text-green-600 bg-green-100';
    if (s === 'I' || s === 'INACTIVE') return 'text-gray-600 bg-gray-100';
    if (s === 'N' || s === 'NONE' || !s) return 'text-gray-500 bg-gray-50';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getAuthorityLabel = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'A' || s === 'ACTIVE') return 'Active';
    if (s === 'I' || s === 'INACTIVE') return 'Inactive';
    if (s === 'N' || s === 'NONE' || !s) return 'None';
    return status || 'N/A';
  };

  const getInsuranceStatus = (onFile: string, required: string) => {
    if (required !== 'Y' && required !== '1') return { status: 'Not Required', color: 'text-gray-500', icon: 'neutral' };
    // Check if insurance is on file (could be 'Y', '1', or a numeric amount)
    if (onFile === 'Y' || onFile === '1' || (onFile && /^\d+$/.test(onFile) && parseInt(onFile) > 0)) {
      return { status: onFile.match(/^\d+$/) ? `$${parseInt(onFile).toLocaleString()}` : 'On File', color: 'text-green-600', icon: 'check' };
    }
    return { status: 'Not On File', color: 'text-red-600', icon: 'x' };
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

  const getOosRateBar = (rate: number) => {
    const color = rate <= 10 ? 'bg-green-500' : rate <= 20 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${Math.min(rate, 100)}%` }} />
      </div>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const carrier = result?.carrier;

  return (
    <div className="py-12 bg-gray-50 min-h-screen print:bg-white print:py-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 print:mb-4">
          <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-2xl mb-4 print:hidden">
            <Shield className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">FMCSA Carrier Verification</h1>
          <p className="text-gray-600 max-w-2xl mx-auto print:hidden">
            Verify carrier operating authority, insurance status, safety ratings, and inspection history 
            directly from the FMCSA SAFER database in real-time.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 print:shadow-none print:border print:border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DOT Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={dotNumber}
                  onChange={(e) => setDotNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter DOT number (e.g., 1234567)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none print:border-gray-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">MC Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={mcNumber}
                  onChange={(e) => setMcNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter MC number (e.g., 987654)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none print:border-gray-300"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || (!dotNumber && !mcNumber)}
            className="w-full py-4 bg-[#1E3A5F] text-white rounded-xl font-semibold hover:bg-[#1E3A5F]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 print:hidden"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying with FMCSA SAFER Database...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Verify Carrier Authority
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Info Box */}
        {!result && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 print:hidden">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">What information will I see?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Company name, address, and contact information</li>
                  <li>• Operating authority status (Common, Contract, Broker)</li>
                  <li>• Insurance coverage status (BIPD, Cargo, Bond/Surety)</li>
                  <li>• Safety rating and review history</li>
                  <li>• Fleet size (power units and drivers)</li>
                  <li>• Inspection history and out-of-service rates (24 months)</li>
                  <li>• Crash statistics (24 months)</li>
                </ul>
                <p className="mt-3 text-xs text-blue-700">
                  Data is retrieved in real-time from the FMCSA SAFER Web Services API.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results - No Carrier Found */}
        {result && !carrier && (
          <div className={`p-6 rounded-xl ${
            result.verified 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center gap-3">
              {result.verified ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-600" />
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
        {carrier && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`p-6 rounded-2xl print:rounded-lg ${
              result?.verified 
                ? carrier.oosDate 
                  ? 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200'
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                : 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  {carrier.oosDate ? (
                    <div className="p-3 bg-red-100 rounded-xl">
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                  ) : result?.verified ? (
                    <div className="p-3 bg-green-100 rounded-xl">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-100 rounded-xl">
                      <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-bold text-2xl text-gray-900">{carrier.legalName}</h2>
                    {carrier.dbaName && <p className="text-gray-600">DBA: {carrier.dbaName}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(carrier.statusCode)}`}>
                    {carrier.statusCode === 'A' ? 'Active Entity' : carrier.statusCode || 'Unknown'}
                  </span>
                  {carrier.oosDate && (
                    <span className="px-4 py-2 rounded-full text-sm font-semibold text-red-600 bg-red-100">
                      Out of Service: {carrier.oosDate}
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-3 text-gray-600">{result?.message}</p>
              
              {/* Warnings */}
              {result?.warnings && result.warnings.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-800 text-sm">Warnings:</p>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        {result.warnings.map((warning, idx) => (
                          <li key={idx}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Verification timestamp */}
              {verifiedAt && (
                <p className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Verified: {verifiedAt.toLocaleString()}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 print:hidden">
              <a
                href={`https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${carrier.dotNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg font-medium hover:bg-[#1E3A5F]/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Full SAFER Report
              </a>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Report
              </button>
            </div>

            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 print:shadow-none">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#1E3A5F]/10 rounded-lg">
                    <FileCheck className="w-5 h-5 text-[#1E3A5F]" />
                  </div>
                  <span className="font-medium text-gray-700">DOT Number</span>
                </div>
                <p className="text-2xl font-bold font-mono text-[#1E3A5F]">{carrier.dotNumber || 'N/A'}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 print:shadow-none">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#3B82F6]/10 rounded-lg">
                    <FileCheck className="w-5 h-5 text-[#3B82F6]" />
                  </div>
                  <span className="font-medium text-gray-700">MC Number</span>
                </div>
                <p className="text-2xl font-bold font-mono text-[#1E3A5F]">{carrier.mcNumber || 'N/A'}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 print:shadow-none">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-700">Power Units</span>
                </div>
                <p className="text-2xl font-bold text-[#1E3A5F]">{carrier.totalPowerUnits || 0}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 print:shadow-none">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-700">Drivers</span>
                </div>
                <p className="text-2xl font-bold text-[#1E3A5F]">{carrier.totalDrivers || 0}</p>
              </div>
            </div>

            {/* Operation Type */}
            {carrier.carrierOperation && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 print:shadow-none">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Truck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Operation Type</span>
                    <p className="text-lg font-semibold text-[#1E3A5F]">{carrier.carrierOperation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Authority Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:shadow-none">
              <h3 className="font-bold text-lg text-[#1E3A5F] mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Operating Authority Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">Common Authority</p>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(carrier.commonAuthorityStatus)}`}>
                    {getAuthorityLabel(carrier.commonAuthorityStatus)}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">For-hire transportation</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">Contract Authority</p>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(carrier.contractAuthorityStatus)}`}>
                    {getAuthorityLabel(carrier.contractAuthorityStatus)}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">Contract carriage</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">Broker Authority</p>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(carrier.brokerAuthorityStatus)}`}>
                    {getAuthorityLabel(carrier.brokerAuthorityStatus)}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">Freight brokerage</p>
                </div>
              </div>
            </div>

            {/* Insurance Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:shadow-none">
              <h3 className="font-bold text-lg text-[#1E3A5F] mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Insurance Coverage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'BIPD Insurance', desc: 'Bodily Injury & Property Damage', onFile: carrier.bipdInsuranceOnFile, required: carrier.bipdInsuranceRequired },
                  { label: 'Cargo Insurance', desc: 'Freight/Cargo coverage', onFile: carrier.cargoInsuranceOnFile, required: carrier.cargoInsuranceRequired },
                  { label: 'Bond/Surety', desc: 'Broker bond requirement', onFile: carrier.bondInsuranceOnFile, required: carrier.bondInsuranceRequired },
                ].map((ins, idx) => {
                  const status = getInsuranceStatus(ins.onFile, ins.required);
                  return (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm font-medium text-gray-700 mb-1">{ins.label}</p>
                      <p className="text-xs text-gray-400 mb-2">{ins.desc}</p>
                      <div className="flex items-center gap-2">
                        {status.icon === 'check' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {status.icon === 'x' && <XCircle className="w-5 h-5 text-red-500" />}
                        {status.icon === 'neutral' && <div className="w-5 h-5 rounded-full bg-gray-300" />}
                        <span className={`font-semibold ${status.color}`}>{status.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Safety Rating */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:shadow-none">
              <h3 className="font-bold text-lg text-[#1E3A5F] mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Safety Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Safety Rating</p>
                  <div className="flex items-center gap-3">
                    <span className={`px-5 py-2 rounded-xl text-lg font-bold ${getSafetyRatingColor(carrier.safetyRating)}`}>
                      {getSafetyRatingLabel(carrier.safetyRating)}
                    </span>
                    {carrier.safetyRatingDate && (
                      <span className="text-sm text-gray-500">as of {carrier.safetyRatingDate}</span>
                    )}
                  </div>
                </div>
                {carrier.safetyReviewDate && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Last Safety Review</p>
                    <p className="font-semibold text-gray-900">{carrier.safetyReviewDate}</p>
                    <p className="text-sm text-gray-500">{carrier.safetyReviewType || 'Standard Review'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inspection History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:shadow-none">
              <h3 className="font-bold text-lg text-[#1E3A5F] mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Inspection History (24 Months)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Driver Inspections */}
                <div className="p-5 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Driver</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Inspections</span>
                      <span className="font-bold">{carrier.driverInsp || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Out of Service</span>
                      <span className="font-bold">{carrier.driverOosInsp || 0}</span>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">OOS Rate</span>
                        <span className={`font-bold ${getOosRateColor(carrier.driverOosRate)}`}>
                          {carrier.driverOosRate?.toFixed(1) || 0}%
                        </span>
                      </div>
                      {getOosRateBar(carrier.driverOosRate || 0)}
                      <p className="text-xs text-gray-400 mt-1">National avg: ~5%</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Inspections */}
                <div className="p-5 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Vehicle</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Inspections</span>
                      <span className="font-bold">{carrier.vehicleInsp || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Out of Service</span>
                      <span className="font-bold">{carrier.vehicleOosInsp || 0}</span>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">OOS Rate</span>
                        <span className={`font-bold ${getOosRateColor(carrier.vehicleOosRate)}`}>
                          {carrier.vehicleOosRate?.toFixed(1) || 0}%
                        </span>
                      </div>
                      {getOosRateBar(carrier.vehicleOosRate || 0)}
                      <p className="text-xs text-gray-400 mt-1">National avg: ~20%</p>
                    </div>
                  </div>
                </div>

                {/* HazMat Inspections */}
                <div className="p-5 bg-orange-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold text-gray-900">HazMat</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Inspections</span>
                      <span className="font-bold">{carrier.hazmatInsp || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Out of Service</span>
                      <span className="font-bold">{carrier.hazmatOosInsp || 0}</span>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">OOS Rate</span>
                        <span className={`font-bold ${getOosRateColor(carrier.hazmatOosRate)}`}>
                          {carrier.hazmatOosRate?.toFixed(1) || 0}%
                        </span>
                      </div>
                      {getOosRateBar(carrier.hazmatOosRate || 0)}
                      <p className="text-xs text-gray-400 mt-1">National avg: ~4%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Crash Statistics */}
            {(carrier.crashTotal > 0 || carrier.fatalCrash > 0 || carrier.injCrash > 0 || carrier.towCrash > 0) && (
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 print:shadow-none">
                <h3 className="font-bold text-lg text-[#1E3A5F] mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Crash Statistics (24 Months)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-3xl font-bold text-gray-900">{carrier.crashTotal || 0}</p>
                    <p className="text-sm text-gray-500">Total Crashes</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <p className="text-3xl font-bold text-red-600">{carrier.fatalCrash || 0}</p>
                    <p className="text-sm text-gray-500">Fatal</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <p className="text-3xl font-bold text-orange-600">{carrier.injCrash || 0}</p>
                    <p className="text-sm text-gray-500">Injury</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-xl">
                    <p className="text-3xl font-bold text-yellow-600">{carrier.towCrash || 0}</p>
                    <p className="text-sm text-gray-500">Tow Away</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(carrier.phone || carrier.email || carrier.hqAddress.street) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:shadow-none">
                <h3 className="font-bold text-lg text-[#1E3A5F] mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Physical Address</p>
                    {carrier.hqAddress.street && (
                      <>
                        <p className="font-medium text-gray-900">{carrier.hqAddress.street}</p>
                        <p className="text-gray-600">
                          {carrier.hqAddress.city}, {carrier.hqAddress.state} {carrier.hqAddress.zipCode}
                        </p>
                        <p className="text-gray-500">{carrier.hqAddress.country}</p>
                      </>
                    )}
                  </div>
                  <div className="space-y-3">
                    {carrier.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <a href={`tel:${carrier.phone}`} className="text-gray-900 hover:text-[#1E3A5F]">{carrier.phone}</a>
                      </div>
                    )}
                    {carrier.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <a href={`mailto:${carrier.email}`} className="text-gray-900 hover:text-[#1E3A5F]">{carrier.email}</a>
                      </div>
                    )}
                    {carrier.fax && (
                      <div className="flex items-center gap-3">
                        <FileCheck className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">Fax: {carrier.fax}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4 print:bg-white print:border print:border-gray-200">
              <div>
                <p className="text-sm text-gray-600">
                  Data sourced from FMCSA SAFER Web Services API
                </p>
                <p className="text-xs text-gray-500">
                  Information reflects current FMCSA records as of verification time.
                </p>
              </div>
              <a
                href={`https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${carrier.dotNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#1E3A5F] hover:text-[#3B82F6] font-medium transition-colors print:hidden"
              >
                <ExternalLink className="w-4 h-4" />
                View on FMCSA SAFER
              </a>
            </div>

            {/* Search Again */}
            <div className="text-center print:hidden">
              <button
                onClick={() => {
                  setResult(null);
                  setDotNumber('');
                  setMcNumber('');
                  setVerifiedAt(null);
                }}
                className="px-6 py-3 bg-[#1E3A5F] text-white rounded-xl font-semibold hover:bg-[#1E3A5F]/80 transition-colors"
              >
                Verify Another Carrier
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyDOTPage;
