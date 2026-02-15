import React, { useState } from 'react';
import { X, Mail, Lock, User, Building, Phone, Truck, Users, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { subscribeToMailchimp } from '@/lib/mailchimp';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [userType, setUserType] = useState<'dispatcher' | 'carrier' | 'broker'>('dispatcher');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
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
        if (userType === 'carrier' && (!formData.dotNumber || !formData.mcNumber)) {
          throw new Error('DOT and MC numbers are required for carriers');
        }

        // Demo mode: simulate account creation
        await new Promise(resolve => setTimeout(resolve, 1000));
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
        // Login - validate and show success
        if (!formData.email || !formData.password) {
          throw new Error('Please enter your email and password');
        }
        await new Promise(resolve => setTimeout(resolve, 800));
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
            <h2 className="text-2xl font-bold text-[#1a365d] mb-2">
              {mode === 'signup' ? 'Account Created!' : 'Welcome Back!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {mode === 'signup' 
                ? 'Your account has been created successfully. You can now access the platform.'
                : 'You have been logged in successfully.'}
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#ff6b35] text-white rounded-xl font-semibold hover:bg-[#e55a2b] transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          /* Form */
          <div className="p-8">
            <h2 className="text-2xl font-bold text-[#1a365d] mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600 mb-6">
              {mode === 'login' 
                ? 'Sign in to access your dashboard'
                : 'Join the free trucking professional network'}
            </p>

            {/* User Type Selection (Signup only) */}
            {mode === 'signup' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('dispatcher')}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${
                      userType === 'dispatcher'
                        ? 'border-[#ff6b35] bg-[#ff6b35]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Users className={`w-6 h-6 mx-auto mb-2 ${
                      userType === 'dispatcher' ? 'text-[#ff6b35]' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-semibold ${
                      userType === 'dispatcher' ? 'text-[#1a365d]' : 'text-gray-600'
                    }`}>Dispatcher</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('carrier')}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${
                      userType === 'carrier'
                        ? 'border-[#ff6b35] bg-[#ff6b35]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Truck className={`w-6 h-6 mx-auto mb-2 ${
                      userType === 'carrier' ? 'text-[#ff6b35]' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-semibold ${
                      userType === 'carrier' ? 'text-[#1a365d]' : 'text-gray-600'
                    }`}>Carrier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('broker')}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${
                      userType === 'broker'
                        ? 'border-[#ff6b35] bg-[#ff6b35]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building className={`w-6 h-6 mx-auto mb-2 ${
                      userType === 'broker' ? 'text-[#ff6b35]' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-semibold ${
                      userType === 'broker' ? 'text-[#1a365d]' : 'text-gray-600'
                    }`}>Broker</span>
                  </button>
                </div>
              </div>
            )}

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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
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
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
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
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              )}

              {/* DOT/MC Numbers (Carrier signup only) */}
              {mode === 'signup' && userType === 'carrier' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DOT Number *</label>
                    <input
                      type="text"
                      name="dotNumber"
                      value={formData.dotNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
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
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
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
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
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
                      className="mt-1 w-4 h-4 text-[#ff6b35] border-gray-300 rounded focus:ring-[#ff6b35]"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the <a href="#" className="text-[#ff6b35] hover:underline">Terms of Service</a> *
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreePrivacy"
                      checked={formData.agreePrivacy}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-[#ff6b35] border-gray-300 rounded focus:ring-[#ff6b35]"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the <a href="#" className="text-[#ff6b35] hover:underline">Privacy Policy</a> *
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
                className="w-full py-3 bg-[#ff6b35] text-white rounded-xl font-semibold hover:bg-[#e55a2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    className="text-[#ff6b35] font-semibold hover:underline"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-[#ff6b35] font-semibold hover:underline"
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
