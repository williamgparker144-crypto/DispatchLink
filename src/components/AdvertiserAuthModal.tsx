import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Building, Phone, Globe, Eye, EyeOff, CheckCircle, Smartphone, Megaphone, Briefcase } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { getUserByEmail, getUserByPhone, createUser, createAdvertiserProfile, getCarrierReferences } from '@/lib/api';
import { dbUserToCurrentUser } from '@/lib/mappers';
import { signInWithGoogle, signInWithPhone, verifyPhoneOtp } from '@/lib/auth';

interface AdvertiserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'signup';
}

type AuthStep = 'credentials' | 'phone-entry' | 'phone-verify' | 'business-details';

const INDUSTRY_OPTIONS = [
  'Trucking & Logistics',
  'Fleet Management',
  'Insurance',
  'Fuel & Energy',
  'Technology / SaaS',
  'Equipment & Parts',
  'Compliance & Safety',
  'Financial Services',
  'Recruiting & Staffing',
  'Other',
];

const AdvertiserAuthModal: React.FC<AdvertiserAuthModalProps> = ({ isOpen, onClose, initialMode }) => {
  const { setCurrentUser, registerUser } = useAppContext();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [authStep, setAuthStep] = useState<AuthStep>('credentials');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Phone OTP
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Pending auth from Google/Phone
  const [pendingAuthId, setPendingAuthId] = useState('');
  const [pendingAuthProvider, setPendingAuthProvider] = useState('');
  const [pendingImage, setPendingImage] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    businessName: '',
    businessWebsite: '',
    industry: '',
    agreeTerms: false,
  });

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError('');
      setLoading(false);
      setMode(initialMode);
      setAuthStep('credentials');
      setPendingAuthId('');
    }
  }, [isOpen, initialMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value } = target;
    const checked = target instanceof HTMLInputElement ? target.checked : false;
    const type = target instanceof HTMLInputElement ? target.type : 'text';
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await signInWithGoogle();
      if (authError) throw new Error(authError.message);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
      setLoading(false);
    }
  };

  // Phone: send OTP
  const handleSendPhoneOtp = async () => {
    if (!phoneNumber.trim()) { setError('Please enter your phone number'); return; }
    setLoading(true);
    setError('');
    try {
      const { error: otpError } = await signInWithPhone(phoneNumber.trim());
      if (otpError) throw new Error(otpError.message);
      setAuthStep('phone-verify');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Phone: verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.length < 6) { setError('Please enter the 6-digit code'); return; }
    setLoading(true);
    setError('');
    try {
      const { data, error: verifyError } = await verifyPhoneOtp(phoneNumber.trim(), otpCode.trim());
      if (verifyError) throw new Error(verifyError.message);

      const dbUser = await getUserByPhone(phoneNumber.trim());
      if (dbUser) {
        if (dbUser.user_type !== 'advertiser') {
          throw new Error('This phone number is associated with a non-advertiser account. Please use the main sign-in.');
        }
        const mapped = dbUserToCurrentUser(dbUser);
        setCurrentUser(mapped);
        registerUser(mapped);
        setSuccess(true);
      } else {
        setPendingAuthId(data.user?.id || '');
        setPendingAuthProvider('phone');
        setAuthStep('business-details');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Create advertiser from pending auth
  const handleCreateAdvertiser = async () => {
    if (!formData.firstName || !formData.lastName) { setError('Please enter your name'); return; }
    if (!formData.businessName.trim()) { setError('Business name is required'); return; }

    setLoading(true);
    setError('');
    try {
      const email = formData.email || `${pendingAuthId || Date.now()}@advertiser.local`;

      const dbUser = await createUser({
        email,
        userType: 'advertiser',
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || phoneNumber,
        companyName: formData.businessName,
        authId: pendingAuthId || undefined,
        authProvider: pendingAuthProvider || undefined,
        profileImageUrl: pendingImage || undefined,
      });

      await createAdvertiserProfile(dbUser.id, {
        businessName: formData.businessName,
        businessWebsite: formData.businessWebsite,
        industry: formData.industry,
        contactPhone: formData.phone || phoneNumber,
      });

      const fullUser = await getUserByEmail(email);
      const newUser = dbUserToCurrentUser(fullUser!);
      setCurrentUser(newUser);
      registerUser(newUser);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Account creation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Email/Password login/signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
          throw new Error('Please fill in all required fields');
        }
        if (!formData.businessName.trim()) {
          throw new Error('Business name is required');
        }
        if (!formData.agreeTerms) {
          throw new Error('Please agree to the Terms of Service');
        }

        const existing = await getUserByEmail(formData.email);
        if (existing) throw new Error('An account with this email already exists.');

        const dbUser = await createUser({
          email: formData.email,
          userType: 'advertiser',
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          companyName: formData.businessName,
        });

        await createAdvertiserProfile(dbUser.id, {
          businessName: formData.businessName,
          businessWebsite: formData.businessWebsite,
          industry: formData.industry,
          contactPhone: formData.phone,
        });

        const fullUser = await getUserByEmail(formData.email);
        const newUser = dbUserToCurrentUser(fullUser!);
        setCurrentUser(newUser);
        registerUser(newUser);
        setSuccess(true);
      } else {
        // Login
        if (!formData.email || !formData.password) throw new Error('Please enter your email and password');

        const dbUser = await getUserByEmail(formData.email);
        if (!dbUser) throw new Error('No account found with this email.');
        if (dbUser.user_type !== 'advertiser') {
          throw new Error('This account is not an advertiser account. Please use the main sign-in.');
        }

        const mapped = dbUserToCurrentUser(dbUser);
        setCurrentUser(mapped);
        registerUser(mapped);
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderGoogleButton = () => (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span className="font-medium text-gray-700">Sign in with Google</span>
    </button>
  );

  const renderPhoneButton = () => (
    <button
      type="button"
      onClick={() => setAuthStep('phone-entry')}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      <Smartphone className="w-5 h-5 text-gray-600" />
      <span className="font-medium text-gray-700">Sign in with Phone</span>
    </button>
  );

  const renderDivider = () => (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-4 text-gray-400 font-medium">OR</span>
      </div>
    </div>
  );

  // Phone entry step
  if (authStep === 'phone-entry') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <div className="p-8">
            <button onClick={() => { setAuthStep('credentials'); setError(''); }} className="text-sm text-[#F59E0B] hover:underline mb-4 inline-block">&larr; Back</button>
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-6 h-6 text-[#F59E0B]" />
              <h2 className="text-2xl font-bold text-[#1E3A5F]">Phone Sign In</h2>
            </div>
            <p className="text-gray-600 mb-6">Enter your phone number to receive a verification code.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="tel" value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); setError(''); }} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none" placeholder="+1 (555) 123-4567" />
                </div>
              </div>
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
              <button onClick={handleSendPhoneOtp} disabled={loading} className="w-full py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Verification Code'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Phone verify step
  if (authStep === 'phone-verify') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <div className="p-8">
            <button onClick={() => { setAuthStep('phone-entry'); setError(''); setOtpCode(''); }} className="text-sm text-[#F59E0B] hover:underline mb-4 inline-block">&larr; Back</button>
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">Enter Code</h2>
            <p className="text-gray-600 mb-6">We sent a 6-digit code to <strong>{phoneNumber}</strong></p>
            <div className="space-y-4">
              <input type="text" value={otpCode} onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none text-center text-2xl tracking-[0.5em] font-mono" placeholder="000000" maxLength={6} autoFocus />
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
              <button onClick={handleVerifyOtp} disabled={loading || otpCode.length < 6} className="w-full py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify Code'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Business details step (after Google/Phone auth)
  if (authStep === 'business-details') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <div className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-6 h-6 text-[#F59E0B]" />
              <h2 className="text-2xl font-bold text-[#1E3A5F]">Business Details</h2>
            </div>
            <p className="text-gray-600 mb-6">Complete your advertiser profile.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none" placeholder="Acme Logistics Inc." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="url" name="businessWebsite" value={formData.businessWebsite} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none" placeholder="https://yoursite.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select name="industry" value={formData.industry} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none bg-white appearance-none">
                    <option value="">Select industry...</option>
                    {INDUSTRY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
              <button onClick={handleCreateAdvertiser} disabled={loading} className="w-full py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Advertiser Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">
              {mode === 'signup' ? 'Advertiser Account Created!' : 'Welcome Back!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {mode === 'signup' ? 'Your advertiser account is ready. Start creating campaigns!' : 'You\'re signed in to the Advertiser Portal.'}
            </p>
            <button onClick={onClose} className="w-full py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl">
              Continue to Ad Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main credentials form
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-xl flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E3A5F]">
                {mode === 'login' ? 'Advertiser Portal' : 'Create Advertiser Account'}
              </h2>
            </div>
          </div>
          <p className="text-gray-600 mb-6 text-sm mt-2">
            {mode === 'login' ? 'Sign in to manage your ad campaigns' : 'Set up your business advertising account'}
          </p>

          {/* Social Buttons */}
          <div className="space-y-3 mb-2">
            {renderGoogleButton()}
            {renderPhoneButton()}
          </div>

          {renderDivider()}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none" placeholder="John" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none" placeholder="Doe" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none" placeholder="Acme Logistics Inc." />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="url" name="businessWebsite" value={formData.businessWebsite} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none" placeholder="https://yoursite.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select name="industry" value={formData.industry} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none bg-white">
                    <option value="">Select industry...</option>
                    {INDUSTRY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none" placeholder="you@company.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F59E0B] outline-none" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleInputChange} className="mt-1 w-4 h-4 text-[#F59E0B] border-gray-300 rounded focus:ring-[#F59E0B]" />
                <span className="text-sm text-gray-600">
                  I agree to the <a href="#" className="text-[#F59E0B] hover:underline">Terms of Service</a> and <a href="#" className="text-[#F59E0B] hover:underline">Advertising Policy</a> *
                </span>
              </label>
            )}

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : mode === 'login' ? 'Sign In to Advertiser Portal' : 'Create Advertiser Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {mode === 'login' ? (
              <>Don't have an advertiser account? <button onClick={() => setMode('signup')} className="text-[#F59E0B] font-semibold hover:underline">Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => setMode('login')} className="text-[#F59E0B] font-semibold hover:underline">Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvertiserAuthModal;
