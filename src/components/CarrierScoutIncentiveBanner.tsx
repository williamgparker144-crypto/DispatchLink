import React, { useState } from 'react';
import {
  Rocket,
  Mail,
  CheckCircle,
  ArrowRight,
  Truck,
  Building,
  Users,
} from 'lucide-react';
import { subscribeToMailchimp } from '@/lib/mailchimp';

interface CarrierScoutIncentiveBannerProps {
  userType: 'broker' | 'dispatcher' | 'carrier';
}

const INCENTIVE_CONFIG = {
  broker: {
    gradient: 'from-emerald-600 to-teal-600',
    badge: 'Coming Soon',
    headline: 'Free 30-Day Subscription on CarrierScout.vip',
    description: 'Brokers get instant access to verified carrier capacity, performance history, and streamlined onboarding -- at no cost for your first 30 days. No credit card required.',
    icon: <Building className="w-7 h-7" />,
    ctaText: 'Join the Broker Waitlist',
  },
  dispatcher: {
    gradient: 'from-blue-600 to-indigo-600',
    badge: 'Coming Soon',
    headline: '14-Day Free Trial on CarrierScout.vip',
    description: 'Dispatchers get AI rate intelligence, unified load boards, and workflow automation tools. Solidify your carrier connections with an enhanced dashboard -- free for 14 days.',
    icon: <Users className="w-7 h-7" />,
    ctaText: 'Join the Dispatcher Waitlist',
  },
  carrier: {
    gradient: 'from-[#1E3A5F] to-[#2B4F7E]',
    badge: 'Free for Carriers',
    headline: 'Free Enhanced Workflow on CarrierScout.vip',
    description: 'Carriers get matched to high-value freight, real-time market data, compliance tracking, and direct broker connections -- completely free. Your DispatchLink profile carries over.',
    icon: <Truck className="w-7 h-7" />,
    ctaText: 'Join the Carrier Waitlist',
  },
};

const CarrierScoutIncentiveBanner: React.FC<CarrierScoutIncentiveBannerProps> = ({ userType }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const config = INCENTIVE_CONFIG[userType];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      subscribeToMailchimp({ email, source: `carrierscout-${userType}-incentive` });
    }
  };

  return (
    <div className={`bg-gradient-to-r ${config.gradient} rounded-xl p-5 text-white`}>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="p-3 bg-white/10 rounded-xl flex-shrink-0">
          {config.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Rocket className="w-4 h-4" />
            <h4 className="font-semibold text-lg">{config.headline}</h4>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">{config.badge}</span>
          </div>
          <p className="text-white/80 text-sm mb-3">{config.description}</p>

          {submitted ? (
            <div className="flex items-center gap-2 text-sm bg-white/10 rounded-lg px-4 py-2">
              <CheckCircle className="w-4 h-4" />
              <span>You're on the list! We'll notify you when CarrierScout launches.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-gray-800 rounded-lg font-medium text-sm hover:bg-white/90 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                {config.ctaText} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarrierScoutIncentiveBanner;
