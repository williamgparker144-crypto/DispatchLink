import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Share2, Shield, Send, MoreHorizontal, ExternalLink, ThumbsUp, Trash2, Flag, Bookmark, FileText, Download, Loader2, Check } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { likePost, unlikePost, addComment as addCommentApi, getPostComments } from '@/lib/api';
import type { Post, PostComment, ViewableUser } from '@/types';

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
  onViewProfile?: (user: ViewableUser) => void;
}

const extractYouTubeId = (url: string): string | null => {
  // Support: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/v/ID, youtube.com/shorts/ID
  // Also handles extra query params like &feature=shared, &t=123, etc.
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

const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
};

// Detect URLs in text (http, https, www, bare domains)
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|io|gov|co|us|info|biz|edu)(\/[^\s]*)?)/gi;

const normalizeDetectedUrl = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;

// Render post content with clickable links
const renderContentWithLinks = (text: string) => {
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(URL_REGEX.source, 'gi');
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const href = normalizeDetectedUrl(match[0]);
    parts.push(
      <a
        key={match.index}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#3B82F6] hover:underline break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {match[0]}
      </a>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
};

const PostCard: React.FC<PostCardProps> = ({ post, onDelete, onViewProfile }) => {
  const { currentUser } = useAppContext();
  const [liked, setLiked] = useState(post.liked_by_current_user);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto-unfurl: if post has a URL in content but no link_url, try to unfurl it
  const [autoUnfurl, setAutoUnfurl] = useState<{
    url: string; title: string; description: string; image: string;
  } | null>(null);
  const [autoUnfurling, setAutoUnfurling] = useState(false);

  useEffect(() => {
    if (post.link_url || post.video_url) return; // already has link data
    const match = post.content.match(URL_REGEX);
    if (!match) return;
    const url = normalizeDetectedUrl(match[0]);
    if (/youtube\.com|youtu\.be/.test(url)) return; // skip YouTube
    setAutoUnfurling(true);
    fetch(`/api/unfurl-url?url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then(data => {
        if (data.title || data.image) {
          setAutoUnfurl({ url, title: data.title || '', description: data.description || '', image: data.image || '' });
        }
      })
      .catch(() => {})
      .finally(() => setAutoUnfurling(false));
  }, [post.id]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Load comments from Supabase when expanded
  useEffect(() => {
    if (showComments && !commentsLoaded) {
      (async () => {
        try {
          const data = await getPostComments(post.id);
          setComments(data || []);
        } catch (err) {
          console.warn('Failed to load comments:', err);
        } finally {
          setCommentsLoaded(true);
        }
      })();
    }
  }, [showComments, commentsLoaded, post.id]);

  const handleLike = async () => {
    if (!currentUser?.id) return;
    // Optimistic update
    if (liked) {
      setLikesCount(prev => prev - 1);
      setLiked(false);
      try { await unlikePost(post.id, currentUser.id); } catch { setLikesCount(prev => prev + 1); setLiked(true); }
    } else {
      setLikesCount(prev => prev + 1);
      setLiked(true);
      try { await likePost(post.id, currentUser.id); } catch { setLikesCount(prev => prev - 1); setLiked(false); }
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !currentUser?.id) return;
    const content = commentText.trim();
    setCommentText('');

    // Optimistic local comment
    const optimistic: PostComment = {
      id: `temp-${Date.now()}`,
      post_id: post.id,
      author_id: currentUser.id,
      author_name: currentUser.name || 'You',
      author_company: currentUser.company || '',
      author_type: currentUser.userType || 'dispatcher',
      author_image: currentUser.image,
      content,
      created_at: new Date().toISOString(),
    };
    setComments(prev => [...prev, optimistic]);

    try {
      const saved = await addCommentApi({
        post_id: post.id,
        author_id: currentUser.id,
        content,
      });
      // Replace optimistic with real
      setComments(prev => prev.map(c => c.id === optimistic.id ? { ...optimistic, id: saved.id } : c));
    } catch (err) {
      console.warn('Failed to add comment:', err);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'dispatcher':
        return <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 rounded-full text-xs font-semibold border border-blue-200/50">Dispatcher</span>;
      case 'carrier':
        return <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-600 rounded-full text-xs font-semibold border border-orange-200/50">Carrier</span>;
      case 'broker':
        return <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 rounded-full text-xs font-semibold border border-purple-200/50">Broker</span>;
      case 'advertiser':
        return <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-600 rounded-full text-xs font-semibold border border-amber-200/50">Advertiser</span>;
      default:
        return null;
    }
  };

  const getPostTypeBadge = (postType: string) => {
    switch (postType) {
      case 'looking_for':
        return <span className="text-xs text-emerald-500 font-semibold">Looking For</span>;
      case 'news':
        return <span className="text-xs text-cyan-500 font-semibold">Industry News</span>;
      case 'milestone':
        return <span className="text-xs text-amber-500 font-semibold">Milestone</span>;
      default:
        return null;
    }
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks}w`;
  };

  const handleAuthorClick = () => {
    onViewProfile?.({
      id: post.author_id,
      name: post.author_name,
      company: post.author_company,
      userType: post.author_type,
      image: post.author_image,
      verified: post.author_verified,
    });
  };

  const handleShare = async () => {
    const shareText = `${post.author_name}: ${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}`;
    const shareUrl = post.link_url || window.location.origin;

    // Use native share on mobile if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.author_name} on DispatchLink`,
          text: shareText,
          url: shareUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // Last resort: select-copy approach
      const textarea = document.createElement('textarea');
      textarea.value = `${shareText}\n\n${shareUrl}`;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const contentTruncated = post.content.length > 280 && !expanded;
  const totalComments = post.comments_count + comments.length;
  const videoId = post.video_url ? extractYouTubeId(post.video_url) : null;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden hover:shadow-md transition-shadow">
        {/* Author Info */}
        <div className="p-4 pb-0">
          <div className="flex items-start gap-3">
            {/* Avatar - LinkedIn/Facebook style with online indicator */}
            <div className="relative flex-shrink-0 cursor-pointer" onClick={handleAuthorClick}>
              <div className="avatar-ring w-12 h-12">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {post.author_image ? (
                    <img src={post.author_image} alt={post.author_name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center text-white font-bold text-lg">
                      {post.author_name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-[#10B981] border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-900 text-[15px] hover:text-[#3B82F6] hover:underline cursor-pointer" onClick={handleAuthorClick}>{post.author_name}</span>
                {post.author_verified && (
                  <Shield className="w-4 h-4 text-[#3B82F6] fill-[#3B82F6]/20" />
                )}
                {getTypeBadge(post.author_type)}
              </div>
              <p className="text-xs text-gray-500 leading-tight">{post.author_company}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>
                {getPostTypeBadge(post.post_type) && (
                  <>
                    <span className="text-gray-300">·</span>
                    {getPostTypeBadge(post.post_type)}
                  </>
                )}
              </div>
            </div>

            {/* 3-dot menu - WORKING dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-30 animate-fade-in">
                  <button
                    onClick={() => { setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                  >
                    <Bookmark className="w-4 h-4" />
                    Save post
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                  >
                    <Flag className="w-4 h-4" />
                    Report post
                  </button>
                  {onDelete && currentUser && currentUser.id === post.author_id && (
                    <>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={() => {
                          onDelete(post.id);
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete post
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-gray-800 text-[15px] leading-[1.65] whitespace-pre-wrap">
            {contentTruncated
              ? renderContentWithLinks(`${post.content.substring(0, 280)}...`)
              : renderContentWithLinks(post.content)
            }
          </p>
          {post.content.length > 280 && !expanded && (
            <button onClick={() => setExpanded(true)} className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-semibold mt-1">
              ...see more
            </button>
          )}
        </div>

        {/* Media Section - full bleed */}
        {/* Image */}
        {post.image_url && (
          <div className="mt-2 cursor-pointer" onClick={() => setImageExpanded(true)}>
            <img
              src={post.image_url}
              alt="Post attachment"
              className="w-full max-h-[600px] object-contain"
            />
          </div>
        )}

        {/* YouTube Embed - ACTUAL VIDEO PLAYER */}
        {videoId && (
          <div className="mt-2 mx-4 mb-2">
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px' }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, borderRadius: '12px' }}
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Link Preview Card — Facebook-style (saved link data) */}
        {post.link_url && !videoId && (
          <a
            href={post.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mx-4 mt-2 mb-2 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow bg-gray-50"
          >
            {post.link_image && (
              <div className="w-full h-48 sm:h-56 bg-gray-200 overflow-hidden">
                <img src={post.link_image} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-3">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">{getDomain(post.link_url)}</p>
              {post.link_title && (
                <p className="font-semibold text-gray-900 text-[15px] mt-1 line-clamp-2 leading-snug">{post.link_title}</p>
              )}
              {post.link_description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.link_description}</p>
              )}
              {!post.link_title && !post.link_description && (
                <p className="text-sm text-blue-600 mt-1 truncate">{post.link_url}</p>
              )}
            </div>
          </a>
        )}

        {/* Auto-unfurled link preview — for posts with URLs in text but no saved link_url */}
        {!post.link_url && !videoId && autoUnfurl && (
          <a
            href={autoUnfurl.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mx-4 mt-2 mb-2 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow bg-gray-50"
          >
            {autoUnfurl.image && (
              <div className="w-full h-48 sm:h-56 bg-gray-200 overflow-hidden">
                <img src={autoUnfurl.image} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-3">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">{getDomain(autoUnfurl.url)}</p>
              {autoUnfurl.title && (
                <p className="font-semibold text-gray-900 text-[15px] mt-1 line-clamp-2 leading-snug">{autoUnfurl.title}</p>
              )}
              {autoUnfurl.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{autoUnfurl.description}</p>
              )}
            </div>
          </a>
        )}
        {!post.link_url && !videoId && autoUnfurling && (
          <div className="mx-4 mt-2 mb-2 rounded-xl border border-gray-200 bg-gray-50 p-3 flex items-center gap-2 text-xs text-gray-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading link preview...
          </div>
        )}

        {/* Document Attachment */}
        {post.document_url && (
          <div className="mx-4 mt-2 mb-2">
            <a
              href={post.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">
                  {post.document_name || 'Attached Document'}
                </p>
                <p className="text-xs text-gray-400">Click to view or download</p>
              </div>
              <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </a>
          </div>
        )}

        {/* Engagement Stats */}
        {(likesCount > 0 || totalComments > 0) && (
          <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500">
            {likesCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-full flex items-center justify-center">
                  <ThumbsUp className="w-3 h-3 text-white" />
                </div>
                <span className="font-medium">{likesCount}</span>
              </div>
            )}
            {totalComments > 0 && (
              <button onClick={() => setShowComments(!showComments)} className="hover:text-[#3B82F6] hover:underline font-medium">
                {totalComments} comment{totalComments !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}

        {/* Action Bar */}
        <div className="px-2 border-t border-gray-100">
          <div className="flex items-center">
            <button
              onClick={handleLike}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-all ${
                liked ? 'text-[#3B82F6]' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-[#3B82F6]' : ''}`} />
              <span className="hidden sm:inline">Like</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded-lg transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Comment</span>
            </button>

            <button
              onClick={handleShare}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-all ${
                shared ? 'text-[#10B981]' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {shared ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
              <span className="hidden sm:inline">{shared ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="px-4 pb-4 border-t border-gray-100">
            {/* Comment input */}
            <div className="flex gap-2 pt-3">
              <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                  {currentUser?.image ? (
                    <img src={currentUser.image} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    currentUser?.name?.charAt(0) || 'Y'
                  )}
                </div>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none bg-gray-50 hover:bg-white transition-colors"
                />
                {commentText.trim() && (
                  <button
                    onClick={handleAddComment}
                    className="p-2 text-[#3B82F6] hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Existing comments */}
            {comments.length > 0 && (
              <div className="mt-3 space-y-3">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden">
                      {comment.author_image ? (
                        <img src={comment.author_image} alt={comment.author_name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        comment.author_name.charAt(0)
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-2xl px-4 py-2.5 flex-1">
                      <span className="text-sm font-semibold text-gray-900">{comment.author_name}</span>
                      <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {imageExpanded && post.image_url && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 cursor-pointer backdrop-blur-sm"
          onClick={() => setImageExpanded(false)}
        >
          <img
            src={post.image_url}
            alt="Post attachment"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
};

export default PostCard;
