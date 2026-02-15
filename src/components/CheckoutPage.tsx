import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  CreditCard, 
  Shield, 
  Check, 
  ArrowLeft, 
  Loader2, 
  Zap, 
  Crown,
  Lock,
  AlertCircle
} from 'lucide-react';

interface CheckoutPageProps {
  planId: 'basic' | 'premier';
  onBack: () => void;
  onSuccess: () => void;
}

const PLANS = {
  basic: {
    name: 'Basic Dispatcher',
    price: 19.99,
    icon: Zap,
    color: '#1E3A5F',
    features: [
      'Verified dispatcher profile',
      'Intent-data marketing hub access',
      '15-20 matched leads monthly',
      'Basic carrier search',
      'Request MC# permissions',
      'Email support',
      'Basic analytics dashboard',
      'Standard listing visibility'
    ]
  },
  premier: {
    name: 'Premier Dispatcher',
    price: 49.99,
    icon: Crown,
    color: '#3B82F6',
    features: [
      'Everything in Basic, plus:',
      'Full carrier marketplace access',
      '50+ matched leads monthly',
      'Advanced intent data analytics',
      'Priority carrier matching',
      'Direct messaging with carriers',
      'Loadboard API integrations',
      'Featured profile placement',
      'Priority phone support',
      'Marketing campaign tools',
      'Compliance document templates',
      'White-label carrier packets'
    ]
  }
};

const CheckoutPage: React.FC<CheckoutPageProps> = ({ planId, onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [step, setStep] = useState<'info' | 'payment'>('info');

  const plan = PLANS[planId];
  const PlanIcon = plan.icon;

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName) {
      setError('Please fill in all required fields');
      return;
    }
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }
    setError(null);
    setStep('payment');
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          action: 'create-checkout-session',
          planId,
          email,
          successUrl: `${window.location.origin}/?view=subscription-success`,
          cancelUrl: `${window.location.origin}/?view=pricing`
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to create checkout session');
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#1E3A5F] hover:text-[#3B82F6] mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Pricing
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-[#1E3A5F] mb-6">Order Summary</h2>
              
              {/* Plan Card */}
              <div className={`rounded-xl p-4 mb-6 ${planId === 'premier' ? 'bg-[#1E3A5F] text-white' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${planId === 'premier' ? 'bg-[#3B82F6]/20' : 'bg-[#1E3A5F]/10'}`}>
                    <PlanIcon className={`w-5 h-5 ${planId === 'premier' ? 'text-[#3B82F6]' : 'text-[#1E3A5F]'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className={`text-sm ${planId === 'premier' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Monthly subscription
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200/20">
                  <span className={planId === 'premier' ? 'text-gray-300' : 'text-gray-600'}>Monthly</span>
                  <span className="text-2xl font-bold">${plan.price}</span>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h4 className="font-medium text-[#1E3A5F] mb-3">What's included:</h4>
                <ul className="space-y-2">
                  {plan.features.slice(0, 6).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                  {plan.features.length > 6 && (
                    <li className="text-sm text-[#3B82F6] font-medium">
                      + {plan.features.length - 6} more features
                    </li>
                  )}
                </ul>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${plan.price}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-[#1E3A5F]">
                  <span>Total due today</span>
                  <span>${plan.price}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Then ${plan.price}/month. Cancel anytime.
                </p>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                <span>Secure checkout powered by Stripe</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Progress Steps */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`flex items-center gap-2 ${step === 'info' ? 'text-[#3B82F6]' : 'text-green-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'info' ? 'bg-[#3B82F6] text-white' : 'bg-green-500 text-white'
                  }`}>
                    {step === 'payment' ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <span className="font-medium">Your Info</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200">
                  <div className={`h-full bg-[#3B82F6] transition-all ${step === 'payment' ? 'w-full' : 'w-0'}`} />
                </div>
                <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-[#3B82F6]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'payment' ? 'bg-[#3B82F6] text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    2
                  </div>
                  <span className="font-medium">Payment</span>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium">Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {step === 'info' ? (
                <form onSubmit={handleSubmitInfo}>
                  <h2 className="text-xl font-bold text-[#1E3A5F] mb-6">Your Information</h2>
                  
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 text-[#3B82F6] border-gray-300 rounded focus:ring-[#3B82F6]"
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{' '}
                        <a href="#" className="text-[#3B82F6] hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-[#3B82F6] hover:underline">Privacy Policy</a>
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#3B82F6] text-white rounded-xl font-semibold hover:bg-[#2563EB] transition-colors"
                  >
                    Continue to Payment
                  </button>
                </form>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-[#1E3A5F] mb-6">Payment Details</h2>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium">{email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Name</span>
                      <span className="font-medium">{firstName} {lastName}</span>
                    </div>
                    <button
                      onClick={() => setStep('info')}
                      className="text-sm text-[#3B82F6] hover:underline mt-2"
                    >
                      Edit information
                    </button>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="w-5 h-5 text-[#1E3A5F]" />
                      <span className="font-medium text-[#1E3A5F]">Secure Payment</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      You'll be redirected to Stripe's secure checkout to complete your payment. 
                      Your payment information is never stored on our servers.
                    </p>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" className="h-8" />
                      <div className="flex gap-2">
                        <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                        <div className="w-10 h-6 bg-gradient-to-r from-red-500 to-yellow-500 rounded flex items-center justify-center">
                          <div className="w-3 h-3 bg-red-600 rounded-full opacity-80" />
                          <div className="w-3 h-3 bg-yellow-500 rounded-full -ml-1 opacity-80" />
                        </div>
                        <div className="w-10 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">AMEX</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep('info')}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCheckout}
                      disabled={loading}
                      className="flex-1 py-3 bg-[#3B82F6] text-white rounded-xl font-semibold hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Pay ${plan.price}
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    By clicking "Pay", you agree to be charged ${plan.price}/month until you cancel.
                    You can cancel anytime from your subscription settings.
                  </p>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-500" />
                <span>SSL encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
