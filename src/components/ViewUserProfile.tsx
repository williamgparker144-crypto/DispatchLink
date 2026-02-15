import React from 'react';
import { ArrowLeft, MapPin, Briefcase, Shield, Globe, Users, MessageSquare, Award, Calendar } from 'lucide-react';
import ConnectionButton from './ConnectionButton';
import type { ViewableUser } from '@/types';

const normalizeUrl = (url: string) => url.match(/^https?:\/\//) ? url : `https://${url}`;

interface ViewUserProfileProps {
  user: ViewableUser;
  onBack: () => void;
  onNavigate: (view: string) => void;
}

const ViewUserProfile: React.FC<ViewUserProfileProps> = ({ user, onBack, onNavigate }) => {
  const userInitial = user.name?.charAt(0) || '?';

  const getTypeBadge = () => {
    switch (user.userType) {
      case 'dispatcher': return 'Dispatcher';
      case 'carrier': return 'Carrier';
      case 'broker': return 'Broker';
      default: return '';
    }
  };

  const getTypeBadgeColor = () => {
    switch (user.userType) {
      case 'dispatcher': return 'bg-blue-100 text-blue-700';
      case 'carrier': return 'bg-orange-100 text-orange-700';
      case 'broker': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Determine cover background
  const coverStyle: React.CSSProperties = user.coverImage?.startsWith('data:')
    ? { backgroundImage: `url(${user.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : user.coverImage?.startsWith('linear-gradient')
      ? { background: user.coverImage }
      : { background: 'linear-gradient(135deg, #1E3A5F 0%, #2c5282 50%, #3B82F6 100%)' };

  return (
    <section className="page-bg min-h-screen pb-12">
      {/* Cover Photo - read only */}
      <div className="h-52 sm:h-64 relative" style={coverStyle}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />

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
                    {user.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {user.location}
                      </span>
                    )}
                    {user.website && (
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
                  {user.bio && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{user.bio}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <ConnectionButton status="none" onConnect={() => {}} size="md" />
                  <button
                    onClick={() => onNavigate('messages')}
                    className="flex items-center gap-2 px-5 py-2.5 btn-glossy-outline rounded-xl text-sm transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                </div>
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
                {user.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500 w-24">Location</span>
                    <span className="text-gray-800">{user.location}</span>
                  </div>
                )}
                {user.website && (
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

            {user.bio && (
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
                <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-green-100">
                  <Calendar className="w-3.5 h-3.5" />
                  New Member
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ViewUserProfile;
