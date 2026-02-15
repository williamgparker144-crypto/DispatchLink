import React, { useState } from 'react';
import { X, Shield, AlertTriangle, CheckCircle, FileText, Clock, Rocket } from 'lucide-react';

interface MCPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  carrierName: string;
  mcNumber: string;
  onGrant: () => void;
  onInviteToCarrierScout?: (carrierName: string, mcNumber: string) => void;
}

const MCPermissionModal: React.FC<MCPermissionModalProps> = ({
  isOpen,
  onClose,
  carrierName,
  mcNumber,
  onGrant,
  onInviteToCarrierScout,
}) => {
  const [step, setStep] = useState<'review' | 'confirm' | 'success'>('review');
  const [signatureName, setSignatureName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (signatureName.trim() && agreedToTerms) {
      setStep('success');
      setTimeout(() => {
        onGrant();
        onClose();
        setStep('review');
        setSignatureName('');
        setAgreedToTerms(false);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {step === 'review' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#3B82F6]/10 rounded-xl">
                <Shield className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1E3A5F]">MC# Permission Request</h2>
                <p className="text-sm text-gray-500">Review before granting access</p>
              </div>
            </div>

            {/* Permission Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Carrier</p>
                  <p className="font-semibold text-[#1E3A5F]">{carrierName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">MC Number</p>
                  <p className="font-semibold text-[#1E3A5F]">{mcNumber}</p>
                </div>
              </div>
            </div>

            {/* What This Allows */}
            <div className="mb-6">
              <h3 className="font-semibold text-[#1E3A5F] mb-3">This permission allows:</h3>
              <ul className="space-y-2">
                {[
                  'Access to book loads using your MC# on loadboards',
                  'Negotiate rates with brokers on your behalf',
                  'View available loads matching your equipment',
                  'Communicate with shippers/brokers as your representative',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Important</h4>
                  <p className="text-sm text-yellow-700">
                    You remain responsible for all loads booked under your authority. 
                    You can revoke this permission at any time from your dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="flex-1 py-3 bg-[#3B82F6] text-white rounded-xl font-medium hover:bg-[#2563EB] transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#1E3A5F]/10 rounded-xl">
                <FileText className="w-6 h-6 text-[#1E3A5F]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1E3A5F]">Digital Consent</h2>
                <p className="text-sm text-gray-500">Sign to grant permission</p>
              </div>
            </div>

            {/* Consent Text */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-700 max-h-48 overflow-y-auto">
              <p className="mb-3">
                <strong>MC# ACCESS CONSENT FORM</strong>
              </p>
              <p className="mb-3">
                I, the undersigned, hereby grant permission to the requesting dispatcher to use my 
                Motor Carrier (MC) number for the purpose of booking freight loads on my behalf through 
                various loadboard platforms and direct broker relationships.
              </p>
              <p className="mb-3">
                I understand that:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>I remain fully responsible for all loads booked under my authority</li>
                <li>I can revoke this permission at any time</li>
                <li>This permission does not transfer my operating authority</li>
                <li>All activities will be logged for audit purposes</li>
              </ul>
              <p>
                This consent is valid until revoked by me or until the dispatcher relationship is terminated.
              </p>
            </div>

            {/* Signature */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type your full legal name to sign *
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                  placeholder="Your Full Legal Name"
                />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#3B82F6] rounded"
                />
                <span className="text-sm text-gray-600">
                  I confirm that I am authorized to grant this permission and understand the terms above.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('review')}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={!signatureName.trim() || !agreedToTerms}
                className="flex-1 py-3 bg-[#3B82F6] text-white rounded-xl font-medium hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Grant Permission
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-[#1E3A5F] mb-2">Permission Granted!</h2>
            <p className="text-gray-600 mb-4">
              The dispatcher now has access to book loads using your MC#.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
              <Clock className="w-4 h-4" />
              <span>This action has been logged for your records</span>
            </div>

            {onInviteToCarrierScout && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="w-5 h-5 text-[#3B82F6]" />
                  <p className="font-semibold text-sm text-gray-800">This carrier isn't on CarrierScout yet</p>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Invite them to CarrierScout for load board access and rate tools.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    setStep('review');
                    setSignatureName('');
                    setAgreedToTerms(false);
                    onInviteToCarrierScout(carrierName, mcNumber);
                  }}
                  className="w-full py-2.5 bg-[#3B82F6] text-white rounded-lg font-medium hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Rocket className="w-4 h-4" />
                  Invite to CarrierScout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MCPermissionModal;
