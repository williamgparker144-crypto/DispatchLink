import React, { useState } from 'react';
import { PenSquare, Image, Hash } from 'lucide-react';
import PostCard from './PostCard';
import type { Post } from '@/types';

const samplePosts: Post[] = [
  {
    id: 'post-1',
    author_id: 'user-1',
    author_name: 'Mike Johnson',
    author_company: 'Johnson Dispatch Services',
    author_type: 'dispatcher',
    author_image: 'https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418478138_3a06fafe.png',
    author_verified: true,
    content: 'Just onboarded 3 new carriers this week through DispatchLink! The verified profiles make the vetting process so much smoother. If you\'re a flatbed carrier in the Southeast looking for consistent work, let\'s connect.',
    post_type: 'update',
    likes_count: 24,
    comments_count: 5,
    liked_by_current_user: false,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'post-2',
    author_id: 'user-2',
    author_name: 'Sarah Williams',
    author_company: 'Williams Logistics Group',
    author_type: 'dispatcher',
    author_image: 'https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418479994_627b2454.png',
    author_verified: true,
    content: 'Looking for reefer carriers with experience in produce hauling — California to East Coast lanes. Must have current insurance and clean inspection record. DM me or connect here!',
    post_type: 'looking_for',
    likes_count: 18,
    comments_count: 12,
    liked_by_current_user: true,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'post-3',
    author_id: 'user-3',
    author_name: 'Robert Thompson',
    author_company: 'Thompson Trucking LLC',
    author_type: 'carrier',
    author_image: 'https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418505750_37b6a043.png',
    author_verified: true,
    content: 'Proud to announce that Thompson Trucking just hit 5 years with zero preventable accidents! Safety is our #1 priority. Thanks to all our dispatchers and team members who make it possible.',
    post_type: 'milestone',
    likes_count: 67,
    comments_count: 15,
    liked_by_current_user: false,
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: 'post-4',
    author_id: 'user-4',
    author_name: 'Lisa Martinez',
    author_company: 'TruckHub Solutions',
    author_type: 'dispatcher',
    author_image: 'https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418479362_901c4ead.png',
    author_verified: true,
    content: 'FMCSA just announced new hours-of-service guidance for 2026. Key changes include updated short-haul exemption rules and new ELD requirements. Make sure your fleet is compliant before the April deadline.',
    post_type: 'news',
    likes_count: 42,
    comments_count: 8,
    liked_by_current_user: false,
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'post-5',
    author_id: 'user-5',
    author_name: 'James Wilson',
    author_company: 'Wilson Brokerage Inc',
    author_type: 'broker',
    author_verified: true,
    content: 'Looking for reliable dispatchers who specialize in heavy haul and oversized loads. We have consistent freight from manufacturing clients in the Midwest. Competitive rates and quick pay available.',
    post_type: 'looking_for',
    likes_count: 31,
    comments_count: 9,
    liked_by_current_user: false,
    created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
  {
    id: 'post-6',
    author_id: 'user-6',
    author_name: 'Emily Davis',
    author_company: 'Davis Trucking Services',
    author_type: 'carrier',
    author_image: 'https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418508724_339e2fd2.png',
    author_verified: true,
    content: 'Available trucks! We have 3 dry vans and 2 reefers ready for dispatch out of Atlanta next week. Looking for dispatchers with Southeast to Northeast lanes. DOT verified and all insurance current.',
    post_type: 'looking_for',
    likes_count: 15,
    comments_count: 6,
    liked_by_current_user: false,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'post-7',
    author_id: 'user-7',
    author_name: 'David Chen',
    author_company: 'FreightPro Dispatch',
    author_type: 'dispatcher',
    author_image: 'https://d64gsuwffb70l.cloudfront.net/6967ea24d7d2122c9a86ad94_1768418482552_750125b3.png',
    author_verified: true,
    content: 'Just passed the 100 connections milestone on DispatchLink! This community is incredible for building real business relationships. Grateful for every carrier and fellow dispatcher who has connected.',
    post_type: 'milestone',
    likes_count: 53,
    comments_count: 11,
    liked_by_current_user: false,
    created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
];

const postTypes = [
  { id: 'update', label: 'Update' },
  { id: 'looking_for', label: 'Looking For' },
  { id: 'news', label: 'News' },
  { id: 'milestone', label: 'Milestone' },
];

const SocialFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPostType, setSelectedPostType] = useState('update');
  const [filterType, setFilterType] = useState<string>('all');

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author_id: 'demo-user-1',
      author_name: 'John Smith',
      author_company: 'Smith Dispatch Services',
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
          <h1 className="text-2xl font-bold text-[#1a365d]">Feed</h1>
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
                        ? 'bg-[#ff6b35] text-white'
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
              className="flex items-center gap-2 px-4 py-2 bg-[#1a365d] text-white rounded-lg text-sm font-medium hover:bg-[#2d4a6f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  ? 'bg-[#1a365d] text-white'
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
            <PenSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No posts yet</h3>
            <p className="text-gray-500">Be the first to share something with the community</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialFeed;
