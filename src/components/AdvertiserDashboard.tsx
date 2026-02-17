import React, { useState, useEffect } from 'react';
import { Megaphone, BarChart3, Eye, MousePointer, TrendingUp, Plus, Pause, Play, Edit3, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { getAdCampaigns, updateAdCampaign, getCampaignAnalytics } from '@/lib/api';
import type { AdCampaign, AdCreative, CampaignStatus } from '@/types';
import AdCampaignCreator from './AdCampaignCreator';

interface CampaignWithCreatives extends AdCampaign {
  ad_creatives?: AdCreative[];
}

interface CampaignAnalytics {
  impressions: number;
  clicks: number;
  ctr: string;
}

const AdvertiserDashboard: React.FC = () => {
  const { currentUser } = useAppContext();
  const [campaigns, setCampaigns] = useState<CampaignWithCreatives[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, CampaignAnalytics>>({});
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);

  const fetchCampaigns = async () => {
    if (!currentUser) return;
    try {
      const data = await getAdCampaigns(currentUser.id);
      setCampaigns(data || []);

      // Fetch analytics for each campaign
      const analyticsMap: Record<string, CampaignAnalytics> = {};
      for (const campaign of (data || [])) {
        try {
          analyticsMap[campaign.id] = await getCampaignAnalytics(campaign.id);
        } catch {
          analyticsMap[campaign.id] = { impressions: 0, clicks: 0, ctr: '0.00' };
        }
      }
      setAnalytics(analyticsMap);
    } catch (err) {
      console.warn('Failed to fetch campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [currentUser?.id]);

  const totalImpressions = Object.values(analytics).reduce((sum, a) => sum + a.impressions, 0);
  const totalClicks = Object.values(analytics).reduce((sum, a) => sum + a.clicks, 0);
  const overallCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><CheckCircle className="w-3 h-3" />Active</span>;
      case 'paused':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold"><Pause className="w-3 h-3" />Paused</span>;
      case 'draft':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold"><Edit3 className="w-3 h-3" />Draft</span>;
      case 'pending_review':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"><Clock className="w-3 h-3" />Pending Review</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold"><CheckCircle className="w-3 h-3" />Completed</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold"><XCircle className="w-3 h-3" />Rejected</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const handleTogglePause = async (campaign: CampaignWithCreatives) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    try {
      await updateAdCampaign(campaign.id, { status: newStatus });
      setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: newStatus } : c));
    } catch (err) {
      console.warn('Failed to update campaign:', err);
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'feed_post': return 'Feed Post';
      case 'directory_spotlight': return 'Directory Spotlight';
      case 'banner': return 'Banner';
      default: return format;
    }
  };

  return (
    <section className="py-6 min-h-screen page-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-xl flex items-center justify-center shadow-lg">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[#1E3A5F]">Ad Dashboard</h1>
                <p className="text-sm text-gray-500">
                  {currentUser?.businessName || currentUser?.company || 'Your Business'}
                  {currentUser?.verified && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Verified</span>}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCreator(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Campaign
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-[#F59E0B]" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Active Campaigns</span>
            </div>
            <p className="text-2xl font-extrabold text-[#1E3A5F]">{activeCampaigns}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-[#3B82F6]" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Total Impressions</span>
            </div>
            <p className="text-2xl font-extrabold text-[#1E3A5F]">{totalImpressions.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="w-5 h-5 text-[#10B981]" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Total Clicks</span>
            </div>
            <p className="text-2xl font-extrabold text-[#1E3A5F]">{totalClicks.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase">CTR</span>
            </div>
            <p className="text-2xl font-extrabold text-[#1E3A5F]">{overallCtr}%</p>
          </div>
        </div>

        {/* Campaigns */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#1E3A5F] mb-4">Your Campaigns</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-3 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-[#F59E0B]" />
            </div>
            <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">No Campaigns Yet</h3>
            <p className="text-sm text-gray-500 mb-6">Create your first ad campaign to start reaching trucking professionals.</p>
            <button
              onClick={() => setShowCreator(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Campaign
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map(campaign => {
              const stats = analytics[campaign.id] || { impressions: 0, clicks: 0, ctr: '0.00' };
              const creative = campaign.ad_creatives?.[0];
              return (
                <div key={campaign.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-[#1E3A5F]">{campaign.name}</h3>
                      {getStatusBadge(campaign.status as CampaignStatus)}
                    </div>
                    <div className="flex items-center gap-2">
                      {(campaign.status === 'active' || campaign.status === 'paused') && (
                        <button
                          onClick={() => handleTogglePause(campaign)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                            campaign.status === 'active'
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {campaign.status === 'active' ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Resume</>}
                        </button>
                      )}
                    </div>
                  </div>

                  {creative && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{creative.headline}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{creative.body_text}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Megaphone className="w-3.5 h-3.5" />{getFormatLabel(campaign.ad_format)}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{stats.impressions.toLocaleString()} impressions</span>
                    <span className="flex items-center gap-1"><MousePointer className="w-3.5 h-3.5" />{stats.clicks.toLocaleString()} clicks</span>
                    <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />{stats.ctr}% CTR</span>
                    {campaign.start_date && <span>Starts: {new Date(campaign.start_date).toLocaleDateString()}</span>}
                    {campaign.end_date && <span>Ends: {new Date(campaign.end_date).toLocaleDateString()}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreator && (
        <AdCampaignCreator
          onClose={() => setShowCreator(false)}
          onCreated={() => {
            setShowCreator(false);
            setLoading(true);
            fetchCampaigns();
          }}
        />
      )}
    </section>
  );
};

export default AdvertiserDashboard;
