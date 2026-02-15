import React, { useState } from 'react';
import { 
  FileText, Upload, CheckCircle, Clock, AlertCircle, 
  Download, ChevronRight, Shield, Building, Truck 
} from 'lucide-react';

interface OnboardingPacketProps {
  onComplete: () => void;
}

const OnboardingPacket: React.FC<OnboardingPacketProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState({
    w9: false,
    insurance: false,
    authority: false,
    agreement: false,
  });
  const [agreementSigned, setAgreementSigned] = useState(false);
  const [signatureName, setSignatureName] = useState('');

  const steps = [
    { id: 1, title: 'Company Info', icon: <Building className="w-5 h-5" /> },
    { id: 2, title: 'Documents', icon: <FileText className="w-5 h-5" /> },
    { id: 3, title: 'Agreement', icon: <Shield className="w-5 h-5" /> },
    { id: 4, title: 'Complete', icon: <CheckCircle className="w-5 h-5" /> },
  ];

  const requiredDocs = [
    { id: 'w9', name: 'W-9 Form', description: 'IRS tax identification form', required: true },
    { id: 'insurance', name: 'Certificate of Insurance', description: 'Current insurance certificate with coverage details', required: true },
    { id: 'authority', name: 'Operating Authority', description: 'MC/DOT authority documentation', required: true },
    { id: 'agreement', name: 'Signed Agreement', description: 'Dispatcher-carrier service agreement', required: true },
  ];

  const handleFileUpload = (docId: string) => {
    // Simulate file upload
    setDocuments(prev => ({ ...prev, [docId]: true }));
  };

  const handleSignAgreement = () => {
    if (signatureName.trim()) {
      setAgreementSigned(true);
      setDocuments(prev => ({ ...prev, agreement: true }));
    }
  };

  const allDocsComplete = Object.values(documents).every(Boolean);

  return (
    <section className="py-12 page-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#3B82F6]/10 px-4 py-2 rounded-full mb-4">
            <Truck className="w-5 h-5 text-[#3B82F6]" />
            <span className="text-sm font-medium text-[#3B82F6]">Carrier Onboarding</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Carrier Packet</h1>
          <p className="text-gray-600">Complete your onboarding to start working with dispatchers</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-4 shadow-sm">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step.id 
                    ? 'bg-[#3B82F6] text-white' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className={`hidden sm:block text-sm font-medium ${
                  currentStep >= step.id ? 'text-[#1E3A5F]' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded ${
                  currentStep > step.id ? 'bg-[#3B82F6]' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Step 1: Company Info */}
          {currentStep === 1 && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#1E3A5F] mb-6">Company Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                    placeholder="Your Company LLC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DOT Number *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                    placeholder="DOT1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MC Number *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                    placeholder="MC987654"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fleet Size</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                    placeholder="10"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Types</label>
                  <div className="flex flex-wrap gap-2">
                    {['Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Tanker', 'Hazmat'].map((type) => (
                      <label key={type} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <input type="checkbox" className="w-4 h-4 text-[#3B82F6] rounded" />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 bg-[#3B82F6] text-white rounded-lg font-medium hover:bg-[#2563EB] transition-colors flex items-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {currentStep === 2 && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#1E3A5F] mb-2">Required Documents</h2>
              <p className="text-gray-600 mb-6">Upload the following documents to complete your carrier packet</p>
              
              <div className="space-y-4">
                {requiredDocs.slice(0, 3).map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-4 border-2 rounded-xl transition-colors ${
                      documents[doc.id as keyof typeof documents]
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 hover:border-[#3B82F6]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          documents[doc.id as keyof typeof documents]
                            ? 'bg-green-100'
                            : 'bg-gray-100'
                        }`}>
                          {documents[doc.id as keyof typeof documents] ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <FileText className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1E3A5F]">{doc.name}</h3>
                          <p className="text-sm text-gray-500">{doc.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {documents[doc.id as keyof typeof documents] ? (
                          <span className="text-sm text-green-600 font-medium">Uploaded</span>
                        ) : (
                          <>
                            <button className="px-3 py-1.5 text-sm text-[#1E3A5F] hover:bg-gray-100 rounded-lg flex items-center gap-1">
                              <Download className="w-4 h-4" />
                              Template
                            </button>
                            <button
                              onClick={() => handleFileUpload(doc.id)}
                              className="px-4 py-1.5 bg-[#1E3A5F] text-white text-sm rounded-lg hover:bg-[#1E3A5F]/80 flex items-center gap-1"
                            >
                              <Upload className="w-4 h-4" />
                              Upload
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!documents.w9 || !documents.insurance || !documents.authority}
                  className="px-6 py-2.5 bg-[#3B82F6] text-white rounded-lg font-medium hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Agreement */}
          {currentStep === 3 && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#1E3A5F] mb-2">Service Agreement</h2>
              <p className="text-gray-600 mb-6">Review and sign the dispatcher-carrier service agreement</p>

              <div className="bg-gray-50 rounded-xl p-6 mb-6 max-h-64 overflow-y-auto text-sm text-gray-700">
                <h3 className="font-bold mb-4">DISPATCHER-CARRIER SERVICE AGREEMENT</h3>
                <p className="mb-4">
                  This Agreement is entered into between the Carrier ("Carrier") and the Dispatcher ("Dispatcher") 
                  for the purpose of establishing terms for dispatch services.
                </p>
                <h4 className="font-semibold mb-2">1. SERVICES</h4>
                <p className="mb-4">
                  Dispatcher agrees to provide freight dispatch services to Carrier, including but not limited to: 
                  finding and booking loads, negotiating rates, and coordinating pickup and delivery schedules.
                </p>
                <h4 className="font-semibold mb-2">2. MC# AUTHORIZATION</h4>
                <p className="mb-4">
                  Carrier grants Dispatcher permission to use Carrier's MC# for the purpose of booking loads on 
                  loadboards and with brokers/shippers. This permission may be revoked at any time by Carrier.
                </p>
                <h4 className="font-semibold mb-2">3. COMPENSATION</h4>
                <p className="mb-4">
                  Dispatcher compensation shall be agreed upon separately and documented in writing. Standard 
                  industry rates apply unless otherwise specified.
                </p>
                <h4 className="font-semibold mb-2">4. COMPLIANCE</h4>
                <p className="mb-4">
                  Both parties agree to comply with all applicable federal, state, and local regulations, 
                  including but not limited to FMCSA regulations.
                </p>
                <h4 className="font-semibold mb-2">5. LIMITATION OF LIABILITY</h4>
                <p className="mb-4">
                  Neither party shall be liable for indirect, incidental, or consequential damages. 
                  Carrier maintains responsibility for all cargo and operations.
                </p>
              </div>

              {!agreementSigned ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type your full legal name to sign *
                    </label>
                    <input
                      type="text"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="mt-1 w-4 h-4 text-[#3B82F6] rounded" />
                    <span className="text-sm text-gray-600">
                      I have read and agree to the terms of this Service Agreement. I understand that by typing 
                      my name above, I am providing my electronic signature.
                    </span>
                  </label>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Agreement Signed</p>
                    <p className="text-sm text-green-600">Signed by: {signatureName}</p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                {!agreementSigned ? (
                  <button
                    onClick={handleSignAgreement}
                    disabled={!signatureName.trim()}
                    className="px-6 py-2.5 bg-[#3B82F6] text-white rounded-lg font-medium hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sign Agreement
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2.5 bg-[#3B82F6] text-white rounded-lg font-medium hover:bg-[#2563EB] transition-colors flex items-center gap-2"
                  >
                    Complete Onboarding
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">Onboarding Complete!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your carrier packet has been submitted successfully. You can now connect with dispatchers 
                and grant MC# permissions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onComplete}
                  className="px-6 py-3 bg-[#3B82F6] text-white rounded-lg font-medium hover:bg-[#2563EB] transition-colors"
                >
                  Go to Dashboard
                </button>
                <button className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Browse Dispatchers
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default OnboardingPacket;
