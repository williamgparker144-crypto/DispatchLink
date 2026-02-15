import React, { useState } from 'react';
import { Camera, Edit3, MapPin, Briefcase, Shield, Users, MessageSquare, Eye, X, Check, ImageIcon } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import PostCard from './PostCard';
import type { Post } from '@/types';

interface UserProfileProps {
  onNavigate: (view: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onNavigate }) => {
  const { currentUser, updateProfile } = useAppContext();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  // Edit form state
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editCompany, setEditCompany] = useState(currentUser?.company || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');

  // Personal feed
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');

  if (!currentUser) {
    return (
      <section className="page-bg min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1E3A5F] mb-2">Sign in to view your profile</h2>
            <p className="text-gray-500 mb-6">Create an account or sign in to access your dashboard.</p>
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-semibold hover:bg-[#2563EB] transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  const handleSaveProfile = () => {
    updateProfile({
      name: editName,
      company: editCompany,
      bio: editBio,
    });
    setEditModalOpen(false);
  };

  const handleSavePhoto = () => {
    if (photoUrl.trim()) {
      updateProfile({ image: photoUrl.trim() });
    }
    setPhotoModalOpen(false);
    setPhotoUrl('');
  };

  const handleRemovePhoto = () => {
    updateProfile({ image: undefined });
    setPhotoModalOpen(false);
    setPhotoUrl('');
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author_id: currentUser.id,
      author_name: currentUser.name,
      author_company: currentUser.company,
      author_type: currentUser.userType,
      author_image: currentUser.image,
      author_verified: currentUser.verified,
      content: newPostContent,
      post_type: 'update',
      likes_count: 0,
      comments_count: 0,
      liked_by_current_user: false,
      created_at: new Date().toISOString(),
    };
    setPosts(prev => [newPost, ...prev]);
    setNewPostContent('');
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const userInitial = currentUser.name?.charAt(0) || '?';

  const getTypeBadge = () => {
    switch (currentUser.userType) {
      case 'dispatcher': return 'Dispatcher';
      case 'carrier': return 'Carrier';
      case 'broker': return 'Broker';
      default: return '';
    }
  };

  return (
    <section className="page-bg min-h-screen">
      {/* Cover Photo */}
      <div className="h-48 sm:h-56 bg-gradient-to-r from-[#1E3A5F] via-[#2c5282] to-[#3B82F6] relative">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible">
            <div className="px-6 pb-6 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Avatar */}
                <div className="relative -mt-16 flex-shrink-0">
                  <div
                    className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center overflow-hidden cursor-pointer group"
                    onClick={() => setPhotoModalOpen(true)}
                  >
                    {currentUser.image ? (
                      <img src={currentUser.image} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-4xl">{userInitial}</span>
                    )}
                    {/* Camera overlay */}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#10B981] border-[3px] border-white rounded-full"></div>
                </div>

                {/* Name & Info */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-[#1E3A5F]">{currentUser.name}</h1>
                    {currentUser.verified && <Shield className="w-5 h-5 text-[#3B82F6]" />}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
                    {currentUser.company && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {currentUser.company}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-[#3B82F6]/10 text-[#3B82F6] rounded-full text-xs font-semibold">{getTypeBadge()}</span>
                  </div>
                  {currentUser.bio && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{currentUser.bio}</p>
                  )}
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => {
                    setEditName(currentUser.name);
                    setEditCompany(currentUser.company);
                    setEditBio(currentUser.bio || '');
                    setEditModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#3B82F6] text-[#3B82F6] rounded-xl font-semibold text-sm hover:bg-[#3B82F6]/5 transition-colors flex-shrink-0"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="border-t border-gray-100 px-6 py-4 grid grid-cols-3 gap-4">
              <button onClick={() => onNavigate('connections')} className="text-center hover:bg-gray-50 rounded-lg py-2 transition-colors">
                <p className="text-xl font-bold text-[#1E3A5F]">0</p>
                <p className="text-xs text-gray-500 font-medium">Connections</p>
              </button>
              <div className="text-center py-2">
                <p className="text-xl font-bold text-[#1E3A5F]">{posts.length}</p>
                <p className="text-xs text-gray-500 font-medium">Posts</p>
              </div>
              <div className="text-center py-2">
                <p className="text-xl font-bold text-[#1E3A5F]">0</p>
                <p className="text-xs text-gray-500 font-medium">Profile Views</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <button onClick={() => onNavigate('feed')} className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-all">
            <Eye className="w-5 h-5 text-[#3B82F6] mx-auto mb-1.5" />
            <span className="text-xs font-semibold text-gray-700">View Feed</span>
          </button>
          <button onClick={() => onNavigate('connections')} className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-all">
            <Users className="w-5 h-5 text-[#10B981] mx-auto mb-1.5" />
            <span className="text-xs font-semibold text-gray-700">Connections</span>
          </button>
          <button onClick={() => onNavigate('messages')} className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-all">
            <MessageSquare className="w-5 h-5 text-[#F59E0B] mx-auto mb-1.5" />
            <span className="text-xs font-semibold text-gray-700">Messages</span>
          </button>
          <button onClick={() => setPhotoModalOpen(true)} className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-all">
            <Camera className="w-5 h-5 text-[#8B5CF6] mx-auto mb-1.5" />
            <span className="text-xs font-semibold text-gray-700">Change Photo</span>
          </button>
        </div>

        {/* Post Composer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-5 overflow-hidden">
          <div className="p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center overflow-hidden flex-shrink-0">
                {currentUser.image ? (
                  <img src={currentUser.image} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white font-bold">{userInitial}</span>
                )}
              </div>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none text-gray-800 placeholder-gray-400 text-sm p-3 min-h-[50px]"
                rows={2}
              />
            </div>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30 flex items-center justify-end">
            <button
              onClick={handleCreatePost}
              disabled={!newPostContent.trim()}
              className="px-5 py-2 bg-gradient-to-r from-[#1E3A5F] to-[#3B82F6] text-white rounded-full text-sm font-bold hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              Post
            </button>
          </div>
        </div>

        {/* Personal Feed */}
        <div className="space-y-4 pb-12">
          {posts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
              <Edit3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No posts yet</h3>
              <p className="text-sm text-gray-400">Share your first update with the network above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1E3A5F]">Edit Profile</h2>
                <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                    placeholder="Tell others about yourself or your business..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 py-3 bg-[#3B82F6] text-white rounded-xl font-semibold hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPhotoModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1E3A5F]">Profile Picture</h2>
                <button onClick={() => setPhotoModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Current photo preview */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center overflow-hidden border-4 border-gray-100">
                  {(photoUrl || currentUser.image) ? (
                    <img src={photoUrl || currentUser.image} alt="Preview" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-5xl">{userInitial}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  Paste an image URL
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/your-photo.jpg"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none text-sm"
                />
                <p className="text-xs text-gray-400 mt-2">Use a direct link to a JPG, PNG, or WebP image. Works with any publicly accessible URL.</p>
              </div>

              <div className="flex gap-3 mt-6">
                {currentUser.image && (
                  <button
                    onClick={handleRemovePhoto}
                    className="px-4 py-3 border border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors text-sm"
                  >
                    Remove
                  </button>
                )}
                <button
                  onClick={() => setPhotoModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePhoto}
                  className="flex-1 py-3 bg-[#3B82F6] text-white rounded-xl font-semibold hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default UserProfile;
