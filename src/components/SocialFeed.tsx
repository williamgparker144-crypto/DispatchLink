import React, { useState, useCallback, useRef } from 'react';
import { PenSquare, ImageIcon, Video, Link2, X, Play, FileText, Upload, Megaphone, Star, ArrowRight } from 'lucide-react';
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

interface SocialFeedProps {
  onNavigate?: (view: string) => void;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ onNavigate }) => {
  const { currentUser } = useAppContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPostType, setSelectedPostType] = useState('update');
  const [filterType, setFilterType] = useState<string>('all');

  // File upload refs
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const docUploadRef = useRef<HTMLInputElement>(null);

  // Rich media state
  const [attachedImage, setAttachedImage] = useState('');
  const [attachedVideo, setAttachedVideo] = useState('');
  const [attachedLink, setAttachedLink] = useState('');
  const [attachedLinkTitle, setAttachedLinkTitle] = useState('');
  const [attachedLinkDesc, setAttachedLinkDesc] = useState('');
  const [attachedDoc, setAttachedDoc] = useState<{ name: string; url: string } | null>(null);

  // UI state for media input panels
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [videoInputValue, setVideoInputValue] = useState('');
  const [linkInputValue, setLinkInputValue] = useState('');
  const [linkTitleValue, setLinkTitleValue] = useState('');
  const [linkDescValue, setLinkDescValue] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedDoc({ name: file.name, url: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim() && !attachedImage && !attachedVideo && !attachedLink && !attachedDoc) return;

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
    setAttachedDoc(null);
    setShowVideoInput(false);
    setShowLinkInput(false);
    setVideoInputValue('');
    setLinkInputValue('');
    setLinkTitleValue('');
    setLinkDescValue('');
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

  const hasContent = newPostContent.trim() || attachedImage || attachedVideo || attachedLink || attachedDoc;
  const filteredPosts = filterType === 'all' ? posts : posts.filter(p => p.post_type === filterType);
  const videoId = attachedVideo ? extractYouTubeId(attachedVideo) : null;

  const userInitial = currentUser?.name?.charAt(0) || 'Y';

  return (
    <section className="py-6 min-h-screen page-bg">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Post Composer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 mb-5 overflow-hidden">
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

            {/* Hidden file inputs */}
            <input ref={imageUploadRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <input ref={docUploadRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" className="hidden" onChange={handleDocUpload} />

            {/* Preview Strip */}
            {(attachedImage || attachedVideo || attachedLink || attachedDoc) && (
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
                {attachedDoc && (
                  <div className="relative inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 rounded-xl px-3 py-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-gray-700 max-w-[200px] truncate font-medium">{attachedDoc.name}</span>
                    <button
                      onClick={() => setAttachedDoc(null)}
                      className="ml-1 w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Media Input Panels */}
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

          {/* Post type selector */}
          <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-gray-400 font-medium mr-1 flex-shrink-0">Post as:</span>
            {postTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedPostType(type.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedPostType === type.id
                    ? 'bg-[#1E3A5F] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Bottom toolbar */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/30">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => imageUploadRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 text-gray-600 hover:bg-white"
              >
                <ImageIcon className="w-4 h-4 text-[#10B981]" />
                <span className="hidden sm:inline text-xs">Photo</span>
              </button>
              <button
                onClick={() => docUploadRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 text-gray-600 hover:bg-white"
              >
                <FileText className="w-4 h-4 text-[#F59E0B]" />
                <span className="hidden sm:inline text-xs">Document</span>
              </button>
              <button
                onClick={() => { setShowVideoInput(!showVideoInput); setShowLinkInput(false); }}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${showVideoInput ? 'bg-red-100 text-red-600' : 'text-gray-600 hover:bg-white'}`}
              >
                <Video className="w-4 h-4 text-red-500" />
                <span className="hidden sm:inline text-xs">Video</span>
              </button>
              <button
                onClick={() => { setShowLinkInput(!showLinkInput); setShowVideoInput(false); }}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${showLinkInput ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-white'}`}
              >
                <Link2 className="w-4 h-4 text-orange-500" />
                <span className="hidden sm:inline text-xs">Link</span>
              </button>

              <button
                onClick={handleCreatePost}
                disabled={!hasContent}
                className="ml-auto px-5 py-2 btn-glossy-navy rounded-full text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                Post
              </button>
            </div>
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

        {/* Promoted Ad Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden mb-4">
          <div className="px-4 py-2 flex items-center justify-between bg-amber-50/50 border-b border-amber-100/50">
            <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" />
              Sponsored
            </span>
            <span className="text-[10px] text-gray-400 font-medium">Ad</span>
          </div>
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-sm">Advertise on DispatchLink</h4>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">Promote your services to dispatchers, carriers, and brokers. Ads start at $1/day.</p>
                <button
                  onClick={() => onNavigate?.('advertising')}
                  className="mt-3 px-4 py-2 btn-glossy-primary rounded-lg text-xs transition-all inline-flex items-center gap-1.5"
                >
                  View Ad Options
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Industry Resources */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden mb-4">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Industry Resources</span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'FMCSA Safety & Compliance', url: 'https://www.fmcsa.dot.gov/safety' },
                { label: 'ELD Mandate Information', url: 'https://eld.fmcsa.dot.gov/' },
                { label: 'Hours of Service Regulations', url: 'https://www.fmcsa.dot.gov/hours-service/eld/driver-hours-service-regulations' },
              ].map((resource, i) => (
                <a
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#1E3A5F] hover:text-[#3B82F6] transition-colors group"
                >
                  <span className="text-[#3B82F6] font-bold text-xs flex-shrink-0">#{i + 1}</span>
                  <span className="group-hover:underline">{resource.label}</span>
                  <svg className="w-3 h-3 text-gray-400 flex-shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              ))}
            </div>
          </div>
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
