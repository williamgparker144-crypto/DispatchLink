import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PenSquare, ImageIcon, Video, Link2, X, Play, FileText, Upload, Megaphone, Star, ArrowRight, Loader2 } from 'lucide-react';
import PostCard from './PostCard';
import SponsoredPostCard from './SponsoredPostCard';
import { useAppContext } from '@/contexts/AppContext';
import { getActiveAdsForFeed, getPosts, createPost, deletePost as deletePostApi, uploadPostImage, uploadPostDocument } from '@/lib/api';
import type { Post, ViewableUser, SponsoredPost } from '@/types';

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
  onViewProfile?: (user: ViewableUser) => void;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ onNavigate, onViewProfile }) => {
  const { currentUser } = useAppContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPostType, setSelectedPostType] = useState('update');
  const [filterType, setFilterType] = useState<string>('all');

  // File upload refs
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const docUploadRef = useRef<HTMLInputElement>(null);

  // Rich media state
  const [attachedImage, setAttachedImage] = useState('');
  const [attachedImageFile, setAttachedImageFile] = useState<Blob | null>(null);
  const [attachedVideo, setAttachedVideo] = useState('');
  const [attachedLink, setAttachedLink] = useState('');
  const [attachedLinkTitle, setAttachedLinkTitle] = useState('');
  const [attachedLinkDesc, setAttachedLinkDesc] = useState('');
  const [attachedLinkImage, setAttachedLinkImage] = useState('');
  const [unfurling, setUnfurling] = useState(false);
  const unfurlCacheRef = useRef<Set<string>>(new Set());
  const [attachedDoc, setAttachedDoc] = useState<{ name: string; url: string } | null>(null);
  const [attachedDocFile, setAttachedDocFile] = useState<File | null>(null);

  // Sponsored ads
  const [sponsoredPosts, setSponsoredPosts] = useState<SponsoredPost[]>([]);

  // Load posts from Supabase on mount
  useEffect(() => {
    (async () => {
      setLoadingPosts(true);
      try {
        const data = await getPosts(currentUser?.id);
        setPosts(data || []);
      } catch (err) {
        console.warn('Failed to load posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    })();
  }, [currentUser?.id]);

  useEffect(() => {
    (async () => {
      try {
        const ads = await getActiveAdsForFeed(currentUser?.userType);
        if (ads && ads.length > 0) {
          const mapped: SponsoredPost[] = ads
            .filter((ad: any) => ad.ad_creatives && ad.ad_creatives.length > 0)
            .map((ad: any) => ({
              type: 'sponsored' as const,
              campaign: ad,
              creative: ad.ad_creatives[0],
              advertiserName: ad.advertiser
                ? `${ad.advertiser.first_name || ''} ${ad.advertiser.last_name || ''}`.trim() || ad.advertiser.company_name || 'Advertiser'
                : 'Advertiser',
              advertiserImage: ad.advertiser?.profile_image_url,
            }));
          setSponsoredPosts(mapped);
        }
      } catch {
        // Silent fail — no ads to show
      }
    })();
  }, [currentUser?.userType]);

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
    setAttachedImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedDocFile(file);
    setAttachedDoc({ name: file.name, url: '' });
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !attachedImage && !attachedVideo && !attachedLink && !attachedDoc) return;
    if (!currentUser?.id) return;

    setPosting(true);
    try {
      // Upload image to Supabase Storage if present
      let imageUrl: string | undefined;
      if (attachedImageFile) {
        try {
          imageUrl = await uploadPostImage(currentUser.id, attachedImageFile);
        } catch (err) {
          console.warn('Image upload failed:', err);
        }
      }

      // Upload document to Supabase Storage if present
      let documentUrl: string | undefined;
      let documentName: string | undefined;
      if (attachedDocFile && attachedDoc) {
        try {
          documentUrl = await uploadPostDocument(currentUser.id, attachedDocFile);
          documentName = attachedDoc.name;
        } catch (err) {
          console.warn('Document upload failed:', err);
        }
      }

      const dbPost = await createPost({
        author_id: currentUser.id,
        content: newPostContent,
        post_type: selectedPostType,
        image_url: imageUrl,
        video_url: attachedVideo || undefined,
        link_url: attachedLink || undefined,
        link_title: attachedLinkTitle || undefined,
        link_description: attachedLinkDesc || undefined,
        link_image: attachedLinkImage || undefined,
        document_url: documentUrl,
        document_name: documentName,
      });

      // Build the full Post object for local state
      const newPost: Post = {
        id: dbPost.id,
        author_id: currentUser.id,
        author_name: currentUser.name || 'You',
        author_company: currentUser.company || '',
        author_type: currentUser.userType || 'dispatcher',
        author_image: currentUser.image,
        author_verified: currentUser.verified ?? false,
        content: newPostContent,
        post_type: selectedPostType as Post['post_type'],
        likes_count: 0,
        comments_count: 0,
        liked_by_current_user: false,
        created_at: dbPost.created_at,
        image_url: imageUrl,
        video_url: attachedVideo || undefined,
        link_url: attachedLink || undefined,
        link_title: attachedLinkTitle || undefined,
        link_description: attachedLinkDesc || undefined,
        link_image: attachedLinkImage || undefined,
        document_url: documentUrl,
        document_name: documentName,
      };

      setPosts(prev => [newPost, ...prev]);
      setNewPostContent('');
      setSelectedPostType('update');
      clearAttachments();
    } catch (err) {
      console.warn('Failed to create post:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePostApi(postId);
    } catch (err) {
      console.warn('Failed to delete post:', err);
    }
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const clearAttachments = () => {
    setAttachedImage('');
    setAttachedImageFile(null);
    setAttachedVideo('');
    setAttachedLink('');
    setAttachedLinkTitle('');
    setAttachedLinkDesc('');
    setAttachedLinkImage('');
    setUnfurling(false);
    unfurlCacheRef.current.clear();
    setAttachedDoc(null);
    setAttachedDocFile(null);
    setShowVideoInput(false);
    setShowLinkInput(false);
    setVideoInputValue('');
    setLinkInputValue('');
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
      let url = linkInputValue.trim();
      if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
      setAttachedLink(url);
      setAttachedLinkTitle(linkTitleValue.trim());
      setAttachedLinkDesc(linkDescValue.trim());
      setShowLinkInput(false);
      // Auto-unfurl if no title/desc provided
      if (!linkTitleValue.trim() && !linkDescValue.trim()) {
        setUnfurling(true);
        fetch(`/api/unfurl-url?url=${encodeURIComponent(url)}`)
          .then(r => r.json())
          .then(data => {
            if (data.title) setAttachedLinkTitle(data.title);
            if (data.description) setAttachedLinkDesc(data.description);
            if (data.image) setAttachedLinkImage(data.image);
          })
          .catch(() => {})
          .finally(() => setUnfurling(false));
      }
    }
  };

  // Auto-detect URLs in content (YouTube + general links with OG unfurl)
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewPostContent(value);

    // YouTube detection
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
          return;
        }
      }
    }

    // General URL detection — auto-unfurl OG metadata
    // Supports: https://..., http://..., www.domain.com/..., domain.com/path
    if (!attachedLink && !attachedVideo) {
      const urlMatch = value.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|io|gov|co|us|info|biz|edu)(\/[^\s]*)?)/i);
      if (urlMatch) {
        let detectedUrl = urlMatch[0];
        // Normalize: prepend https:// if missing
        if (!/^https?:\/\//i.test(detectedUrl)) {
          detectedUrl = `https://${detectedUrl}`;
        }
        // Skip YouTube URLs (handled above) and already unfurled URLs
        const isYouTube = /youtube\.com|youtu\.be/.test(detectedUrl);
        if (!isYouTube && !unfurlCacheRef.current.has(detectedUrl)) {
          unfurlCacheRef.current.add(detectedUrl);
          setAttachedLink(detectedUrl);
          setUnfurling(true);
          fetch(`/api/unfurl-url?url=${encodeURIComponent(detectedUrl)}`)
            .then(r => r.json())
            .then(data => {
              if (data.title) setAttachedLinkTitle(data.title);
              if (data.description) setAttachedLinkDesc(data.description);
              if (data.image) setAttachedLinkImage(data.image);
            })
            .catch(() => {})
            .finally(() => setUnfurling(false));
        }
      }
    }
  }, [attachedVideo, attachedLink]);

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
                  <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-white">
                    {unfurling && (
                      <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                        <Loader2 className="w-3 h-3 animate-spin" /> Fetching preview...
                      </div>
                    )}
                    {attachedLinkImage && !unfurling && (
                      <img src={attachedLinkImage} alt="" className="w-full h-32 object-cover" />
                    )}
                    <div className="px-3 py-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                        {(() => { try { return new URL(attachedLink).hostname; } catch { return attachedLink; } })()}
                      </p>
                      {attachedLinkTitle && (
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{attachedLinkTitle}</p>
                      )}
                      {attachedLinkDesc && (
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{attachedLinkDesc}</p>
                      )}
                      {!attachedLinkTitle && !unfurling && (
                        <p className="text-sm text-blue-600 truncate">{attachedLink}</p>
                      )}
                    </div>
                    <button
                      onClick={() => { setAttachedLink(''); setAttachedLinkTitle(''); setAttachedLinkDesc(''); setAttachedLinkImage(''); unfurlCacheRef.current.clear(); }}
                      className="absolute top-2 right-2 w-5 h-5 bg-gray-900/70 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"
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
                disabled={!hasContent || posting}
                className="ml-auto px-5 py-2 btn-glossy-navy rounded-full text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 flex items-center gap-2"
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {posting ? 'Posting...' : 'Post'}
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

        {/* Sponsored Ads */}
        {sponsoredPosts.length > 0 ? (
          <div className="mb-4">
            <SponsoredPostCard sponsoredPost={sponsoredPosts[0]} />
          </div>
        ) : (
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
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">Promote your services to dispatchers, carriers, and brokers.</p>
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
        )}

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

        {/* Posts with interleaved sponsored content */}
        <div className="space-y-4">
          {filteredPosts.map((post, index) => (
            <React.Fragment key={post.id}>
              <PostCard post={post} onDelete={handleDeletePost} onViewProfile={onViewProfile} />
              {/* Inject a sponsored post every 5th position */}
              {sponsoredPosts.length > 0 && (index + 1) % 5 === 0 && (
                <SponsoredPostCard
                  key={`sponsored-${index}`}
                  sponsoredPost={sponsoredPosts[(Math.floor(index / 5)) % sponsoredPosts.length]}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {loadingPosts ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200/80 shadow-sm">
            <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading feed...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200/80 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <PenSquare className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No posts yet</h3>
            <p className="text-sm text-gray-400">Be the first to share an update with the network.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default SocialFeed;
