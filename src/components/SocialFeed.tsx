import React, { useState, useCallback } from 'react';
import { PenSquare, ImageIcon, Video, Link2, X, Users, TrendingUp, UserPlus, Play } from 'lucide-react';
import PostCard from './PostCard';
import { useAppContext } from '@/contexts/AppContext';
import type { Post } from '@/types';

const postTypes = [
  { id: 'update', label: 'Update' },
  { id: 'looking_for', label: 'Looking For' },
  { id: 'news', label: 'News' },
  { id: 'milestone', label: 'Milestone' },
];

const extractYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const SocialFeed: React.FC = () => {
  const { currentUser } = useAppContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPostType, setSelectedPostType] = useState('update');
  const [filterType, setFilterType] = useState<string>('all');

  // Rich media state
  const [attachedImage, setAttachedImage] = useState('');
  const [attachedVideo, setAttachedVideo] = useState('');
  const [attachedLink, setAttachedLink] = useState('');
  const [attachedLinkTitle, setAttachedLinkTitle] = useState('');
  const [attachedLinkDesc, setAttachedLinkDesc] = useState('');

  // UI state for media input panels
  const [showImageInput, setShowImageInput] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageInputValue, setImageInputValue] = useState('');
  const [videoInputValue, setVideoInputValue] = useState('');
  const [linkInputValue, setLinkInputValue] = useState('');
  const [linkTitleValue, setLinkTitleValue] = useState('');
  const [linkDescValue, setLinkDescValue] = useState('');

  const handleCreatePost = () => {
    if (!newPostContent.trim() && !attachedImage && !attachedVideo && !attachedLink) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author_id: currentUser?.id || 'demo-user-1',
      author_name: currentUser?.name || 'You',
      author_company: currentUser?.company || '',
      author_type: currentUser?.userType || 'dispatcher',
      author_image: currentUser?.image,
      author_verified: currentUser?.verified ?? true,
      content: newPostContent,
      post_type: selectedPostType as Post['post_type'],
      likes_count: 0,
      comments_count: 0,
      liked_by_current_user: false,
      created_at: new Date().toISOString(),
      image_url: attachedImage || undefined,
      video_url: attachedVideo || undefined,
      link_url: attachedLink || undefined,
      link_title: attachedLinkTitle || undefined,
      link_description: attachedLinkDesc || undefined,
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostContent('');
    setSelectedPostType('update');
    clearAttachments();
  };

  const clearAttachments = () => {
    setAttachedImage('');
    setAttachedVideo('');
    setAttachedLink('');
    setAttachedLinkTitle('');
    setAttachedLinkDesc('');
    setShowImageInput(false);
    setShowVideoInput(false);
    setShowLinkInput(false);
    setImageInputValue('');
    setVideoInputValue('');
    setLinkInputValue('');
    setLinkTitleValue('');
    setLinkDescValue('');
  };

  const handleAddImage = () => {
    if (imageInputValue.trim()) {
      setAttachedImage(imageInputValue.trim());
      setShowImageInput(false);
    }
  };

  const handleAddVideo = () => {
    if (videoInputValue.trim()) {
      setAttachedVideo(videoInputValue.trim());
      setShowVideoInput(false);
    }
  };

  const handleAddLink = () => {
    if (linkInputValue.trim()) {
      setAttachedLink(linkInputValue.trim());
      setAttachedLinkTitle(linkTitleValue.trim());
      setAttachedLinkDesc(linkDescValue.trim());
      setShowLinkInput(false);
    }
  };

  // Auto-detect YouTube URLs in content
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewPostContent(value);

    if (!attachedVideo) {
      const ytMatch = value.match(/(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11})/);
      if (ytMatch) {
        setAttachedVideo(ytMatch[1]);
      }
    }
  }, [attachedVideo]);

  const filteredPosts = filterType === 'all' ? posts : posts.filter(p => p.post_type === filterType);
  const videoId = attachedVideo ? extractYouTubeId(attachedVideo) : null;

  const userInitial = currentUser?.name?.charAt(0) || 'Y';

  return (
    <section className="py-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-6">
          {/* Main Feed Column */}
          <div className="flex-1 max-w-2xl mx-auto lg:mx-0">
            {/* Post Composer - LinkedIn style */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
              <div className="p-4">
                <div className="flex gap-3">
                  {/* User Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#2d5a8e] flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                    {currentUser?.image ? (
                      <img src={currentUser.image} alt={currentUser.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newPostContent}
                      onChange={handleContentChange}
                      placeholder="Share an update with your network..."
                      className="w-full border border-gray-200 rounded-lg resize-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none text-gray-800 placeholder-gray-500 text-[15px] p-3 min-h-[60px] bg-gray-50 hover:bg-white transition-colors"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Preview Strip */}
                {(attachedImage || attachedVideo || attachedLink) && (
                  <div className="mt-3 space-y-2">
                    {/* Image preview */}
                    {attachedImage && (
                      <div className="relative inline-block">
                        <img src={attachedImage} alt="Attachment" className="h-20 w-auto rounded-lg object-cover border border-gray-200" />
                        <button
                          onClick={() => setAttachedImage('')}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {/* Video preview */}
                    {videoId && (
                      <div className="relative inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <Play className="w-4 h-4 text-red-600" />
                        <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt="YouTube thumbnail" className="h-12 w-auto rounded" />
                        <span className="text-sm text-gray-700 max-w-[200px] truncate">YouTube Video</span>
                        <button
                          onClick={() => setAttachedVideo('')}
                          className="ml-1 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {/* Link preview */}
                    {attachedLink && !videoId && (
                      <div className="relative inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <Link2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700 max-w-[250px] truncate">{attachedLinkTitle || attachedLink}</span>
                        <button
                          onClick={() => { setAttachedLink(''); setAttachedLinkTitle(''); setAttachedLinkDesc(''); }}
                          className="ml-1 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Media Input Panels */}
                {showImageInput && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-2">Add image URL</p>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageInputValue}
                        onChange={(e) => setImageInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#3B82F6] outline-none"
                        autoFocus
                      />
                      <button onClick={handleAddImage} className="px-3 py-2 bg-[#3B82F6] text-white text-sm rounded-lg hover:bg-[#2563EB]">Add</button>
                      <button onClick={() => setShowImageInput(false)} className="px-3 py-2 text-gray-500 text-sm hover:bg-gray-100 rounded-lg">Cancel</button>
                    </div>
                  </div>
                )}

                {showVideoInput && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-2">Add YouTube URL</p>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={videoInputValue}
                        onChange={(e) => setVideoInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddVideo()}
                        placeholder="https://youtube.com/watch?v=..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#3B82F6] outline-none"
                        autoFocus
                      />
                      <button onClick={handleAddVideo} className="px-3 py-2 bg-[#3B82F6] text-white text-sm rounded-lg hover:bg-[#2563EB]">Add</button>
                      <button onClick={() => setShowVideoInput(false)} className="px-3 py-2 text-gray-500 text-sm hover:bg-gray-100 rounded-lg">Cancel</button>
                    </div>
                  </div>
                )}

                {showLinkInput && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-2">Add link</p>
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={linkInputValue}
                        onChange={(e) => setLinkInputValue(e.target.value)}
                        placeholder="https://example.com/article"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#3B82F6] outline-none"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={linkTitleValue}
                        onChange={(e) => setLinkTitleValue(e.target.value)}
                        placeholder="Title (optional)"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#3B82F6] outline-none"
                      />
                      <input
                        type="text"
                        value={linkDescValue}
                        onChange={(e) => setLinkDescValue(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#3B82F6] outline-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={handleAddLink} className="px-3 py-2 bg-[#3B82F6] text-white text-sm rounded-lg hover:bg-[#2563EB]">Add</button>
                        <button onClick={() => setShowLinkInput(false)} className="px-3 py-2 text-gray-500 text-sm hover:bg-gray-100 rounded-lg">Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom toolbar */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {/* Media buttons */}
                  <button
                    onClick={() => { setShowImageInput(!showImageInput); setShowVideoInput(false); setShowLinkInput(false); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showImageInput ? 'bg-blue-50 text-[#3B82F6]' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <ImageIcon className="w-5 h-5 text-blue-500" />
                    <span className="hidden sm:inline">Image</span>
                  </button>
                  <button
                    onClick={() => { setShowVideoInput(!showVideoInput); setShowImageInput(false); setShowLinkInput(false); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showVideoInput ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Video className="w-5 h-5 text-green-500" />
                    <span className="hidden sm:inline">Video</span>
                  </button>
                  <button
                    onClick={() => { setShowLinkInput(!showLinkInput); setShowImageInput(false); setShowVideoInput(false); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showLinkInput ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Link2 className="w-5 h-5 text-orange-500" />
                    <span className="hidden sm:inline">Link</span>
                  </button>

                  <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

                  {/* Post type pills */}
                  <div className="hidden sm:flex gap-1 ml-1">
                    {postTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedPostType(type.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedPostType === type.id
                            ? 'bg-[#1E3A5F] text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() && !attachedImage && !attachedVideo && !attachedLink}
                  className="px-5 py-2 bg-[#1E3A5F] text-white rounded-full text-sm font-semibold hover:bg-[#1E3A5F]/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'looking_for', label: 'Looking For' },
                { id: 'news', label: 'News' },
                { id: 'milestone', label: 'Milestones' },
                { id: 'update', label: 'Updates' },
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setFilterType(filter.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    filterType === filter.id
                      ? 'bg-[#1E3A5F] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Posts */}
            <div className="space-y-3">
              {filteredPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                <PenSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-600 mb-1">No posts yet</h3>
                <p className="text-sm text-gray-400">Be the first to share an update with the network.</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Desktop only */}
          <div className="hidden lg:block w-72 flex-shrink-0 space-y-4">
            {/* Your Network */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-[#1E3A5F]" />
                <h3 className="font-semibold text-sm text-gray-900">Your Network</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1E3A5F]">0</p>
                  <p className="text-xs text-gray-500">Connections</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#3B82F6]">0</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
              <button className="w-full mt-3 text-sm text-[#3B82F6] font-medium hover:underline">
                Grow your network →
              </button>
            </div>

            {/* Trending in Trucking */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-[#1E3A5F]" />
                <h3 className="font-semibold text-sm text-gray-900">Trending in Trucking</h3>
              </div>
              <div className="space-y-3">
                {[
                  { topic: 'FMCSA Compliance Updates', posts: '12 posts' },
                  { topic: 'Owner-Operator Tips', posts: '8 posts' },
                  { topic: 'Freight Market Outlook', posts: '15 posts' },
                  { topic: 'Fleet Management Tech', posts: '6 posts' },
                ].map((item, i) => (
                  <div key={i} className="cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors">
                    <p className="text-sm font-medium text-gray-900">{item.topic}</p>
                    <p className="text-xs text-gray-400">{item.posts}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Connections */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="w-4 h-4 text-[#1E3A5F]" />
                <h3 className="font-semibold text-sm text-gray-900">Suggested Connections</h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'John Carter', type: 'Carrier', company: 'Carter Trucking LLC' },
                  { name: 'Maria Lopez', type: 'Dispatcher', company: 'FreightFlow Dispatch' },
                  { name: 'Dave Richards', type: 'Broker', company: 'National Freight Corp' },
                ].map((person, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#2d5a8e] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {person.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{person.name}</p>
                      <p className="text-xs text-gray-500 truncate">{person.type} · {person.company}</p>
                    </div>
                    <button className="px-2 py-1 border border-[#3B82F6] text-[#3B82F6] rounded-full text-xs font-medium hover:bg-blue-50 transition-colors flex-shrink-0">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialFeed;
