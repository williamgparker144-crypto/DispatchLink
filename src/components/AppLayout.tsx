import React, { useState, useEffect } from 'react';
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
import SettingsPage from './SettingsPage';
import CarrierRegistration from './CarrierRegistration';
import DispatcherDashboard from './DispatcherDashboard';
import SocialFeed from './SocialFeed';
import ConnectionsList from './ConnectionsList';
import MessagesView from './MessagesView';
import BrokerDirectory from './BrokerDirectory';
import CarrierScoutComingSoon from './CarrierScoutComingSoon';
import CarrierScoutPage from './CarrierScoutPage';
import InviteToCarrierScout from './InviteToCarrierScout';
import UserProfile from './UserProfile';
import ViewUserProfile from './ViewUserProfile';
import BrowseNetworkPage from './BrowseNetworkPage';
import AdvertisingPage from './AdvertisingPage';
import AdvertiserAuthModal from './AdvertiserAuthModal';
import CarrierScoutWelcomeModal from './CarrierScoutWelcomeModal';
import AdvertiserDashboard from './AdvertiserDashboard';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import TermsOfServicePage from './TermsOfServicePage';
import Dispatch101Page from './Dispatch101Page';
import { useAppContext } from '@/contexts/AppContext';
import { computeVerificationTier, crossReferenceCarriers } from '@/lib/verification';
import { getUserById, getOrCreateConversation } from '@/lib/api';
import { dbUserToCurrentUser } from '@/lib/mappers';
import type { ViewableUser } from '@/types';
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
  const { currentUser, registeredUsers, pendingAuthResult, clearPendingAuthResult } = useAppContext();
  const [currentView, setCurrentView] = useState('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierProfileData | null>(null);
  const [carrierScoutModalOpen, setCarrierScoutModalOpen] = useState(false);
  const [carrierScoutFeature, setCarrierScoutFeature] = useState('');
  const [viewingUser, setViewingUser] = useState<ViewableUser | null>(null);
  const [previousView, setPreviousView] = useState('home');
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
  const [initialSearchQuery, setInitialSearchQuery] = useState('');
  const [searchKey, setSearchKey] = useState(0);
  const [advertiserAuthOpen, setAdvertiserAuthOpen] = useState(false);
  const [advertiserAuthMode, setAdvertiserAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [carrierWelcomeOpen, setCarrierWelcomeOpen] = useState(false);
  const [verifyInitialDOT, setVerifyInitialDOT] = useState('');
  const [verifyInitialMC, setVerifyInitialMC] = useState('');

  // Auto-open AuthModal for new Google/Phone users who need to complete profile
  useEffect(() => {
    if (pendingAuthResult) {
      setAuthMode('signup');
      setAuthModalOpen(true);
    }
  }, [pendingAuthResult]);

  const handleOpenAdvertiserAuth = (mode: 'login' | 'signup') => {
    setAdvertiserAuthMode(mode);
    setAdvertiserAuthOpen(true);
  };

  const handleNavigate = (view: string) => {
    // Logged-in dispatchers: redirect load search to their dashboard Find Loads tab
    if ((view === 'loadboards' || view === 'carrier-loads') && currentUser?.userType === 'dispatcher') {
      setCurrentView('dashboard');
      return;
    }
    if (PREMIUM_VIEWS.has(view)) {
      setCarrierScoutFeature(PREMIUM_FEATURE_NAMES[view] || 'This Feature');
      setCarrierScoutModalOpen(true);
      return;
    }
    // Redirect advertisers to their dashboard when they hit the advertising page
    if (view === 'advertising' && currentUser?.userType === 'advertiser') {
      setCurrentView('advertiser-dashboard');
      return;
    }
    // Clear search query when navigating away from search results
    if (view !== 'dispatchers' && view !== 'carriers' && view !== 'brokers') {
      setInitialSearchQuery('');
    }
    // Clear conversation ID when navigating away from messages
    if (view !== 'messages') {
      setSelectedConversationId(null);
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

  const handleHeroSearch = (query: string, role: string, _region: string) => {
    // Carrier/Broker searches go to FMCSA verification
    if (role === 'carrier' || role === 'broker') {
      const digits = query.replace(/[^0-9]/g, '');
      // Determine if query looks like a DOT# (7+ digits) or MC# (4-8 digits) or just a name
      if (digits.length >= 7) {
        // Likely a DOT number
        setVerifyInitialDOT(digits);
        setVerifyInitialMC('');
      } else if (digits.length >= 4) {
        // Likely an MC number
        setVerifyInitialDOT('');
        setVerifyInitialMC(digits);
      } else {
        // Non-numeric or short — still send to verify page, user can enter manually
        setVerifyInitialDOT('');
        setVerifyInitialMC('');
      }
      setSearchKey(k => k + 1);
      setCurrentView('verify');
      return;
    }
    // Dispatcher searches go to dispatcher directory
    setInitialSearchQuery(query);
    setSearchKey(k => k + 1);
    setCurrentView('dispatchers');
  };

  const handleViewDispatcherProfile = async (id: string) => {
    let user = registeredUsers.find(u => u.id === id);

    // If not found locally, fetch from Supabase
    if (!user) {
      try {
        const dbUser = await getUserById(id);
        if (!dbUser) return;
        user = dbUserToCurrentUser(dbUser as any);
      } catch {
        return;
      }
    }

    // Cross-reference carriers for verification tier
    const carrierMCs = new Set<string>();
    registeredUsers.forEach(u => {
      if (u.userType === 'carrier' && u.mcNumber) {
        carrierMCs.add(u.mcNumber.toUpperCase());
      }
    });

    const carriers = user.carriersWorkedWith
      ? crossReferenceCarriers(user.carriersWorkedWith, carrierMCs)
      : [];
    const enriched = { ...user, carriersWorkedWith: carriers };
    const tier = computeVerificationTier(enriched);

    const viewable: ViewableUser = {
      id: user.id,
      name: user.name,
      company: user.company,
      userType: user.userType,
      image: user.image,
      verified: user.verified,
      bio: user.bio,
      location: user.location,
      website: user.website,
      coverImage: user.coverImage,
      yearsExperience: user.yearsExperience,
      specialties: user.specialties,
      carriersWorkedWith: carriers,
      carrierScoutSubscribed: user.carrierScoutSubscribed,
      verificationTier: tier,
    };

    handleViewUserProfile(viewable);
  };

  const handleContactDispatcher = async (id: string) => {
    if (!currentUser) {
      // Not logged in — open signup
      handleSignup();
      return;
    }
    try {
      const conv = await getOrCreateConversation(currentUser.id, id);
      setSelectedConversationId(conv.id);
      setCurrentView('messages');
    } catch {
      // Fallback: just navigate to messages
      setCurrentView('messages');
    }
  };

  const handleViewCarrierProfile = async (id: string) => {
    let user = registeredUsers.find(u => u.id === id);

    // If not found locally, fetch from Supabase
    if (!user) {
      try {
        const dbUser = await getUserById(id);
        if (!dbUser) return;
        user = dbUserToCurrentUser(dbUser as any);
      } catch {
        return;
      }
    }

    const viewable: ViewableUser = {
      id: user.id,
      name: user.name,
      company: user.company,
      userType: user.userType,
      image: user.image,
      verified: user.verified,
      bio: user.bio,
      location: user.location,
      website: user.website,
      coverImage: user.coverImage,
    };

    handleViewUserProfile(viewable);
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

  const handleViewUserProfile = (user: ViewableUser) => {
    if (currentUser && user.id === currentUser.id) {
      setCurrentView('profile');
      return;
    }
    setViewingUser(user);
    setPreviousView(currentView);
    setCurrentView('view-user');
  };

  const handleVerified = (data: { dotNumber: string; mcNumber: string; companyName: string }) => {
    console.log('Verified:', data);
    setVerifyModalOpen(false);
  };

  const renderCarrierProfile = () => {
    if (!selectedCarrier) {
      return (
        <div className="py-12 page-bg min-h-screen">
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
      <div className="py-12 page-bg min-h-screen">
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
      case 'profile':
        return <UserProfile onNavigate={handleNavigate} onViewProfile={handleViewUserProfile} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      case 'view-user':
        return viewingUser ? (
          <ViewUserProfile
            user={viewingUser}
            onBack={() => {
              setCurrentView(previousView);
              setViewingUser(null);
            }}
            onNavigate={handleNavigate}
            currentUserId={currentUser?.id}
            onOpenConversation={(convId) => {
              setSelectedConversationId(convId);
              setCurrentView('messages');
            }}
          />
        ) : null;
      case 'feed':
        return <SocialFeed onNavigate={handleNavigate} onViewProfile={handleViewUserProfile} />;
      case 'advertiser-dashboard':
        return <AdvertiserDashboard />;
      case 'advertising':
        return <AdvertisingPage onNavigate={handleNavigate} onOpenAdvertiserAuth={handleOpenAdvertiserAuth} />;
      case 'connections':
        return <ConnectionsList onViewProfile={handleViewUserProfile} />;
      case 'messages':
        return <MessagesView initialConversationId={selectedConversationId} />;
      case 'browse-network':
        return <BrowseNetworkPage onViewProfile={handleViewDispatcherProfile} onNavigate={handleNavigate} onSignup={handleSignup} />;
      case 'brokers':
        return (
          <BrokerDirectory
            key={searchKey}
            initialSearchQuery={initialSearchQuery}
            onViewProfile={handleViewCarrierProfile}
            onVerifyBroker={(dot, mc) => {
              setVerifyInitialDOT(dot);
              setVerifyInitialMC(mc);
              setSearchKey(Date.now());
              setCurrentView('verify');
            }}
          />
        );
      case 'dispatchers':
        return (
          <DispatcherDirectory
            key={searchKey}
            onViewProfile={handleViewDispatcherProfile}
            onContact={handleContactDispatcher}
            initialSearchQuery={initialSearchQuery}
          />
        );
      case 'carriers':
        return (
          <CarrierDirectory
            key={searchKey}
            onViewProfile={handleViewCarrierProfile}
            onRequestPermission={handleRequestMCPermission}
            onVerifyCarrier={(dot, mc) => {
              setVerifyInitialDOT(dot);
              setVerifyInitialMC(mc);
              setSearchKey(Date.now());
              setCurrentView('verify');
            }}
            initialSearchQuery={initialSearchQuery}
          />
        );
      case 'carrier-profile':
        return renderCarrierProfile();
      case 'compliance':
        return <ComplianceSection />;
      case 'packets':
        return <OnboardingPacket onComplete={() => setCurrentView('home')} />;
      case 'verify':
        return <VerifyDOTPage key={searchKey} initialDOT={verifyInitialDOT} initialMC={verifyInitialMC} />;
      case 'carrier-register':
        return (
          <CarrierRegistration
            onBack={() => setCurrentView('home')}
            onComplete={() => setCurrentView('home')}
          />
        );
      case 'carrierscout':
        return <CarrierScoutPage />;
      case 'dispatch-101':
        return <Dispatch101Page onNavigate={handleNavigate} />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsOfServicePage />;
      default:
        return (
          <>
            <Hero
              onGetStarted={handleSignup}
              onLearnMore={() => setCurrentView('browse-network')}
              onSearch={handleHeroSearch}
              onViewProfile={handleViewDispatcherProfile}
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
        onClose={() => {
          setAuthModalOpen(false);
          clearPendingAuthResult();
          if (currentUser) {
            setCurrentView('dashboard');
            // Show CarrierScout welcome modal for new carriers (once per device)
            if (currentUser.userType === 'carrier') {
              const shown = localStorage.getItem('dispatchlink_carrier_welcome_shown');
              if (!shown) {
                setCarrierWelcomeOpen(true);
                localStorage.setItem('dispatchlink_carrier_welcome_shown', 'true');
              }
            }
          }
        }}
        initialMode={authMode}
        pendingAuth={pendingAuthResult}
      />

      <AdvertiserAuthModal
        isOpen={advertiserAuthOpen}
        onClose={() => {
          setAdvertiserAuthOpen(false);
          if (currentUser?.userType === 'advertiser') {
            setCurrentView('advertiser-dashboard');
          }
        }}
        initialMode={advertiserAuthMode}
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

      <CarrierScoutWelcomeModal
        isOpen={carrierWelcomeOpen}
        onClose={() => setCarrierWelcomeOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
