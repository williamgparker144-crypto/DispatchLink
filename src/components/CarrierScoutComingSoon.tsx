import React, { useState } from 'react';
import { X, Rocket, Mail, CheckCircle, Zap, Network, TrendingUp, Shield, BarChart3, Globe } from 'lucide-react';
import { subscribeToMailchimp } from '@/lib/mailchimp';

interface CarrierScoutComingSoonProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

const CarrierScoutComingSoon: React.FC<CarrierScoutComingSoonProps> = ({ isOpen, onClose, featureName }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      subscribeToMailchimp({ email, source: 'waitlist' });
    }
  };

  const capabilities = [
    { icon: Globe, label: 'Unified Load Board Access', desc: 'Aggregate loads from every major board into one intelligent feed' },
    { icon: TrendingUp, label: 'AI-Powered Rate Intelligence', desc: 'Real-time market rates, lane analytics, and negotiation tools' },
    { icon: Network, label: 'Advanced Network Hub', desc: 'Connect dispatchers, carriers, and brokers with verified trust scores' },
    { icon: BarChart3, label: 'Complete Workflow Automation', desc: 'End-to-end load lifecycle from booking to settlement' },
    { icon: Shield, label: 'Compliance & Authority Management', desc: 'Automated FMCSA monitoring, insurance tracking, and packet management' },
    { icon: Zap, label: 'Instant Capacity Matching', desc: 'Smart algorithms pair available trucks with the highest-value freight' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1E3A5F] via-[#1E3A5F] to-emerald-700 p-8 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
            <Rocket className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold mb-1">CarrierScout</h2>
          <p className="text-blue-200 text-sm font-medium mb-4">The Complete Freight Workflow Platform</p>
          <p className="text-blue-100/90 text-sm leading-relaxed max-w-sm mx-auto">
            The trucking industry demands a unified platform that eliminates fragmented workflows.
            CarrierScout delivers the infrastructure dispatchers, carriers, and brokers need to
            operate at the highest level.
          </p>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">You're in.</h3>
              <p className="text-gray-600 mb-2">
                You'll be among the first to access CarrierScout when it launches.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Your DispatchLink profile, connections, and verified credentials carry over seamlessly.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 btn-glossy-navy rounded-xl transition-all"
              >
                Back to DispatchLink
              </button>
            </div>
          ) : (
            <>
              {/* Value proposition */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#1E3A5F] mb-1">
                  Why the industry needs CarrierScout
                </h3>
                <p className="text-sm text-gray-600">
                  Dispatchers lose hours juggling multiple load boards. Carriers miss high-value freight
                  without real-time market data. Brokers struggle to find verified, reliable capacity.
                  CarrierScout solves all of it in one platform.
                </p>
              </div>

              {/* Capabilities grid */}
              <div className="grid grid-cols-1 gap-3 mb-6">
                {capabilities.map((cap, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-[#1E3A5F]/10 rounded-lg flex-shrink-0">
                      <cap.icon className="w-4 h-4 text-[#1E3A5F]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{cap.label}</p>
                      <p className="text-xs text-gray-500">{cap.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Waitlist form */}
              <div className="bg-gradient-to-r from-[#1E3A5F]/5 to-emerald-600/5 rounded-xl p-5 mb-4">
                <p className="text-sm font-semibold text-[#1E3A5F] mb-3">
                  Get priority access when CarrierScout launches
                </p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent outline-none bg-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 btn-glossy-primary rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Rocket className="w-4 h-4" />
                    Join the Waitlist
                  </button>
                </form>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                Continue on DispatchLink
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarrierScoutComingSoon;
