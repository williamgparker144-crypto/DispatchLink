import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Briefcase, Shield, Globe, Users, MessageSquare, Award, Calendar, Clock, Sparkles, Loader2, Edit3, Eye } from 'lucide-react';
import ConnectionButton from './ConnectionButton';
import PostCard from './PostCard';
import { computeVerificationTier, getVerificationBadgeInfo } from '@/lib/verification';
import { getConnectionStatus, sendConnectionRequest, acceptConnection, rejectConnection, getOrCreateConversation, getPostsByUser, getUserSettings, recordProfileView, getProfileViewCount } from '@/lib/api';
import type { ViewableUser, Post } from '@/types';

const normalizeUrl = (url: string) => url.match(/^https?:\/\//) ? url : `https://${url}`;

interface ViewUserProfileProps {
  user: ViewableUser;
  onBack: () => void;
  onNavigate: (view: string) => void;
  currentUserId?: string;
  onOpenConversation?: (conversationId: string) => void;
}

const ViewUserProfile: React.FC<ViewUserProfileProps> = ({ user, onBack, onNavigate, currentUserId, onOpenConversation }) => {
  const userInitial = user.name?.charAt(0) || '?';
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'connected'>('none');
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [profileViews, setProfileViews] = useState<number>(0);
  const [privacySettings, setPrivacySettings] = useState<Record<string, boolean>>({
    show_email: false, show_phone: false, show_location: true, show_bio: true,
    show_website: true, show_experience: true, show_specialties: true, show_carriers: true,
  });

  // Fetch this user's privacy settings
  useEffect(() => {
    if (!user.id) return;
    const isSupabaseId = !user.id.startsWith('user-') && !user.id.startsWith('seed-');
    if (!isSupabaseId) return;
    (async () => {
      try {
        const s = await getUserSettings(user.id);
        if (s && Object.keys(s).length > 0) setPrivacySettings(prev => ({ ...prev, ...s }));
      } catch { /* use defaults */ }
    })();
  }, [user.id]);

  // Fetch this user's posts
  useEffect(() => {
    if (!user.id) return;
    const isSupabaseId = !user.id.startsWith('user-') && !user.id.startsWith('seed-');
    if (!isSupabaseId) {
      setPostsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await getPostsByUser(user.id, currentUserId);
        if (!cancelled) setUserPosts(data);
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setPostsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user.id, currentUserId]);

  // Record profile view + fetch view count
  useEffect(() => {
    if (!user.id) return;
    const isSupabaseId = !user.id.startsWith('user-') && !user.id.startsWith('seed-');
    if (!isSupabaseId) return;
    // Record the view (skips self-views internally)
    recordProfileView(user.id, currentUserId).catch(() => {});
    // Fetch total view count
    getProfileViewCount(user.id).then(count => setProfileViews(count)).catch(() => {});
  }, [user.id, currentUserId]);

  useEffect(() => {
    if (!currentUserId || currentUserId === user.id) return;
    let cancelled = false;
    (async () => {
      try {
        const conn = await getConnectionStatus(currentUserId, user.id);
        if (cancelled || !conn) return;
        setConnectionId(conn.id);
        if (conn.status === 'accepted') {
          setConnectionStatus('connected');
        } else if (conn.status === 'pending') {
          setConnectionStatus(conn.requester_id === currentUserId ? 'pending_sent' : 'pending_received');
        }
      } catch {
        // No connection found
      }
    })();
    return () => { cancelled = true; };
  }, [currentUserId, user.id]);

  const handleConnect = async () => {
    if (!currentUserId) return;
    try {
      const conn = await sendConnectionRequest(currentUserId, user.id);
      setConnectionId(conn.id);
      setConnectionStatus('pending_sent');
    } catch (err) {
      console.warn('Failed to send connection request:', err);
    }
  };

  const handleAccept = async () => {
    if (!connectionId) return;
    try {
      await acceptConnection(connectionId);
      setConnectionStatus('connected');
    } catch (err) {
      console.warn('Failed to accept connection:', err);
    }
  };

  const handleReject = async () => {
    if (!connectionId) return;
    try {
      await rejectConnection(connectionId);
      setConnectionStatus('none');
      setConnectionId(null);
    } catch (err) {
      console.warn('Failed to reject connection:', err);
    }
  };

  const handleMessage = async () => {
    if (!currentUserId) {
      onNavigate('messages');
      return;
    }
    try {
      const conv = await getOrCreateConversation(currentUserId, user.id);
      if (onOpenConversation) {
        onOpenConversation(conv.id);
      } else {
        onNavigate('messages');
      }
    } catch {
      onNavigate('messages');
    }
  };

  const getTypeBadge = () => {
    switch (user.userType) {
      case 'dispatcher': return 'Dispatcher';
      case 'carrier': return 'Carrier';
      case 'broker': return 'Broker';
      case 'advertiser': return 'Advertiser';
      default: return '';
    }
  };

  const getTypeBadgeColor = () => {
    switch (user.userType) {
      case 'dispatcher': return 'bg-blue-100 text-blue-700';
      case 'carrier': return 'bg-orange-100 text-orange-700';
      case 'broker': return 'bg-purple-100 text-purple-700';
      case 'advertiser': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Determine if cover is an uploaded image or a gradient theme
  const isUploadedCover =
    user.coverImage?.startsWith('data:') || user.coverImage?.startsWith('http');
  const isGradientCover = user.coverImage?.startsWith('linear-gradient');
  const coverGradientStyle: React.CSSProperties = isGradientCover
    ? { background: user.coverImage }
    : !isUploadedCover
      ? { background: 'linear-gradient(135deg, #1E3A5F 0%, #2c5282 50%, #3B82F6 100%)' }
      : {};

  return (
    <section className="page-bg min-h-screen pb-12">
      {/* Cover Photo - read only */}
      <div className="h-56 sm:h-72 relative overflow-hidden" style={!isUploadedCover ? coverGradientStyle : undefined}>
        {isUploadedCover && (
          <img src={user.coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {!isUploadedCover && (
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        )}
        <div className={`absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t to-transparent ${isUploadedCover ? 'from-black/15' : 'from-black/20'}`} />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-black/50 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Profile Header Card */}
        <div className="relative -mt-16 mb-6">
          {/* Avatar */}
          <div className="relative z-10 pl-6" style={{ marginBottom: '-64px' }}>
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full shadow-lg bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center overflow-hidden">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-5xl">{userInitial}</span>
                )}
              </div>
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-[#10B981] border-[3px] border-white rounded-full z-10"></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 pb-6 pt-[72px]">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Name & Info */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-[#1E3A5F]">{user.name}</h1>
                    {user.verified && <Shield className="w-5 h-5 text-[#3B82F6]" />}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeBadgeColor()}`}>
                      {getTypeBadge()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1.5 flex-wrap">
                    {user.company && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {user.company}
                      </span>
                    )}
                    {user.location && privacySettings.show_location !== false && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {user.location}
                      </span>
                    )}
                    {user.website && privacySettings.show_website !== false && (
                      <a
                        href={normalizeUrl(user.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#3B82F6] hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {user.website}
                      </a>
                    )}
                  </div>
                  {user.bio && privacySettings.show_bio !== false && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{user.bio}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  {currentUserId && currentUserId !== user.id && (
                    <ConnectionButton
                      status={connectionStatus}
                      onConnect={handleConnect}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      size="md"
                    />
                  )}
                  <button
                    onClick={handleMessage}
                    className="flex items-center gap-2 px-5 py-2.5 btn-glossy-outline rounded-xl text-sm transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="border-t border-gray-100 px-6 py-4 grid grid-cols-3 gap-4">
              <div className="text-center py-1">
                <p className="text-xl font-bold text-[#1E3A5F]">{userPosts.length}</p>
                <p className="text-xs text-gray-500 font-medium">Posts</p>
              </div>
              <div className="text-center py-1">
                <p className="text-xl font-bold text-[#1E3A5F]">{connectionStatus === 'connected' ? '1+' : '—'}</p>
                <p className="text-xs text-gray-500 font-medium">Connections</p>
              </div>
              <div className="text-center py-1 flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xl font-bold text-[#1E3A5F]">{profileViews}</p>
                </div>
                <p className="text-xs text-gray-500 font-medium">Profile Views</p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-xl border border-gray-200 mb-5 overflow-hidden">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Professional Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500 w-24">Role</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeBadgeColor()}`}>
                    {getTypeBadge()}
                  </span>
                </div>
                {user.company && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500 w-24">Company</span>
                    <span className="text-gray-800 font-medium">{user.company}</span>
                  </div>
                )}
                {user.location && privacySettings.show_location !== false && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500 w-24">Location</span>
                    <span className="text-gray-800">{user.location}</span>
                  </div>
                )}
                {user.website && privacySettings.show_website !== false && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500 w-24">Website</span>
                    <a
                      href={normalizeUrl(user.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3B82F6] hover:underline"
                    >
                      {user.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Dispatcher Experience Section */}
            {user.userType === 'dispatcher' && (user.yearsExperience !== undefined || (user.specialties && user.specialties.length > 0)) && (
              <div>
                <h3 className="font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Dispatch Experience
                </h3>
                <div className="space-y-3">
                  {user.yearsExperience !== undefined && privacySettings.show_experience !== false && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500 w-24">Experience</span>
                      <span className="text-gray-800 font-medium">
                        {user.yearsExperience === 0 ? 'Less than 1 year' : `${user.yearsExperience}+ years`}
                      </span>
                    </div>
                  )}
                  {user.specialties && user.specialties.length > 0 && privacySettings.show_specialties !== false && (
                    <div className="flex items-start gap-3 text-sm">
                      <span className="text-gray-500 w-24 pt-0.5">Specialties</span>
                      <div className="flex flex-wrap gap-1.5">
                        {user.specialties.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-[#1E3A5F]/5 text-[#1E3A5F] text-xs font-medium rounded-lg">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {user.carriersWorkedWith && user.carriersWorkedWith.length > 0 && privacySettings.show_carriers !== false && (
                    <div className="flex items-start gap-3 text-sm">
                      <span className="text-gray-500 w-24 pt-0.5">Carriers</span>
                      <div className="space-y-1">
                        {user.carriersWorkedWith.map((c, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-gray-800">{c.carrierName}</span>
                            <span className="text-xs text-gray-400">{c.mcNumber}</span>
                            {c.verified && <Shield className="w-3 h-3 text-emerald-500" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {user.bio && privacySettings.show_bio !== false && (
              <div>
                <h3 className="font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Bio
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{user.bio}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.verified && (
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-blue-100">
                    <Shield className="w-3.5 h-3.5" />
                    Verified Member
                  </span>
                )}
                {user.userType === 'dispatcher' && (() => {
                  const tier = user.verificationTier || computeVerificationTier(user);
                  const badge = getVerificationBadgeInfo(tier);
                  return (
                    <span className={`px-3 py-1.5 ${badge.bgColor} ${badge.textColor} rounded-full text-xs font-semibold flex items-center gap-1.5 border ${badge.borderColor}`}>
                      {tier === 'carrierscout_verified' ? <Sparkles className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                      {badge.label}
                    </span>
                  );
                })()}
                <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-green-100">
                  <Calendar className="w-3.5 h-3.5" />
                  New Member
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white rounded-xl border border-gray-200 mb-5 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-[#1E3A5F] flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Posts
              {userPosts.length > 0 && (
                <span className="text-xs text-gray-400 font-normal">({userPosts.length})</span>
              )}
            </h3>
          </div>
          <div className="p-4">
            {postsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-[#3B82F6] animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading posts...</span>
              </div>
            ) : userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.map(post => (
                  <PostCard key={post.id} post={post} onViewProfile={() => {}} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Edit3 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No posts yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ViewUserProfile;
