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
    const carrierData: Record<string, CarrierProfileData> = {
      '1': { id: '1', name: 'Robert Thompson', company: 'Thompson Trucking LLC', dotNumber: '1234567', mcNumber: '987654' },
      '2': { id: '2', name: 'Maria Garcia', company: 'Garcia Freight Services', dotNumber: '2345678', mcNumber: '876543' },
      '3': { id: '3', name: 'William Anderson', company: 'Anderson Transport Inc', dotNumber: '3456789', mcNumber: '765432' },
      '4': { id: '4', name: 'Jennifer Taylor', company: 'Taylor Logistics', dotNumber: '4567890', mcNumber: '654321' },
      '5': { id: '5', name: 'Michael Wilson', company: 'Wilson Heavy Hauling', dotNumber: '5678901', mcNumber: '543210' },
      '6': { id: '6', name: 'Amanda Moore', company: 'Moore Express Trucking', dotNumber: '6789012', mcNumber: '432109' },
      '7': { id: '7', name: 'David Martinez', company: 'Martinez Freight LLC', dotNumber: '7890123', mcNumber: '321098' },
      '8': { id: '8', name: 'Sarah Johnson', company: 'Johnson Carriers Inc', dotNumber: '8901234', mcNumber: '210987' },
      '9': { id: '9', name: 'James Brown', company: 'Brown Transport Co', dotNumber: '9012345', mcNumber: '109876' },
      '10': { id: '10', name: 'Emily Davis', company: 'Davis Trucking Services', dotNumber: '123456', mcNumber: '98765' },
      '11': { id: '11', name: 'Christopher Lee', company: 'Lee Hauling LLC', dotNumber: '1234560', mcNumber: '987650' },
      '12': { id: '12', name: 'Jessica Thomas', company: 'Thomas Logistics Corp', dotNumber: '2345670', mcNumber: '876540' },
    };

    setSelectedCarrier(carrierData[id] || null);
    setCurrentView('carrier-profile');
  };

  const handleRequestMCPermission = (id: string) => {
    const carrierNames: Record<string, { name: string; mc: string }> = {
      '1': { name: 'Thompson Trucking LLC', mc: 'MC987654' },
      '2': { name: 'Garcia Freight Services', mc: 'MC876543' },
      '3': { name: 'Anderson Transport Inc', mc: 'MC765432' },
    };

    const carrier = carrierNames[id] || { name: 'Unknown Carrier', mc: 'MC000000' };
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
                className="mt-4 px-4 py-2 bg-[#1a365d] text-white rounded-lg"
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
            className="flex items-center gap-2 text-[#1a365d] hover:text-[#ff6b35] mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Carrier Directory
          </button>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="h-32 bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a]" />
            <div className="px-6 pb-6">
              <div className="flex items-end gap-4 -mt-12">
                <div className="w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center border-4 border-white">
                  <span className="text-3xl font-bold text-[#1a365d]">
                    {selectedCarrier.company.charAt(0)}
                  </span>
                </div>
                <div className="pb-2">
                  <h1 className="text-2xl font-bold text-[#1a365d]">{selectedCarrier.company}</h1>
                  <p className="text-gray-600">{selectedCarrier.name}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#1a365d] mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              FMCSA Verified Information
            </h2>
            <VerifiedCarrierProfile
              dotNumber={selectedCarrier.dotNumber}
              mcNumber={selectedCarrier.mcNumber}
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-[#1a365d] mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleRequestMCPermission(selectedCarrier.id)}
                className="px-6 py-3 bg-[#ff6b35] text-white rounded-lg font-medium hover:bg-[#e55a2b] transition-colors"
              >
                Request MC# Permission
              </button>
              <button
                onClick={() => setVerifyModalOpen(true)}
                className="px-6 py-3 bg-[#1a365d] text-white rounded-lg font-medium hover:bg-[#2d4a6f] transition-colors flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Verify Another Carrier
              </button>
              <button
                onClick={() => handleInviteToCarrierScout(selectedCarrier.company, `MC${selectedCarrier.mcNumber}`)}
                className="px-6 py-3 border-2 border-[#ff6b35] text-[#ff6b35] rounded-lg font-medium hover:bg-[#ff6b35]/5 transition-colors flex items-center gap-2"
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
