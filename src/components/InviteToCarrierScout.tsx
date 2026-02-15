import React, { useState } from 'react';
import { X, Rocket, Mail, Phone, Send, CheckCircle, AlertCircle, Loader2, ChevronRight, Eye } from 'lucide-react';
import { subscribeToMailchimp } from '@/lib/mailchimp';

interface InviteToCarrierScoutProps {
  isOpen: boolean;
  onClose: () => void;
  carrierName: string;
  mcNumber: string;
}

type Step = 'info' | 'contact' | 'preview' | 'success';

const InviteToCarrierScout: React.FC<InviteToCarrierScoutProps> = ({
  isOpen,
  onClose,
  carrierName,
  mcNumber,
}) => {
  const [step, setStep] = useState<Step>('info');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sendSms, setSendSms] = useState(false);
  const [personalMessage, setPersonalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetAndClose = () => {
    setStep('info');
    setEmail('');
    setPhone('');
    setSendSms(false);
    setPersonalMessage('');
    setError('');
    setLoading(false);
    onClose();
  };

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSendInvite = async () => {
    setLoading(true);
    setError('');

    // Demo mode: simulate sending invitation
    await new Promise(resolve => setTimeout(resolve, 1200));
    setStep('success');
    setLoading(false);

    subscribeToMailchimp({
      email,
      phone,
      company: carrierName,
      mcNumber,
      source: 'invite',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetAndClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Step 1: Info */}
        {step === 'info' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#ff6b35]/10 rounded-xl">
                <Rocket className="w-6 h-6 text-[#ff6b35]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1a365d]">Invite to CarrierScout</h2>
                <p className="text-sm text-gray-500">Help this carrier get on the platform</p>
              </div>
            </div>

            {/* Carrier Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Carrier</p>
                  <p className="font-semibold text-[#1a365d]">{carrierName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">MC Number</p>
                  <p className="font-semibold text-[#1a365d]">{mcNumber}</p>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="mb-6">
              <h3 className="font-semibold text-[#1a365d] mb-3">Why invite this carrier?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-[#ff6b35]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#ff6b35] font-bold text-xs">1</span>
                  </div>
                  <p>You have MC# permission from this carrier, but they need a <strong>CarrierScout account</strong> to access load boards and rate tools.</p>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-[#ff6b35]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#ff6b35] font-bold text-xs">2</span>
                  </div>
                  <p>Once they sign up, you'll be able to book loads, negotiate rates, and manage freight together seamlessly.</p>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-[#ff6b35]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#ff6b35] font-bold text-xs">3</span>
                  </div>
                  <p>We'll send them a professional invitation email explaining CarrierScout and how to get started.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('contact')}
              className="w-full py-3 bg-[#ff6b35] text-white rounded-xl font-medium hover:bg-[#e55a2b] transition-colors flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Contact */}
        {step === 'contact' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#1a365d]/10 rounded-xl">
                <Mail className="w-6 h-6 text-[#1a365d]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1a365d]">Contact Details</h2>
                <p className="text-sm text-gray-500">How should we reach {carrierName}?</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carrier@example.com"
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* SMS Toggle */}
              {phone && (
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={sendSms}
                    onChange={(e) => setSendSms(e.target.checked)}
                    className="w-4 h-4 text-[#ff6b35] rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Also send SMS notification</span>
                    <p className="text-xs text-gray-500">A short text message will be sent with a link to sign up</p>
                  </div>
                </label>
              )}

              {/* Personal Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Add a personal note to the invitation..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{personalMessage.length}/500 characters</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('info')}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep('preview')}
                disabled={!email || !isValidEmail(email)}
                className="flex-1 py-3 bg-[#ff6b35] text-white rounded-xl font-medium hover:bg-[#e55a2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Preview
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1a365d]">Review Invitation</h2>
                <p className="text-sm text-gray-500">Confirm before sending</p>
              </div>
            </div>

            {/* Preview Card */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-[#1a365d] to-[#2d4a6f] p-4 text-center">
                <p className="text-white font-bold text-lg">You're Invited to CarrierScout</p>
                <p className="text-blue-200 text-sm">by DispatchLink</p>
              </div>
              <div className="p-4 bg-gray-50 text-sm text-gray-600 space-y-3">
                <p>Hi <strong>{carrierName}</strong> ({mcNumber}),</p>
                <p>A dispatcher on DispatchLink wants to work with you and has invited you to join CarrierScout.</p>
                {personalMessage && (
                  <div className="bg-white border-l-4 border-[#ff6b35] p-3 italic">
                    "{personalMessage}"
                  </div>
                )}
                <div className="text-center py-2">
                  <span className="inline-block bg-[#ff6b35] text-white px-6 py-2 rounded-lg font-medium text-sm">
                    Join CarrierScout
                  </span>
                </div>
              </div>
            </div>

            {/* Sending Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email to:</span>
                <span className="font-medium text-gray-700">{email}</span>
              </div>
              {sendSms && phone && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">SMS to:</span>
                  <span className="font-medium text-gray-700">{phone}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Carrier:</span>
                <span className="font-medium text-gray-700">{carrierName}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('contact')}
                disabled={loading}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleSendInvite}
                disabled={loading}
                className="flex-1 py-3 bg-[#ff6b35] text-white rounded-xl font-medium hover:bg-[#e55a2b] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-[#1a365d] mb-2">Invitation Sent!</h2>
            <p className="text-gray-600 mb-2">
              We've sent a CarrierScout invitation to <strong>{carrierName}</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You'll be notified when they sign up. The invitation expires in 30 days.
            </p>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> You can track the status of your invitations from your dashboard.
              </p>
            </div>

            <button
              onClick={resetAndClose}
              className="w-full py-3 bg-[#1a365d] text-white rounded-xl font-medium hover:bg-[#2d4a6f] transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteToCarrierScout;
