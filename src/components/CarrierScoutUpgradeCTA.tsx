import React from 'react';
import { Rocket, ArrowRight } from 'lucide-react';

interface CarrierScoutUpgradeCTAProps {
  featureName: string;
  onGetNotified: () => void;
}

const CarrierScoutUpgradeCTA: React.FC<CarrierScoutUpgradeCTAProps> = ({ featureName, onGetNotified }) => {
  return (
    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-teal-100 rounded-lg flex-shrink-0">
          <Rocket className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-teal-900 mb-1">
            Unlock {featureName} with CarrierScout
          </h4>
          <p className="text-sm text-teal-700 mb-3">
            Premium marketplace features are coming soon. Your DispatchLink profile and connections carry over.
          </p>
          <button
            onClick={onGetNotified}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            Get Notified
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarrierScoutUpgradeCTA;
