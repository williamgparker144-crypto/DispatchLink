import React, { useState } from 'react';
import { Rocket, ArrowRight, Mail, CheckCircle } from 'lucide-react';

interface CarrierScoutUpgradeCTAProps {
  featureName: string;
  onGetNotified: () => void;
}

const CarrierScoutUpgradeCTA: React.FC<CarrierScoutUpgradeCTAProps> = ({ featureName }) => {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 rounded-xl flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-semibold text-emerald-900">You're on the list!</h4>
            <p className="text-sm text-emerald-700">We'll notify you when {featureName} launches on CarrierScout.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-emerald-100 rounded-xl flex-shrink-0">
          <Rocket className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-emerald-900 mb-1">
            Unlock {featureName} with CarrierScout
          </h4>
          <p className="text-sm text-emerald-700 mb-3">
            Premium marketplace features are coming soon. Your DispatchLink profile and connections carry over.
          </p>

          {showEmailInput ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 btn-glossy-emerald rounded-xl text-sm flex items-center gap-1.5"
              >
                <Rocket className="w-4 h-4" />
                Join
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowEmailInput(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 btn-glossy-emerald rounded-xl text-sm"
            >
              Get Notified
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarrierScoutUpgradeCTA;
