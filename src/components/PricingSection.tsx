import React from 'react';
import { Check, Star, Zap, Crown, ArrowRight, CreditCard, Shield, Lock } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (plan: 'basic' | 'premier') => void;
  onCarrierSignup?: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan, onCarrierSignup }) => {
  const plans = [
    {
      id: 'free',
      name: 'Carrier',
      price: 0,
      period: 'Forever Free',
      description: 'For carriers with valid DOT MC# looking for dispatchers',
      icon: <Star className="w-6 h-6" />,
      features: [
        'Create verified carrier profile',
        'DOT MC# verification badge',
        'Browse dispatcher directory',
        'Receive connection requests',
        'Grant MC# permissions to dispatchers',
        'Access to carrier onboarding packets',
        'Basic loadboard integration info',
        'Community support',
      ],
      highlighted: false,
      buttonText: 'Sign Up Free',
      buttonStyle: 'bg-gray-100 text-[#1E3A5F] hover:bg-gray-200',
      isCarrier: true,
    },
    {
      id: 'basic',
      name: 'Basic Dispatcher',
      price: 19.99,
      period: '/month',
      description: 'Essential tools for dispatchers starting out',
      icon: <Zap className="w-6 h-6" />,
      features: [
        'Verified dispatcher profile',
        'Intent-data marketing hub access',
        '15-20 matched leads monthly',
        'Basic carrier search',
        'Request MC# permissions',
        'Email support',
        'Basic analytics dashboard',
        'Standard listing visibility',
      ],
      highlighted: false,
      buttonText: 'Start Basic Plan',
      buttonStyle: 'bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/80',
      isCarrier: false,
    },
    {
      id: 'premier',
      name: 'Premier Dispatcher',
      price: 49.99,
      period: '/month',
      description: 'Full access for professional dispatchers',
      icon: <Crown className="w-6 h-6" />,
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
        'White-label carrier packets',
      ],
      highlighted: true,
      buttonText: 'Start Premier Plan',
      buttonStyle: 'bg-[#3B82F6] text-white hover:bg-[#2563EB]',
      isCarrier: false,
    },
  ];

  const handlePlanClick = (plan: typeof plans[0]) => {
    if (plan.isCarrier) {
      if (onCarrierSignup) {
        onCarrierSignup();
      }
    } else if (plan.id === 'basic' || plan.id === 'premier') {
      onSelectPlan(plan.id as 'basic' | 'premier');
    }
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-[#3B82F6]/10 text-[#3B82F6] rounded-full text-sm font-semibold mb-4">
            PRICING PLANS
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1E3A5F] mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Carriers join free with DOT MC# verification. Dispatchers choose the plan that fits their business needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 transition-all ${
                plan.highlighted
                  ? 'bg-[#1E3A5F] text-white shadow-2xl scale-105 border-2 border-[#3B82F6]'
                  : 'bg-white text-[#1E3A5F] shadow-lg border border-gray-100 hover:shadow-xl'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#3B82F6] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <div className={`inline-flex p-3 rounded-xl mb-4 ${
                  plan.highlighted ? 'bg-[#3B82F6]/20' : 'bg-[#1E3A5F]/10'
                }`}>
                  <span className={plan.highlighted ? 'text-[#3B82F6]' : 'text-[#1E3A5F]'}>
                    {plan.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className={`text-sm ${plan.highlighted ? 'text-gray-300' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  {plan.price === 0 ? 'FREE' : `$${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className={`text-sm ${plan.highlighted ? 'text-gray-300' : 'text-gray-500'}`}>
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? 'text-[#3B82F6]' : 'text-green-500'
                    }`} />
                    <span className={`text-sm ${plan.highlighted ? 'text-gray-200' : 'text-gray-600'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handlePlanClick(plan)}
                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${plan.buttonStyle}`}
              >
                {!plan.isCarrier && plan.price > 0 && <CreditCard className="w-4 h-4" />}
                {plan.buttonText}
                <ArrowRight className="w-4 h-4" />
              </button>
              
              {/* Stripe badge for paid plans */}
              {plan.price > 0 && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs">
                  <Lock className={`w-3 h-3 ${plan.highlighted ? 'text-gray-400' : 'text-gray-400'}`} />
                  <span className={plan.highlighted ? 'text-gray-400' : 'text-gray-400'}>
                    Secure checkout via Stripe
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-4">
            All plans include access to our compliance resources and legal document templates.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              No setup fees
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              30-day money-back guarantee
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Secure payment processing
            </span>
          </div>
          
          {/* Payment methods */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className="text-sm text-gray-500">Accepted payment methods:</span>
            <div className="flex gap-2">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
              <div className="w-12 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded flex items-center justify-center">
                <div className="w-4 h-4 bg-red-600 rounded-full opacity-80" />
                <div className="w-4 h-4 bg-yellow-500 rounded-full -ml-2 opacity-80" />
              </div>
              <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">AMEX</div>
              <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">DISC</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
