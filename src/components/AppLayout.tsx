import React, { useState } from 'react';
import Header from './Header';
import Hero from './Hero';
import FeaturesSection from './FeaturesSection';
import DispatcherDirectory from './DispatcherDirectory';
import CarrierDirectory from './CarrierDirectory';
import ComplianceSection from './ComplianceSection';
import OnboardingPacket from './OnboardingPacket';
import TestimonialsSection from './TestimonialsSection';
import CTASection from './CTASection';
import MobileAppBanner from './MobileAppBanner';
import FAQSection from './FAQSection';
import Footer from './Footer';
import AuthModal from './AuthModal';
import MCPermissionModal from './MCPermissionModal';
import VerifyDOTModal from './VerifyDOTModal';
import VerifiedCarrierProfile from './VerifiedCarrierProfile';
import VerifyDOTPage from './VerifyDOTPage';
import CarrierRegistration from './CarrierRegistration';
import DispatcherDashboard from './DispatcherDashboard';
import SocialFeed from './SocialFeed';
import ConnectionsList from './ConnectionsList';
import MessagesView from './MessagesView';
import BrokerDirectory from './BrokerDirectory';
import CarrierScoutComingSoon from './CarrierScoutComingSoon';
import CarrierScoutPage from './CarrierScoutPage';
import InviteToCarrierScout from './InviteToCarrierScout';
import { ArrowLeft, Shield, Search, Rocket } from 'lucide-react';


interface CarrierProfileData {
  id: string;
  name: string;
  company: string;
  dotNumber: string;
  mcNumber: string;
}

// Premium view IDs that should trigger CarrierScout modal
const PREMIUM_VIEWS = new Set([
  'loadboards', 'carrier-loads', 'marketing', 'pricing',
  'checkout', 'subscription', 'subscription-success',
]);

// Map premium view IDs to feature names for the modal
const PREMIUM_FEATURE_NAMES: Record<string, string> = {
  loadboards: 'Load Board',
  'carrier-loads': 'Carrier Portal',
  marketing: 'Marketing Hub',
  pricing: 'Premium Plans',
  checkout: 'Premium Plans',
  subscription: 'Subscription Management',
  'subscription-success': 'Subscription Management',
};

const AppLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierProfileData | null>(null);
  const [carrierScoutModalOpen, setCarrierScoutModalOpen] = useState(false);
  const [carrierScoutFeature, setCarrierScoutFeature] = useState('');
  const [mcPermissionModal, setMcPermissionModal] = useState<{
    isOpen: boolean;
    carrierName: string;
    mcNumber: string;
  }>({ isOpen: false, carrierName: '', mcNumber: '' });
  const [inviteModal, setInviteModal] = useState<{
    isOpen: boolean;
    carrierName: string;
    mcNumber: string;
  }>({ isOpen: false, carrierName: '', mcNumber: '' });

  const handleNavigate = (view: string) => {
    if (PREMIUM_VIEWS.has(view)) {
      setCarrierScoutFeature(PREMIUM_FEATURE_NAMES[view] || 'This Feature');
      setCarrierScoutModalOpen(true);
      return;
    }
    setCurrentView(view);
  };

  const handleLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleSignup = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  const handleViewDispatcherProfile = (id: string) => {
    console.log('View dispatcher profile:', id);
  };

  const handleContactDispatcher = (id: string) => {
    console.log('Contact dispatcher:', id);
  };

  const handleViewCarrierProfile = (id: string) => {
    const carrierData: Record<string, CarrierProfileData> = {};

    setSelectedCarrier(carrierData[id] || null);
    setCurrentView('carrier-profile');
  };

  const handleRequestMCPermission = (id: string) => {
    const carrier = { name: 'Unknown Carrier', mc: 'MC000000' };
    setMcPermissionModal({
      isOpen: true,
      carrierName: carrier.name,
      mcNumber: carrier.mc,
    });
  };

  const handleMCPermissionGrant = () => {
    console.log('MC Permission granted');
  };

  const handleInviteToCarrierScout = (carrierName: string, mcNumber: string) => {
    setInviteModal({ isOpen: true, carrierName, mcNumber });
  };

  const handleVerified = (data: { dotNumber: string; mcNumber: string; companyName: string }) => {
    console.log('Verified:', data);
    setVerifyModalOpen(false);
  };

  const renderCarrierProfile = () => {
    if (!selectedCarrier) {
      return (
        <div className="py-12 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center py-12">
              <p className="text-gray-500">Carrier not found</p>
              <button
                onClick={() => setCurrentView('carriers')}
                className="mt-4 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg"
              >
                Back to Carriers
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setCurrentView('carriers')}
            className="flex items-center gap-2 text-[#1E3A5F] hover:text-[#3B82F6] mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Carrier Directory
          </button>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="h-32 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]" />
            <div className="px-6 pb-6">
              <div className="flex items-end gap-4 -mt-12">
                <div className="w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center border-4 border-white">
                  <span className="text-3xl font-bold text-[#1E3A5F]">
                    {selectedCarrier.company.charAt(0)}
                  </span>
                </div>
                <div className="pb-2">
                  <h1 className="text-2xl font-bold text-[#1E3A5F]">{selectedCarrier.company}</h1>
                  <p className="text-gray-600">{selectedCarrier.name}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#1E3A5F] mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              FMCSA Verified Information
            </h2>
            <VerifiedCarrierProfile
              dotNumber={selectedCarrier.dotNumber}
              mcNumber={selectedCarrier.mcNumber}
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-[#1E3A5F] mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleRequestMCPermission(selectedCarrier.id)}
                className="px-6 py-3 bg-[#3B82F6] text-white rounded-lg font-medium hover:bg-[#2563EB] transition-colors"
              >
                Request MC# Permission
              </button>
              <button
                onClick={() => setVerifyModalOpen(true)}
                className="px-6 py-3 bg-[#1E3A5F] text-white rounded-lg font-medium hover:bg-[#1E3A5F]/80 transition-colors flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Verify Another Carrier
              </button>
              <button
                onClick={() => handleInviteToCarrierScout(selectedCarrier.company, `MC${selectedCarrier.mcNumber}`)}
                className="px-6 py-3 border-2 border-[#3B82F6] text-[#3B82F6] rounded-lg font-medium hover:bg-[#3B82F6]/5 transition-colors flex items-center gap-2"
              >
                <Rocket className="w-5 h-5" />
                Invite to CarrierScout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DispatcherDashboard
            onNavigate={handleNavigate}
          />
        );
      case 'feed':
        return <SocialFeed />;
      case 'connections':
        return <ConnectionsList />;
      case 'messages':
        return <MessagesView />;
      case 'brokers':
        return <BrokerDirectory />;
      case 'dispatchers':
        return (
          <DispatcherDirectory
            onViewProfile={handleViewDispatcherProfile}
            onContact={handleContactDispatcher}
          />
        );
      case 'carriers':
        return (
          <CarrierDirectory
            onViewProfile={handleViewCarrierProfile}
            onRequestPermission={handleRequestMCPermission}
          />
        );
      case 'carrier-profile':
        return renderCarrierProfile();
      case 'compliance':
        return <ComplianceSection />;
      case 'packets':
        return <OnboardingPacket onComplete={() => setCurrentView('home')} />;
      case 'verify':
        return <VerifyDOTPage />;
      case 'carrier-register':
        return (
          <CarrierRegistration
            onBack={() => setCurrentView('home')}
            onComplete={() => setCurrentView('home')}
          />
        );
      case 'carrierscout':
        return <CarrierScoutPage />;
      default:
        return (
          <>
            <Hero
              onGetStarted={handleSignup}
              onLearnMore={() => setCurrentView('dispatchers')}
            />
            <FeaturesSection />
            <TestimonialsSection />
            <FAQSection />
            <MobileAppBanner />
            <CTASection onDispatcherSignup={handleSignup} onCarrierSignup={() => setCurrentView('carrier-register')} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onLoginClick={handleLogin}
        onSignupClick={handleSignup}
        currentView={currentView}
        setCurrentView={handleNavigate}
      />

      <main>
        {renderContent()}
      </main>

      <Footer onNavigate={handleNavigate} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      <MCPermissionModal
        isOpen={mcPermissionModal.isOpen}
        onClose={() => setMcPermissionModal({ ...mcPermissionModal, isOpen: false })}
        carrierName={mcPermissionModal.carrierName}
        mcNumber={mcPermissionModal.mcNumber}
        onGrant={handleMCPermissionGrant}
        onInviteToCarrierScout={handleInviteToCarrierScout}
      />

      <InviteToCarrierScout
        isOpen={inviteModal.isOpen}
        onClose={() => setInviteModal({ ...inviteModal, isOpen: false })}
        carrierName={inviteModal.carrierName}
        mcNumber={inviteModal.mcNumber}
      />

      {currentView !== 'verify' && (
        <VerifyDOTModal
          isOpen={verifyModalOpen}
          onClose={() => setVerifyModalOpen(false)}
          onVerified={handleVerified}
        />
      )}

      <CarrierScoutComingSoon
        isOpen={carrierScoutModalOpen}
        onClose={() => setCarrierScoutModalOpen(false)}
        featureName={carrierScoutFeature}
      />
    </div>
  );
};

export default AppLayout;
