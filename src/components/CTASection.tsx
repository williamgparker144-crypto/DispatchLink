import React from 'react';
import { ArrowRight, Truck, Users, Shield, Zap } from 'lucide-react';

interface CTASectionProps {
  onDispatcherSignup: () => void;
  onCarrierSignup: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onDispatcherSignup, onCarrierSignup }) => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Dispatcher CTA */}
          <div className="bg-gradient-to-br from-[#1E3A5F] to-[#1E3A5F]/80 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-[#3B82F6]">FOR DISPATCHERS</span>
              </div>
              
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Grow Your Dispatch Business
              </h3>
              <p className="text-gray-300 mb-6">
                Connect with verified carriers, build your professional network, and scale your
                dispatch operation with our free platform.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  'Social feed & networking',
                  'Verified carrier directory',
                  'Direct messaging',
                  'Compliance templates',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <Zap className="w-4 h-4 text-[#3B82F6]" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onDispatcherSignup}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-semibold hover:bg-[#2563EB] transition-colors"
                >
                  Join Free
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-blue-200 mt-3">Premium features coming with CarrierScout</p>
            </div>
          </div>

          {/* Carrier CTA */}
          <div className="bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-white/80">FOR CARRIERS</span>
              </div>
              
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Find Your Perfect Dispatcher
              </h3>
              <p className="text-white/80 mb-6">
                Join free with your DOT MC#. Browse verified dispatchers, control your 
                authority access, and grow your trucking business.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  'Free to join with DOT MC#',
                  'Browse dispatcher directory',
                  'Control MC# permissions',
                  'Professional onboarding packets',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-white" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onCarrierSignup}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#3B82F6] rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Join Free Today
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CTASection;
