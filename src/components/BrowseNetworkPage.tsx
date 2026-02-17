import React, { useState, useEffect } from 'react';
import {
  Users,
  Truck,
  Building,
  Shield,
  ChevronRight,
  Loader2,
  Lock,
  UserPlus,
  Eye,
  Sparkles,
} from 'lucide-react';
import { getUsersByTypePaginated, getPlatformUserCounts } from '@/lib/api';
import ConnectionButton from './ConnectionButton';
import { useAppContext } from '@/contexts/AppContext';

interface NetworkUser {
  id: string;
  name: string;
  company: string;
  image?: string;
  userType: 'dispatcher' | 'carrier' | 'broker';
  verified: boolean;
  specialties?: string[];
  equipmentTypes?: string[];
  regions?: string[];
  mcNumber?: string;
  dotNumber?: string;
  yearsExperience?: number;
  fleetSize?: number;
}

interface BrowseNetworkPageProps {
  onViewProfile: (userId: string) => void;
  onNavigate: (view: string) => void;
  onSignup?: () => void;
}

const PAGE_SIZE = 10;

const USER_TYPE_CONFIG = {
  dispatcher: {
    label: 'Dispatchers',
    icon: Users,
    color: 'text-[#3B82F6]',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    gradient: 'from-[#3B82F6] to-[#60A5FA]',
    directoryView: 'dispatchers',
  },
  carrier: {
    label: 'Carriers',
    icon: Truck,
    color: 'text-[#10B981]',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    gradient: 'from-[#10B981] to-[#34D399]',
    directoryView: 'carriers',
  },
  broker: {
    label: 'Brokers',
    icon: Building,
    color: 'text-[#F59E0B]',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    gradient: 'from-[#F59E0B] to-[#FBBF24]',
    directoryView: 'brokers',
  },
};

function mapRow(row: any): NetworkUser {
  const userType = row.user_type as 'dispatcher' | 'carrier' | 'broker';
  const dp = Array.isArray(row.dispatcher_profiles) ? row.dispatcher_profiles[0] : row.dispatcher_profiles;
  const cp = Array.isArray(row.carrier_profiles) ? row.carrier_profiles[0] : row.carrier_profiles;
  const bp = Array.isArray(row.broker_profiles) ? row.broker_profiles[0] : row.broker_profiles;

  return {
    id: row.id,
    name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unknown',
    company: row.company_name || '',
    image: row.profile_image_url || undefined,
    userType,
    verified: dp?.verified || cp?.verified || bp?.verified || false,
    specialties: dp?.specialties || bp?.specialties || [],
    equipmentTypes: cp?.equipment_types || [],
    regions: cp?.operating_regions || bp?.operating_regions || [],
    mcNumber: cp?.mc_number || bp?.mc_number || '',
    dotNumber: cp?.dot_number || '',
    yearsExperience: dp?.years_experience,
    fleetSize: cp?.fleet_size,
  };
}

const BrowseNetworkPage: React.FC<BrowseNetworkPageProps> = ({ onViewProfile, onNavigate, onSignup }) => {
  const { currentUser } = useAppContext();
  const isGuest = !currentUser;
  const [counts, setCounts] = useState({ dispatchers: 0, carriers: 0, brokers: 0 });
  const [sections, setSections] = useState<Record<string, {
    users: NetworkUser[];
    total: number;
    loading: boolean;
    loadingMore: boolean;
  }>>({
    dispatcher: { users: [], total: 0, loading: true, loadingMore: false },
    carrier: { users: [], total: 0, loading: true, loadingMore: false },
    broker: { users: [], total: 0, loading: true, loadingMore: false },
  });
  const [blurredProfileId, setBlurredProfileId] = useState<string | null>(null);

  // Fetch counts and initial users
  useEffect(() => {
    getPlatformUserCounts()
      .then(c => setCounts(c))
      .catch(() => {});

    (['dispatcher', 'carrier', 'broker'] as const).forEach(async (type) => {
      try {
        const result = await getUsersByTypePaginated(type, PAGE_SIZE, 0);
        const mapped = result.data.map(mapRow);
        setSections(prev => ({
          ...prev,
          [type]: { users: mapped, total: result.total, loading: false, loadingMore: false },
        }));
      } catch {
        setSections(prev => ({
          ...prev,
          [type]: { ...prev[type], loading: false },
        }));
      }
    });
  }, []);

  const handleLoadMore = async (type: 'dispatcher' | 'carrier' | 'broker') => {
    const section = sections[type];
    if (section.loadingMore || section.users.length >= section.total) return;

    setSections(prev => ({
      ...prev,
      [type]: { ...prev[type], loadingMore: true },
    }));

    try {
      const result = await getUsersByTypePaginated(type, PAGE_SIZE, section.users.length);
      const mapped = result.data.map(mapRow);
      setSections(prev => ({
        ...prev,
        [type]: {
          users: [...prev[type].users, ...mapped],
          total: result.total,
          loading: false,
          loadingMore: false,
        },
      }));
    } catch {
      setSections(prev => ({
        ...prev,
        [type]: { ...prev[type], loadingMore: false },
      }));
    }
  };

  const handleGuestViewProfile = (userId: string) => {
    if (isGuest) {
      setBlurredProfileId(userId);
    } else {
      onViewProfile(userId);
    }
  };

  const totalUsers = counts.dispatchers + counts.carriers + counts.brokers;
  const blurredUser = blurredProfileId
    ? Object.values(sections).flatMap(s => s.users).find(u => u.id === blurredProfileId)
    : null;

  return (
    <section className="py-12 page-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Browse Network</h1>
          <p className="text-gray-600">
            {totalUsers} professional{totalUsers !== 1 ? 's' : ''} on the platform
          </p>
        </div>

        {/* Guest Sign-Up Banner */}
        {isGuest && (
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2B4F7E] rounded-xl p-6 text-white mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl flex-shrink-0">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Join the Network -- It's 100% Free</h3>
                <p className="text-blue-200 text-sm mt-1">
                  Sign up in seconds to connect with dispatchers, carriers, and brokers.
                  View full profiles, send messages, and grow your professional network.
                </p>
              </div>
              <button
                onClick={onSignup}
                className="px-6 py-3 bg-white text-[#1E3A5F] rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <UserPlus className="w-5 h-5" />
                Sign Up Free
              </button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {(['dispatcher', 'carrier', 'broker'] as const).map(type => {
            const config = USER_TYPE_CONFIG[type];
            const count = type === 'dispatcher' ? counts.dispatchers : type === 'carrier' ? counts.carriers : counts.brokers;
            return (
              <button
                key={type}
                onClick={() => isGuest ? onSignup?.() : onNavigate(config.directoryView)}
                className={`${config.bgColor} ${config.borderColor} border rounded-xl p-5 text-left hover:shadow-md transition-shadow group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-br ${config.gradient} rounded-lg text-white`}>
                      <config.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#1E3A5F]">{count}</p>
                      <p className="text-sm text-gray-500">{config.label}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>

        {/* User Sections */}
        {(['dispatcher', 'carrier', 'broker'] as const).map(type => {
          const config = USER_TYPE_CONFIG[type];
          const section = sections[type];

          return (
            <div key={type} className="mb-10">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gradient-to-br ${config.gradient} rounded-lg text-white`}>
                    <config.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#1E3A5F]">{config.label}</h2>
                    <p className="text-sm text-gray-500">{section.total} on the platform</p>
                  </div>
                </div>
                {section.total > 0 && !isGuest && (
                  <button
                    onClick={() => onNavigate(config.directoryView)}
                    className="text-sm text-[#3B82F6] hover:underline flex items-center gap-1"
                  >
                    View Full Directory <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Loading */}
              {section.loading && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
                </div>
              )}

              {/* Empty State */}
              {!section.loading && section.users.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <config.icon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No {config.label.toLowerCase()} have joined yet</p>
                  <p className="text-sm text-gray-400 mt-1">They'll appear here as they sign up</p>
                </div>
              )}

              {/* User Cards */}
              {!section.loading && section.users.length > 0 && (
                <div className="space-y-3">
                  {section.users.map(user => (
                    <div
                      key={user.id}
                      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow flex items-center gap-4"
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white font-bold text-lg`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1E3A5F] truncate">{user.name}</span>
                          {user.verified && <Shield className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />}
                        </div>
                        {user.company && (
                          <p className="text-sm text-gray-500 truncate">{user.company}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-400">
                          {user.mcNumber && <span>MC# {user.mcNumber}</span>}
                          {user.dotNumber && <span>DOT# {user.dotNumber}</span>}
                          {user.yearsExperience !== undefined && user.yearsExperience > 0 && (
                            <span>{user.yearsExperience}yr exp</span>
                          )}
                          {user.fleetSize !== undefined && user.fleetSize > 0 && (
                            <span>{user.fleetSize} trucks</span>
                          )}
                          {user.specialties && user.specialties.length > 0 && (
                            <span>{user.specialties.slice(0, 2).join(', ')}</span>
                          )}
                          {user.equipmentTypes && user.equipmentTypes.length > 0 && (
                            <span>{user.equipmentTypes.slice(0, 2).join(', ')}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isGuest ? (
                          <button
                            onClick={onSignup}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-[#3B82F6] rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1.5"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            Connect
                          </button>
                        ) : (
                          currentUser && currentUser.id !== user.id && (
                            <ConnectionButton
                              targetUserId={user.id}
                              size="sm"
                            />
                          )
                        )}
                        <button
                          onClick={() => handleGuestViewProfile(user.id)}
                          className="px-3 py-1.5 text-sm font-medium text-[#3B82F6] border border-[#3B82F6]/30 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Load More */}
                  {section.users.length < section.total && (
                    <button
                      onClick={() => handleLoadMore(type)}
                      disabled={section.loadingMore}
                      className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {section.loadingMore ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                      ) : (
                        <>Load More {config.label} ({section.total - section.users.length} remaining)</>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Guest bottom CTA */}
        {isGuest && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Ready to connect with these professionals?</p>
            <button
              onClick={onSignup}
              className="px-8 py-4 bg-[#3B82F6] text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Join Free -- Takes 30 Seconds
            </button>
          </div>
        )}
      </div>

      {/* Blurred Profile Overlay for Guests */}
      {blurredUser && isGuest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setBlurredProfileId(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Profile header - visible */}
            <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2B4F7E] p-6 text-white text-center">
              {blurredUser.image ? (
                <img
                  src={blurredUser.image}
                  alt={blurredUser.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white/30 mx-auto mb-3"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                  {blurredUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <h3 className="text-xl font-bold">{blurredUser.name}</h3>
              {blurredUser.company && (
                <p className="text-blue-200 text-sm mt-1">{blurredUser.company}</p>
              )}
              <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-medium capitalize">
                {blurredUser.userType}
              </span>
            </div>

            {/* Blurred details section */}
            <div className="p-6 relative">
              <div className="filter blur-sm select-none pointer-events-none">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-8 bg-gray-100 rounded-lg w-full mt-4" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-3/5" />
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="h-16 bg-gray-100 rounded-lg" />
                    <div className="h-16 bg-gray-100 rounded-lg" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-4/5 mt-3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>

              {/* Signup overlay on top of blur */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 p-6">
                <div className="p-3 bg-[#1E3A5F]/10 rounded-full mb-3">
                  <Lock className="w-8 h-8 text-[#1E3A5F]" />
                </div>
                <h4 className="font-bold text-[#1E3A5F] text-lg mb-2 text-center">Sign Up to View Full Profile</h4>
                <p className="text-gray-500 text-sm text-center mb-5 max-w-xs">
                  Create a free account to see {blurredUser.name}'s complete profile,
                  connect directly, and start building your network.
                </p>
                <button
                  onClick={() => {
                    setBlurredProfileId(null);
                    onSignup?.();
                  }}
                  className="px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Sign Up Free
                </button>
                <button
                  onClick={() => setBlurredProfileId(null)}
                  className="mt-3 text-sm text-gray-400 hover:text-gray-600"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BrowseNetworkPage;
