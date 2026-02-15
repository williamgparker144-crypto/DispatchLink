import React, { useState } from 'react';
import { PenSquare, Image, Hash } from 'lucide-react';
import PostCard from './PostCard';
import type { Post } from '@/types';

const postTypes = [
  { id: 'update', label: 'Update' },
  { id: 'looking_for', label: 'Looking For' },
  { id: 'news', label: 'News' },
  { id: 'milestone', label: 'Milestone' },
];

const SocialFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPostType, setSelectedPostType] = useState('update');
  const [filterType, setFilterType] = useState<string>('all');

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author_id: 'demo-user-1',
      author_name: 'You',
      author_company: '',
      author_type: 'dispatcher',
      author_verified: true,
      content: newPostContent,
      post_type: selectedPostType as Post['post_type'],
      likes_count: 0,
      comments_count: 0,
      liked_by_current_user: false,
      created_at: new Date().toISOString(),
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostContent('');
    setSelectedPostType('update');
  };

  const filteredPosts = filterType === 'all' ? posts : posts.filter(p => p.post_type === filterType);

  return (
    <section className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Feed</h1>
          <p className="text-gray-600">What's happening in the trucking community</p>
        </div>

        {/* Post Composer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Share an update, ask a question, or post about what you're looking for..."
            className="w-full border-0 resize-none focus:ring-0 outline-none text-gray-800 placeholder-gray-400 text-sm min-h-[80px]"
            rows={3}
          />
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-400" />
              <div className="flex gap-1">
                {postTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedPostType(type.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedPostType === type.id
                        ? 'bg-[#3B82F6] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleCreatePost}
              disabled={!newPostContent.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-medium hover:bg-[#1E3A5F]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PenSquare className="w-4 h-4" />
              Post
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Posts' },
            { id: 'looking_for', label: 'Looking For' },
            { id: 'news', label: 'Industry News' },
            { id: 'milestone', label: 'Milestones' },
            { id: 'update', label: 'Updates' },
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterType === filter.id
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <PenSquare className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-pulse-slow" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No posts yet. Be the first to share an update.</h3>
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialFeed;
