import React from 'react';
import {
  X,
  Rocket,
  ArrowRight,
  Users,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface CarrierScoutWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CarrierScoutWelcomeModal: React.FC<CarrierScoutWelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const benefits = [
    {
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      title: 'Dispatcher Dashboard Integration',
      desc: 'Connect with verified dispatchers who can find and book loads on your behalf using your MC# authority.',
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-emerald-600" />,
      title: 'Broker Network Access',
      desc: 'Get matched with quality brokers offering competitive rates and reliable freight opportunities.',
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-600" />,
      title: 'Solidified Connections',
      desc: 'Your DispatchLink profile and connections carry over seamlessly, strengthening your professional network.',
    },
    {
      icon: <Zap className="w-5 h-5 text-emerald-600" />,
      title: 'Enhanced Workflow',
      desc: 'Real-time market data, compliance tracking, and capacity matching -- all in one platform.',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Rocket className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome to DispatchLink!</h2>
              <p className="text-emerald-100 text-sm">Your carrier profile is ready</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 mb-5">
            Enhance your DispatchLink experience by signing up free at{' '}
            <strong className="text-emerald-700">carrierscout.vip</strong>.
            Carriers get free access to the enhanced workflow platform:
          </p>

          <div className="space-y-4 mb-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="font-medium text-[#1E3A5F] text-sm">{benefit.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-emerald-800">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>
                <strong>Free for Carriers</strong> -- No credit card required. Your DispatchLink profile and connections carry over.
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href="https://carrierscout.vip"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              Sign Up Free at CarrierScout.vip <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-3 text-gray-500 hover:text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarrierScoutWelcomeModal;
