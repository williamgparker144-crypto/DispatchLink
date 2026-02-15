import React, { useState, useCallback } from 'react';
import { PenSquare, ImageIcon, Video, Link2, X, Play } from 'lucide-react';
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
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
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

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
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
      const ytPatterns = [
        /(https?:\/\/(?:www\.)?youtube\.com\/watch\?[^\s]*v=[a-zA-Z0-9_-]{11})/,
        /(https?:\/\/youtu\.be\/[a-zA-Z0-9_-]{11})/,
        /(https?:\/\/(?:www\.)?youtube\.com\/shorts\/[a-zA-Z0-9_-]{11})/,
      ];
      for (const pattern of ytPatterns) {
        const match = value.match(pattern);
        if (match) {
          setAttachedVideo(match[1]);
          break;
        }
      }
    }
  }, [attachedVideo]);

  const filteredPosts = filterType === 'all' ? posts : posts.filter(p => p.post_type === filterType);
  const videoId = attachedVideo ? extractYouTubeId(attachedVideo) : null;

  const userInitial = currentUser?.name?.charAt(0) || 'Y';

  return (
    <section className="py-6 min-h-screen" style={{ background: 'linear-gradient(180deg, #f0f4ff 0%, #f8fafc 40%, #f0f4ff 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Post Composer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 mb-5">
          <div className="p-4">
            <div className="flex gap-3">
              {/* User Avatar - LinkedIn/Facebook style */}
              <div className="relative flex-shrink-0">
                <div className="avatar-ring w-12 h-12">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {currentUser?.image ? (
                      <img src={currentUser.image} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center text-white font-bold text-lg">
                        {userInitial}
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-[#10B981] border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={handleContentChange}
                  placeholder="Share an update with your network..."
                  className="w-full border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none text-gray-800 placeholder-gray-400 text-[15px] p-3 min-h-[60px] bg-gray-50/50 hover:bg-white transition-colors"
                  rows={2}
                />
              </div>
            </div>

            {/* Preview Strip */}
            {(attachedImage || attachedVideo || attachedLink) && (
              <div className="mt-3 space-y-2">
                {attachedImage && (
                  <div className="relative inline-block">
                    <img src={attachedImage} alt="Attachment" className="h-20 w-auto rounded-xl object-cover border border-gray-200" />
                    <button
                      onClick={() => setAttachedImage('')}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {videoId && (
                  <div className="relative inline-flex items-center gap-2 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/60 rounded-xl px-3 py-2">
                    <Play className="w-4 h-4 text-red-500" />
                    <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt="YouTube thumbnail" className="h-12 w-auto rounded-lg" />
                    <span className="text-sm text-gray-700 max-w-[200px] truncate font-medium">YouTube Video</span>
                    <button
                      onClick={() => setAttachedVideo('')}
                      className="ml-1 w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {attachedLink && !videoId && (
                  <div className="relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl px-3 py-2">
                    <Link2 className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700 max-w-[250px] truncate font-medium">{attachedLinkTitle || attachedLink}</span>
                    <button
                      onClick={() => { setAttachedLink(''); setAttachedLinkTitle(''); setAttachedLinkDesc(''); }}
                      className="ml-1 w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Media Input Panels */}
            {showImageInput && (
              <div className="mt-3 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-200/40">
                <p className="text-xs font-semibold text-gray-600 mb-2">Add image URL</p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageInputValue}
                    onChange={(e) => setImageInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B82F6]/30 outline-none"
                    autoFocus
                  />
                  <button onClick={handleAddImage} className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white text-sm rounded-lg font-medium hover:shadow-md transition-shadow">Add</button>
                  <button onClick={() => setShowImageInput(false)} className="px-3 py-2 text-gray-500 text-sm hover:bg-white rounded-lg">Cancel</button>
                </div>
              </div>
            )}

            {showVideoInput && (
              <div className="mt-3 p-3 bg-gradient-to-r from-red-50/50 to-pink-50/50 rounded-xl border border-red-200/40">
                <p className="text-xs font-semibold text-gray-600 mb-2">Add YouTube URL</p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={videoInputValue}
                    onChange={(e) => setVideoInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddVideo()}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B82F6]/30 outline-none"
                    autoFocus
                  />
                  <button onClick={handleAddVideo} className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-lg font-medium hover:shadow-md transition-shadow">Add</button>
                  <button onClick={() => setShowVideoInput(false)} className="px-3 py-2 text-gray-500 text-sm hover:bg-white rounded-lg">Cancel</button>
                </div>
              </div>
            )}

            {showLinkInput && (
              <div className="mt-3 p-3 bg-gradient-to-r from-orange-50/50 to-amber-50/50 rounded-xl border border-orange-200/40">
                <p className="text-xs font-semibold text-gray-600 mb-2">Add link</p>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={linkInputValue}
                    onChange={(e) => setLinkInputValue(e.target.value)}
                    placeholder="https://example.com/article"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B82F6]/30 outline-none"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={linkTitleValue}
                    onChange={(e) => setLinkTitleValue(e.target.value)}
                    placeholder="Title (optional)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B82F6]/30 outline-none"
                  />
                  <input
                    type="text"
                    value={linkDescValue}
                    onChange={(e) => setLinkDescValue(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B82F6]/30 outline-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleAddLink} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm rounded-lg font-medium hover:shadow-md transition-shadow">Add</button>
                    <button onClick={() => setShowLinkInput(false)} className="px-3 py-2 text-gray-500 text-sm hover:bg-white rounded-lg">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom toolbar */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/30 rounded-b-xl">
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setShowImageInput(!showImageInput); setShowVideoInput(false); setShowLinkInput(false); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${showImageInput ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
              >
                <ImageIcon className="w-5 h-5 text-blue-500" />
                <span className="hidden sm:inline">Image</span>
              </button>
              <button
                onClick={() => { setShowVideoInput(!showVideoInput); setShowImageInput(false); setShowLinkInput(false); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${showVideoInput ? 'bg-red-100 text-red-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
              >
                <Video className="w-5 h-5 text-red-500" />
                <span className="hidden sm:inline">Video</span>
              </button>
              <button
                onClick={() => { setShowLinkInput(!showLinkInput); setShowImageInput(false); setShowVideoInput(false); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${showLinkInput ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
              >
                <Link2 className="w-5 h-5 text-orange-500" />
                <span className="hidden sm:inline">Link</span>
              </button>

              <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

              <div className="hidden sm:flex gap-1 ml-1">
                {postTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedPostType(type.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                      selectedPostType === type.id
                        ? 'bg-gradient-to-r from-[#1E3A5F] to-[#2d5a8e] text-white shadow-sm'
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
              className="px-6 py-2 bg-gradient-to-r from-[#1E3A5F] to-[#3B82F6] text-white rounded-full text-sm font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              Post
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
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
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                filterType === filter.id
                  ? 'bg-gradient-to-r from-[#1E3A5F] to-[#3B82F6] text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200 hover:shadow-sm'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200/80 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <PenSquare className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No posts yet</h3>
            <p className="text-sm text-gray-400">Be the first to share an update with the network.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialFeed;
