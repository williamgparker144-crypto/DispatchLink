import React, { useState } from 'react';
import {
  Truck,
  Shield,
  Check,
  X,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  Users,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { subscribeToMailchimp } from '@/lib/mailchimp';

interface CarrierRegistrationProps {
  onBack: () => void;
  onComplete: () => void;
}

interface CarrierData {
  dotNumber: string;
  mcNumber: string;
  legalName: string;
  dbaName: string;
  carrierOperation: string;
  hqAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  email: string;
  statusCode: string;
  commonAuthorityStatus: string;
  contractAuthorityStatus: string;
  brokerAuthorityStatus: string;
  bipdInsuranceOnFile: string;
  cargoInsuranceOnFile: string;
  safetyRating: string;
  totalDrivers: number;
  totalPowerUnits: number;
}

const CarrierRegistration: React.FC<CarrierRegistrationProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState<'verify' | 'review' | 'account' | 'complete'>('verify');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dotNumber, setDotNumber] = useState('');
  const [mcNumber, setMcNumber] = useState('');
  const [carrierData, setCarrierData] = useState<CarrierData | null>(null);
  const [verified, setVerified] = useState(false);
  
  // Account form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleVerify = async () => {
    if (!dotNumber && !mcNumber) {
      setError('Please enter a DOT or MC number');
      return;
    }

    setLoading(true);
    setError(null);

    // Demo mode: simulate FMCSA verification with sample data
    await new Promise(resolve => setTimeout(resolve, 1200));

    const sampleData: CarrierData = {
      dotNumber: dotNumber || '1234567',
      mcNumber: mcNumber || '987654',
      legalName: 'Verified Carrier LLC',
      dbaName: '',
      carrierOperation: 'Interstate',
      hqAddress: { street: '100 Transport Way', city: 'Dallas', state: 'TX', zipCode: '75201' },
      phone: '(214) 555-0100',
      email: '',
      statusCode: 'A',
      commonAuthorityStatus: 'A',
      contractAuthorityStatus: 'A',
      brokerAuthorityStatus: 'N',
      bipdInsuranceOnFile: 'Y',
      cargoInsuranceOnFile: 'Y',
      safetyRating: 'Satisfactory',
      totalDrivers: 8,
      totalPowerUnits: 12,
    };

    setCarrierData(sampleData);
    setVerified(true);
    setStep('review');
    setLoading(false);
  };

  const handleSaveAndContinue = async () => {
    if (!carrierData) return;

    setLoading(true);
    setError(null);

    // Demo mode: simulate saving carrier data
    await new Promise(resolve => setTimeout(resolve, 800));
    setStep('account');
    setLoading(false);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    setError(null);

    // Demo mode: simulate account creation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStep('complete');
    setLoading(false);

    subscribeToMailchimp({
      email,
      firstName: contactName,
      phone: contactPhone,
      company: carrierData?.legalName,
      dotNumber: carrierData?.dotNumber,
      mcNumber: carrierData?.mcNumber,
      source: 'registration',
    });
  };

  const getStatusBadge = (status: string) => {
    const isActive = status === 'A' || status === 'ACTIVE';
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const renderVerifyStep = () => (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#ff6b35]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-[#ff6b35]" />
        </div>
        <h2 className="text-2xl font-bold text-[#1a365d] mb-2">Verify Your Authority</h2>
        <p className="text-gray-600">
          Enter your DOT or MC number to verify your carrier authority with FMCSA and auto-populate your profile.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DOT Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={dotNumber}
                onChange={(e) => setDotNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g., 1234567"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent pl-10"
              />
              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MC Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={mcNumber}
                onChange={(e) => setMcNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g., 987654"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent pl-10"
              />
              <FileCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || (!dotNumber && !mcNumber)}
          className="w-full mt-6 py-3 bg-[#ff6b35] text-white rounded-xl font-semibold hover:bg-[#e55a2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      </div>

      <p className="text-center text-sm text-gray-500 mt-4">
        We verify your information directly with the FMCSA SAFER database to ensure accuracy and compliance.
      </p>
    </div>
  );

  const renderReviewStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-[#1a365d] mb-2">Authority Verified!</h2>
        <p className="text-gray-600">
          Review your FMCSA information below. This data will be used to create your carrier profile.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {carrierData && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a365d] to-[#2d4a6f] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{carrierData.legalName}</h3>
                {carrierData.dbaName && (
                  <p className="text-blue-200">DBA: {carrierData.dbaName}</p>
                )}
              </div>
              {getStatusBadge(carrierData.statusCode)}
            </div>
            <div className="flex gap-4 mt-4">
              <div className="bg-white/10 rounded-lg px-3 py-2">
                <p className="text-xs text-blue-200">DOT Number</p>
                <p className="font-semibold">{carrierData.dotNumber}</p>
              </div>
              {carrierData.mcNumber && (
                <div className="bg-white/10 rounded-lg px-3 py-2">
                  <p className="text-xs text-blue-200">MC Number</p>
                  <p className="font-semibold">{carrierData.mcNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-[#1a365d] mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Contact Information
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-[#1a365d]">
                      {carrierData.hqAddress.street}<br />
                      {carrierData.hqAddress.city}, {carrierData.hqAddress.state} {carrierData.hqAddress.zipCode}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {carrierData.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-[#1a365d]">{carrierData.phone}</span>
                    </div>
                  )}
                  {carrierData.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-[#1a365d]">{carrierData.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Authority Status */}
            <div>
              <h4 className="font-semibold text-[#1a365d] mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Authority Status
              </h4>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Common Authority</p>
                  {getStatusBadge(carrierData.commonAuthorityStatus)}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Contract Authority</p>
                  {getStatusBadge(carrierData.contractAuthorityStatus)}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Broker Authority</p>
                  {getStatusBadge(carrierData.brokerAuthorityStatus)}
                </div>
              </div>
            </div>

            {/* Insurance & Fleet */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-[#1a365d] mb-3 flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Insurance
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <span className="text-sm text-gray-600">BIPD Insurance</span>
                    {carrierData.bipdInsuranceOnFile ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <span className="text-sm text-gray-600">Cargo Insurance</span>
                    {carrierData.cargoInsuranceOnFile ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[#1a365d] mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Fleet Size
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <span className="text-sm text-gray-600">Drivers</span>
                    <span className="font-semibold text-[#1a365d]">{carrierData.totalDrivers}</span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <span className="text-sm text-gray-600">Power Units</span>
                    <span className="font-semibold text-[#1a365d]">{carrierData.totalPowerUnits}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Rating */}
            {carrierData.safetyRating && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Safety Rating: {carrierData.safetyRating}</p>
                    <p className="text-sm text-yellow-700">
                      This rating is from the FMCSA and reflects your carrier's safety performance.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t p-6">
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep('verify');
                  setCarrierData(null);
                  setVerified(false);
                }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Verify Different Number
              </button>
              <button
                onClick={handleSaveAndContinue}
                disabled={loading}
                className="flex-1 py-3 bg-[#ff6b35] text-white rounded-xl font-semibold hover:bg-[#e55a2b] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAccountStep = () => (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#1a365d]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-[#1a365d]" />
        </div>
        <h2 className="text-2xl font-bold text-[#1a365d] mb-2">Create Your Account</h2>
        <p className="text-gray-600">
          Set up your login credentials to access your carrier dashboard.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleCreateAccount} className="bg-white rounded-2xl shadow-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              required
            />
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#ff6b35] border-gray-300 rounded focus:ring-[#ff6b35]"
              />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-[#ff6b35] hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-[#ff6b35] hover:underline">Privacy Policy</a>
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={() => setStep('review')}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-[#ff6b35] text-white rounded-xl font-semibold hover:bg-[#e55a2b] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="max-w-xl mx-auto text-center">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-[#1a365d] mb-4">Registration Complete!</h2>
        <p className="text-gray-600 mb-6">
          Your carrier profile has been created and verified with FMCSA data. 
          Check your email to verify your account and get started.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-[#1a365d] mb-2">What's Next?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              Verify your email address
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              Complete your carrier profile
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              Browse the dispatcher directory
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              Grant MC# permissions to dispatchers
            </li>
          </ul>
        </div>

        <button
          onClick={onComplete}
          className="w-full py-3 bg-[#ff6b35] text-white rounded-xl font-semibold hover:bg-[#e55a2b] transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#1a365d] hover:text-[#ff6b35] mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {['verify', 'review', 'account', 'complete'].map((s, index) => {
            const isActive = step === s;
            const isPast = ['verify', 'review', 'account', 'complete'].indexOf(step) > index;
            
            return (
              <React.Fragment key={s}>
                {index > 0 && (
                  <div className={`w-12 h-0.5 ${isPast ? 'bg-[#ff6b35]' : 'bg-gray-200'}`} />
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  isActive 
                    ? 'bg-[#ff6b35] text-white' 
                    : isPast 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {isPast && !isActive ? <Check className="w-5 h-5" /> : index + 1}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        {step === 'verify' && renderVerifyStep()}
        {step === 'review' && renderReviewStep()}
        {step === 'account' && renderAccountStep()}
        {step === 'complete' && renderCompleteStep()}
      </div>
    </div>
  );
};

export default CarrierRegistration;
