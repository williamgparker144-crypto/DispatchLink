import React, { useState } from 'react';
import { MessageCircle, Share2, Shield, Send, MoreHorizontal, ExternalLink, ThumbsUp } from 'lucide-react';
import type { Post, PostComment } from '@/types';

interface PostCardProps {
  post: Post;
}

const extractYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
};

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [liked, setLiked] = useState(post.liked_by_current_user);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<PostComment[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: PostComment = {
      id: `comment-${Date.now()}`,
      post_id: post.id,
      author_id: 'demo-user-1',
      author_name: 'You',
      author_company: '',
      author_type: 'dispatcher',
      content: commentText,
      created_at: new Date().toISOString(),
    };
    setComments(prev => [...prev, newComment]);
    setCommentText('');
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'dispatcher':
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">Dispatcher</span>;
      case 'carrier':
        return <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs font-medium">Carrier</span>;
      case 'broker':
        return <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs font-medium">Broker</span>;
      default:
        return null;
    }
  };

  const getPostTypeBadge = (postType: string) => {
    switch (postType) {
      case 'looking_for':
        return <span className="text-xs text-green-600 font-medium">Looking For</span>;
      case 'news':
        return <span className="text-xs text-cyan-600 font-medium">Industry News</span>;
      case 'milestone':
        return <span className="text-xs text-amber-600 font-medium">Milestone</span>;
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

  const contentTruncated = post.content.length > 280 && !expanded;
  const totalComments = post.comments_count + comments.length;
  const videoId = post.video_url ? extractYouTubeId(post.video_url) : null;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Author Info */}
        <div className="p-4 pb-0">
          <div className="flex items-start gap-3">
            {/* Avatar - 48px */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#2d5a8e] flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
              {post.author_image ? (
                <img src={post.author_image} alt={post.author_name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                post.author_name.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-900 text-[15px] hover:text-[#3B82F6] hover:underline cursor-pointer">{post.author_name}</span>
                {post.author_verified && (
                  <Shield className="w-4 h-4 text-[#3B82F6] fill-[#3B82F6]/10" />
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
            <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
            {contentTruncated ? `${post.content.substring(0, 280)}...` : post.content}
          </p>
          {post.content.length > 280 && !expanded && (
            <button onClick={() => setExpanded(true)} className="text-gray-500 hover:text-[#3B82F6] text-sm font-medium mt-1">
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
              className="w-full max-h-[400px] object-cover"
            />
          </div>
        )}

        {/* YouTube Embed */}
        {videoId && (
          <div className="mt-2">
            <div className="video-embed-container mx-0">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Link Preview Card */}
        {post.link_url && !videoId && (
          <a
            href={post.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 border-t border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex">
              {post.link_image && (
                <div className="w-32 sm:w-48 flex-shrink-0">
                  <img src={post.link_image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 p-3 min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{getDomain(post.link_url)}</p>
                {post.link_title && (
                  <p className="font-semibold text-gray-900 text-sm mt-1 line-clamp-2">{post.link_title}</p>
                )}
                {post.link_description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.link_description}</p>
                )}
              </div>
              <div className="flex items-center pr-3">
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </a>
        )}

        {/* Engagement Stats */}
        {(likesCount > 0 || totalComments > 0) && (
          <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500">
            {likesCount > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-[#3B82F6] rounded-full flex items-center justify-center">
                  <ThumbsUp className="w-2.5 h-2.5 text-white" />
                </div>
                <span>{likesCount}</span>
              </div>
            )}
            {totalComments > 0 && (
              <button onClick={() => setShowComments(!showComments)} className="hover:text-[#3B82F6] hover:underline">
                {totalComments} comment{totalComments !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}

        {/* Action Bar - LinkedIn style */}
        <div className="px-2 border-t border-gray-200">
          <div className="flex items-center">
            <button
              onClick={handleLike}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-colors ${
                liked ? 'text-[#3B82F6]' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-[#3B82F6]' : ''}`} />
              <span className="hidden sm:inline">Like</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Comment</span>
            </button>

            <button className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="px-4 pb-4 border-t border-gray-100">
            {/* Comment input */}
            <div className="flex gap-2 pt-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#1E3A5F] to-[#2d5a8e] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                Y
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-full text-sm focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none bg-gray-50"
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
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                      {comment.author_image ? (
                        <img src={comment.author_image} alt={comment.author_name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        comment.author_name.charAt(0)
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-2xl px-3 py-2 flex-1">
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
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setImageExpanded(false)}
        >
          <img
            src={post.image_url}
            alt="Post attachment"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
};

export default PostCard;
