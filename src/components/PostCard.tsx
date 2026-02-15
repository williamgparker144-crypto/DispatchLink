import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Shield, Send } from 'lucide-react';
import type { Post, PostComment } from '@/types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [liked, setLiked] = useState(post.liked_by_current_user);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<PostComment[]>([]);
  const [expanded, setExpanded] = useState(false);

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
      author_name: 'John Smith',
      author_company: 'Smith Dispatch Services',
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
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Dispatcher</span>;
      case 'carrier':
        return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Carrier</span>;
      case 'broker':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Broker</span>;
      default:
        return null;
    }
  };

  const getPostTypeBadge = (postType: string) => {
    switch (postType) {
      case 'looking_for':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Looking For</span>;
      case 'news':
        return <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium">Industry News</span>;
      case 'milestone':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Milestone</span>;
      default:
        return null;
    }
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const contentTruncated = post.content.length > 280 && !expanded;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Author Info */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#1a365d] to-[#2d4a6f] rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {post.author_image ? (
              <img src={post.author_image} alt={post.author_name} className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              post.author_name.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#1a365d]">{post.author_name}</span>
              {post.author_verified && (
                <Shield className="w-4 h-4 text-green-500" />
              )}
              {getTypeBadge(post.author_type)}
            </div>
            <p className="text-sm text-gray-500">{post.author_company}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>
              {getPostTypeBadge(post.post_type)}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-3">
        <p className="text-gray-800 whitespace-pre-wrap">
          {contentTruncated ? `${post.content.substring(0, 280)}...` : post.content}
        </p>
        {post.content.length > 280 && !expanded && (
          <button onClick={() => setExpanded(true)} className="text-[#ff6b35] text-sm font-medium mt-1 hover:underline">
            Read more
          </button>
        )}
      </div>

      {/* Action Bar */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-6">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
          {likesCount > 0 && likesCount}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1a365d] transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          {(post.comments_count + comments.length) > 0 && (post.comments_count + comments.length)}
        </button>

        <button className="flex items-center gap-2 text-sm font-medium text-gray-300 cursor-not-allowed" disabled>
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-5 pb-4 border-t border-gray-100">
          {/* Existing comments */}
          {comments.length > 0 && (
            <div className="py-3 space-y-3">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                    {comment.author_name.charAt(0)}
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1">
                    <span className="text-sm font-medium text-[#1a365d]">{comment.author_name}</span>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment input */}
          <div className="flex gap-2 pt-3">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className="p-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
