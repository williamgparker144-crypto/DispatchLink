import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Building, Phone, Truck, Users, Eye, EyeOff, CheckCircle, Smartphone } from 'lucide-react';
import { subscribeToMailchimp } from '@/lib/mailchimp';
import { useAppContext } from '@/contexts/AppContext';
import type { PendingAuthResult } from '@/contexts/AppContext';
import { getUserByEmail, getUserByPhone, createUser, createDispatcherProfile, createCarrierProfile, createBrokerProfile, getCarrierReferences } from '@/lib/api';
import { dbUserToCurrentUser } from '@/lib/mappers';
import { signInWithGoogle, signInWithPhone, verifyPhoneOtp } from '@/lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'signup';
  pendingAuth?: PendingAuthResult | null;
}

type AuthStep = 'credentials' | 'phone-entry' | 'phone-verify' | 'select-type';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode, pendingAuth }) => {
  const { setCurrentUser, registerUser, clearPendingAuthResult } = useAppContext();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [authStep, setAuthStep] = useState<AuthStep>('credentials');
  const [userType, setUserType] = useState<'dispatcher' | 'carrier' | 'broker'>('dispatcher');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Pending auth user (from Google/Phone — needs type selection)
  const [pendingAuthUser, setPendingAuthUser] = useState<PendingAuthResult | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
    phone: '',
    dotNumber: '',
    mcNumber: '',
    agreeTerms: false,
    agreePrivacy: false,
  });

  // Reset modal state when it opens
  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError('');
      setLoading(false);
      setMode(initialMode);
      // If there's a pending auth result (new Google/Phone user), go to select-type
      if (pendingAuth) {
        setPendingAuthUser(pendingAuth);
        setAuthStep('select-type');
        // Pre-fill name from Google
        if (pendingAuth.name) {
          const parts = pendingAuth.name.split(' ');
          setFormData(prev => ({
            ...prev,
            firstName: parts[0] || '',
            lastName: parts.slice(1).join(' ') || '',
            email: pendingAuth.email || '',
          }));
        } else if (pendingAuth.email) {
          setFormData(prev => ({ ...prev, email: pendingAuth.email || '' }));
        }
      } else {
        setAuthStep('credentials');
        setPendingAuthUser(null);
      }
    }
  }, [isOpen, initialMode, pendingAuth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
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
      // Supabase will redirect to Google — the onAuthStateChange listener in AppContext
      // handles the callback. Modal can close.
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  // Phone: send OTP
  const handleSendPhoneOtp = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: otpError } = await signInWithPhone(phoneNumber.trim());
      if (otpError) throw new Error(otpError.message);
      setAuthStep('phone-verify');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Phone: verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error: verifyError } = await verifyPhoneOtp(phoneNumber.trim(), otpCode.trim());
      if (verifyError) throw new Error(verifyError.message);

      // Check if this phone user already has a public.users row
      const dbUser = await getUserByPhone(phoneNumber.trim());
      if (dbUser) {
        // Existing user — load and set
        let carrierRefs;
        if (dbUser.user_type === 'dispatcher') {
          carrierRefs = await getCarrierReferences(dbUser.id);
        }
        const mapped = dbUserToCurrentUser(dbUser, carrierRefs);
        setCurrentUser(mapped);
        registerUser(mapped);
        setSuccess(true);
      } else {
        // New user — need to pick type
        setPendingAuthUser({
          authId: data.user?.id || '',
          phone: phoneNumber.trim(),
          email: data.user?.email,
        });
        setAuthStep('select-type');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Select-type: create new user from Google/Phone auth
  const handleCreateAuthUser = async () => {
    if (!pendingAuthUser) return;
    if (!formData.firstName || !formData.lastName) {
      setError('Please enter your first and last name');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const email = pendingAuthUser.email || formData.email || `${pendingAuthUser.authId}@auth.local`;
      const authProvider = pendingAuthUser.phone ? 'phone' : 'google';

      // Create user in Supabase
      const dbUser = await createUser({
        email,
        userType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: pendingAuthUser.phone || formData.phone,
        companyName: formData.companyName,
        authId: pendingAuthUser.authId,
        authProvider,
        profileImageUrl: pendingAuthUser.image,
      });

      // Create type-specific profile
      if (userType === 'dispatcher') {
        await createDispatcherProfile(dbUser.id, { specialties: [] });
      } else if (userType === 'carrier') {
        if (!formData.dotNumber || !formData.mcNumber) {
          throw new Error('DOT and MC numbers are required for carriers');
        }
        await createCarrierProfile(dbUser.id, {
          dotNumber: formData.dotNumber,
          mcNumber: formData.mcNumber,
        });
      } else {
        if (!formData.dotNumber || !formData.mcNumber) {
          throw new Error('DOT and MC numbers are required for brokers');
        }
        await createBrokerProfile(dbUser.id, {
          mcNumber: formData.mcNumber,
          dotNumber: formData.dotNumber,
          specialties: [],
        });
      }

      // Re-fetch with joined profiles
      const fullUser = await getUserByEmail(email);
      const newUser = dbUserToCurrentUser(fullUser!);
      setCurrentUser(newUser);
      registerUser(newUser);
      clearPendingAuthResult();
      setSuccess(true);

      subscribeToMailchimp({
        email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: pendingAuthUser.phone || formData.phone,
        company: formData.companyName,
        userType,
        dotNumber: formData.dotNumber,
        mcNumber: formData.mcNumber,
        source: 'signup',
      });
    } catch (err: any) {
      setError(err.message || 'Account creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        // Validate required fields
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
          throw new Error('Please fill in all required fields');
        }
        if (!formData.agreeTerms || !formData.agreePrivacy) {
          throw new Error('Please agree to the Terms of Service and Privacy Policy');
        }
        if ((userType === 'carrier' || userType === 'broker') && (!formData.dotNumber || !formData.mcNumber)) {
          throw new Error('DOT and MC numbers are required for carriers and brokers');
        }

        let newUser;
        try {
          // Check if email already exists
          const existing = await getUserByEmail(formData.email);
          if (existing) {
            throw new Error('An account with this email already exists. Please sign in.');
          }

          // Create user in Supabase
          const dbUser = await createUser({
            email: formData.email,
            userType,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            companyName: formData.companyName,
          });

          // Create type-specific profile
          if (userType === 'dispatcher') {
            await createDispatcherProfile(dbUser.id, { specialties: [] });
          } else if (userType === 'carrier') {
            await createCarrierProfile(dbUser.id, {
              dotNumber: formData.dotNumber,
              mcNumber: formData.mcNumber,
            });
          } else {
            await createBrokerProfile(dbUser.id, {
              mcNumber: formData.mcNumber,
              dotNumber: formData.dotNumber,
              specialties: [],
            });
          }

          // Re-fetch with joined profiles for the mapper
          const fullUser = await getUserByEmail(formData.email);
          newUser = dbUserToCurrentUser(fullUser!);
        } catch (supaErr: any) {
          // Always surface database errors — never silently create local-only users
          if (supaErr?.message?.includes('already exists')) throw supaErr;
          console.error('Signup failed:', supaErr);
          throw new Error('Signup could not be completed. Please check your connection and try again.');
        }
        setCurrentUser(newUser);
        registerUser(newUser);
        setSuccess(true);

        subscribeToMailchimp({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          company: formData.companyName,
          userType,
          dotNumber: formData.dotNumber,
          mcNumber: formData.mcNumber,
          source: 'signup',
        });
      } else {
        // Login
        if (!formData.email || !formData.password) {
          throw new Error('Please enter your email and password');
        }

        let loginUser;
        try {
          const dbUser = await getUserByEmail(formData.email);
          if (!dbUser) {
            throw new Error('No account found with this email. Please sign up first.');
          }

          // Load carrier references if dispatcher
          let carrierRefs;
          if (dbUser.user_type === 'dispatcher') {
            carrierRefs = await getCarrierReferences(dbUser.id);
          }
          loginUser = dbUserToCurrentUser(dbUser, carrierRefs);
        } catch (supaErr: any) {
          if (supaErr?.message?.includes('No account found')) throw supaErr;
          console.error('Login failed:', supaErr);
          throw new Error('Login could not be completed. Please check your connection and try again.');
        }
        setCurrentUser(loginUser);
        registerUser(loginUser);
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // ------ Render Helpers ------

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

  const renderUserTypeSelector = () => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setUserType('dispatcher')}
          className={`p-4 border-2 rounded-xl text-center transition-all ${
            userType === 'dispatcher'
              ? 'border-[#3B82F6] bg-[#3B82F6]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Users className={`w-6 h-6 mx-auto mb-2 ${
            userType === 'dispatcher' ? 'text-[#3B82F6]' : 'text-gray-400'
          }`} />
          <span className={`text-sm font-semibold ${
            userType === 'dispatcher' ? 'text-[#1E3A5F]' : 'text-gray-600'
          }`}>Dispatcher</span>
        </button>
        <button
          type="button"
          onClick={() => setUserType('carrier')}
          className={`p-4 border-2 rounded-xl text-center transition-all ${
            userType === 'carrier'
              ? 'border-[#3B82F6] bg-[#3B82F6]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Truck className={`w-6 h-6 mx-auto mb-2 ${
            userType === 'carrier' ? 'text-[#3B82F6]' : 'text-gray-400'
          }`} />
          <span className={`text-sm font-semibold ${
            userType === 'carrier' ? 'text-[#1E3A5F]' : 'text-gray-600'
          }`}>Carrier</span>
        </button>
        <button
          type="button"
          onClick={() => setUserType('broker')}
          className={`p-4 border-2 rounded-xl text-center transition-all ${
            userType === 'broker'
              ? 'border-[#3B82F6] bg-[#3B82F6]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Building className={`w-6 h-6 mx-auto mb-2 ${
            userType === 'broker' ? 'text-[#3B82F6]' : 'text-gray-400'
          }`} />
          <span className={`text-sm font-semibold ${
            userType === 'broker' ? 'text-[#1E3A5F]' : 'text-gray-600'
          }`}>Broker</span>
        </button>
      </div>
    </div>
  );

  // ------ Phone Entry Step ------
  const renderPhoneEntry = () => (
    <div className="p-8">
      <button
        onClick={() => { setAuthStep('credentials'); setError(''); }}
        className="text-sm text-[#3B82F6] hover:underline mb-4 inline-block"
      >
        &larr; Back
      </button>
      <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">Phone Sign In</h2>
      <p className="text-gray-600 mb-6">Enter your phone number and we'll send you a verification code.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => { setPhoneNumber(e.target.value); setError(''); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">Include country code (e.g., +1 for US)</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleSendPhoneOtp}
          disabled={loading}
          className="w-full py-3 btn-glossy-primary rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Send Verification Code'
          )}
        </button>
      </div>
    </div>
  );

  // ------ Phone Verify Step ------
  const renderPhoneVerify = () => (
    <div className="p-8">
      <button
        onClick={() => { setAuthStep('phone-entry'); setError(''); setOtpCode(''); }}
        className="text-sm text-[#3B82F6] hover:underline mb-4 inline-block"
      >
        &larr; Back
      </button>
      <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">Enter Code</h2>
      <p className="text-gray-600 mb-6">We sent a 6-digit code to <strong>{phoneNumber}</strong></p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
          <input
            type="text"
            value={otpCode}
            onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-center text-2xl tracking-[0.5em] font-mono"
            placeholder="000000"
            maxLength={6}
            autoFocus
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleVerifyOtp}
          disabled={loading || otpCode.length < 6}
          className="w-full py-3 btn-glossy-primary rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Verify Code'
          )}
        </button>

        <button
          onClick={handleSendPhoneOtp}
          disabled={loading}
          className="w-full text-sm text-[#3B82F6] hover:underline"
        >
          Resend code
        </button>
      </div>
    </div>
  );

  // ------ Select Type Step (new Google/Phone user) ------
  const renderSelectType = () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">Complete Your Profile</h2>
      <p className="text-gray-600 mb-6">Just a few more details to set up your account.</p>

      {renderUserTypeSelector()}

      <div className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                placeholder="John"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
              placeholder="Doe"
            />
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
              placeholder="Your Company LLC"
            />
          </div>
        </div>

        {/* DOT/MC Numbers (Carrier/Broker only) */}
        {(userType === 'carrier' || userType === 'broker') && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DOT Number *</label>
              <input
                type="text"
                name="dotNumber"
                value={formData.dotNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                placeholder="DOT1234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MC Number *</label>
              <input
                type="text"
                name="mcNumber"
                value={formData.mcNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                placeholder="MC987654"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleCreateAuthUser}
          disabled={loading}
          className="w-full py-3 btn-glossy-primary rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Create Account'
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {success ? (
          /* Success State */
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">
              {mode === 'signup' || authStep === 'select-type' ? 'Account Created!' : 'Welcome Back!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {mode === 'signup' || authStep === 'select-type'
                ? 'Your account has been created successfully. You can now access the platform.'
                : 'You have been logged in successfully.'}
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 btn-glossy-primary rounded-xl transition-all"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : authStep === 'phone-entry' ? (
          renderPhoneEntry()
        ) : authStep === 'phone-verify' ? (
          renderPhoneVerify()
        ) : authStep === 'select-type' ? (
          renderSelectType()
        ) : (
          /* Credentials Form (default) */
          <div className="p-8">
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600 mb-6">
              {mode === 'login'
                ? 'Sign in to access your dashboard'
                : 'Join the free trucking professional network'}
            </p>

            {/* Social / Phone Buttons */}
            <div className="space-y-3 mb-2">
              {renderGoogleButton()}
              {renderPhoneButton()}
            </div>

            {renderDivider()}

            {/* User Type Selection (Signup only) */}
            {mode === 'signup' && renderUserTypeSelector()}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields (Signup only) */}
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              )}

              {/* Company Name (Signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                      placeholder="Your Company LLC"
                    />
                  </div>
                </div>
              )}

              {/* Phone (Signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              )}

              {/* DOT/MC Numbers (Carrier/Broker signup only) */}
              {mode === 'signup' && (userType === 'carrier' || userType === 'broker') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DOT Number *</label>
                    <input
                      type="text"
                      name="dotNumber"
                      value={formData.dotNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                      placeholder="DOT1234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MC Number *</label>
                    <input
                      type="text"
                      name="mcNumber"
                      value={formData.mcNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                      placeholder="MC987654"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Agreement Checkboxes (Signup only) */}
              {mode === 'signup' && (
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-[#3B82F6] border-gray-300 rounded focus:ring-[#3B82F6]"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the <a href="#" className="text-[#3B82F6] hover:underline">Terms of Service</a> *
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreePrivacy"
                      checked={formData.agreePrivacy}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-[#3B82F6] border-gray-300 rounded focus:ring-[#3B82F6]"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the <a href="#" className="text-[#3B82F6] hover:underline">Privacy Policy</a> *
                    </span>
                  </label>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 btn-glossy-primary rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <p className="mt-6 text-center text-sm text-gray-600">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-[#3B82F6] font-semibold hover:underline"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-[#3B82F6] font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
