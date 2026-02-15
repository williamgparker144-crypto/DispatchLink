import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  Eye,
  MessageSquare,
  Truck,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Filter,
  Search,
  BarChart3,
  Activity,
  Send,
  Inbox,
  ArrowUpRight,
  Rocket,
  UserPlus,
  MessageCircle,
} from 'lucide-react';
import CarrierScoutUpgradeCTA from './CarrierScoutUpgradeCTA';
import PendingInvitesCard from './PendingInvitesCard';

interface DispatcherDashboardProps {
  onNavigate: (view: string) => void;
}

interface MCPermissionRequest {
  id: string;
  carrierName: string;
  mcNumber: string;
  dotNumber: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  type: 'sent' | 'received';
  expiresAt?: string;
}

// Sample data — matches the pattern used throughout the app
const sampleMcPermissions: MCPermissionRequest[] = [];

const sampleAnalytics = {
  profileViews: 0,
  contactRequests: 0,
  connections: 0,
  responseRate: 0,
};

const DispatcherDashboard: React.FC<DispatcherDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'permissions'>('overview');
  const [permissionFilter, setPermissionFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [mcPermissions] = useState<MCPermissionRequest[]>(sampleMcPermissions);
  const [analytics] = useState(sampleAnalytics);

  const engagementMetrics = [
    { label: 'Profile Views', value: analytics.profileViews, change: 0, icon: <Eye className="w-5 h-5" />, color: 'bg-blue-500' },
    { label: 'Contact Requests', value: analytics.contactRequests, change: 0, icon: <MessageSquare className="w-5 h-5" />, color: 'bg-green-500' },
    { label: 'Connections', value: analytics.connections, change: 0, icon: <Users className="w-5 h-5" />, color: 'bg-purple-500' },
    { label: 'Response Rate', value: analytics.responseRate, change: 0, icon: <Activity className="w-5 h-5" />, color: 'bg-orange-500' },
  ];

  const filteredPermissions = mcPermissions.filter(perm => {
    return permissionFilter === 'all' || perm.type === permissionFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      case 'expired':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Expired</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F]/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dispatcher Dashboard</h1>
              <p className="text-blue-200">Welcome back! Here's your network overview.</p>
            </div>

            {/* Free Plan Badge */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">Free Network</span>
                    <span className="px-2 py-0.5 bg-green-400/20 text-green-300 rounded-full text-xs font-medium">Active</span>
                  </div>
                  <p className="text-sm text-blue-200">{analytics.connections} connections</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'permissions', label: 'MC Permissions', icon: <Shield className="w-4 h-4" />, count: mcPermissions.filter(p => p.status === 'approved').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#3B82F6] text-[#3B82F6]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {engagementMetrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 glass-light">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${metric.color} text-white`}>
                      {metric.icon}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      {metric.change}%
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#1E3A5F] mb-1">
                    {metric.label === 'Response Rate' ? `${metric.value}%` : metric.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{metric.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions & CarrierScout CTA */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-[#1E3A5F] mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => onNavigate('feed')} className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-[#3B82F6]" />
                      <span className="font-medium text-gray-700">Go to Feed</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button onClick={() => onNavigate('connections')} className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <UserPlus className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-700">My Connections</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button onClick={() => onNavigate('messages')} className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-gray-700">Messages</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button onClick={() => setActiveTab('permissions')} className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-purple-500" />
                      <span className="font-medium text-gray-700">Manage MC Permissions</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button onClick={() => onNavigate('carriers')} className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Search className="w-5 h-5 text-orange-500" />
                      <span className="font-medium text-gray-700">Search All Carriers</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* CarrierScout CTA + MC Permission Summary */}
              <div className="lg:col-span-2 space-y-6">
                {/* Pending Invites */}
                <PendingInvitesCard />

                {/* CarrierScout Upgrade CTA */}
                <CarrierScoutUpgradeCTA
                  featureName="Load Board & Rate Negotiations"
                  onGetNotified={() => onNavigate('loadboards')}
                />

                {/* MC Permission Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-[#1E3A5F]">MC Permission Summary</h3>
                    <button onClick={() => setActiveTab('permissions')} className="text-sm text-[#3B82F6] hover:underline flex items-center gap-1">
                      Manage All <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Approved</span>
                      </div>
                      <p className="text-2xl font-bold text-green-700">{mcPermissions.filter(p => p.status === 'approved').length}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Pending</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-700">{mcPermissions.filter(p => p.status === 'pending').length}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                      <div className="flex items-center gap-3 mb-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="font-medium text-red-800">Rejected</span>
                      </div>
                      <p className="text-2xl font-bold text-red-700">{mcPermissions.filter(p => p.status === 'rejected').length}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-800">Expired</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-700">{mcPermissions.filter(p => p.status === 'expired').length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MC Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1E3A5F]">MC Permission Requests</h2>
                  <p className="text-gray-500">Manage your MC# authority permissions with carriers</p>
                </div>
                <div className="flex gap-2">
                  {[
                    { id: 'all', label: 'All', icon: <Filter className="w-4 h-4" /> },
                    { id: 'sent', label: 'Sent', icon: <Send className="w-4 h-4" /> },
                    { id: 'received', label: 'Received', icon: <Inbox className="w-4 h-4" /> },
                  ].map(filter => (
                    <button key={filter.id} onClick={() => setPermissionFilter(filter.id as any)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${permissionFilter === filter.id ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {filter.icon}
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Carrier</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">MC Number</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">DOT Number</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Request Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Expires</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPermissions.map(permission => (
                      <tr key={permission.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#1E3A5F]/10 rounded-lg flex items-center justify-center">
                              <Truck className="w-5 h-5 text-[#1E3A5F]" />
                            </div>
                            <span className="font-medium text-gray-800">{permission.carrierName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{permission.mcNumber}</td>
                        <td className="py-4 px-6 text-gray-600">{permission.dotNumber}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${permission.type === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {permission.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{new Date(permission.requestDate).toLocaleDateString()}</td>
                        <td className="py-4 px-6">{getStatusBadge(permission.status)}</td>
                        <td className="py-4 px-6 text-gray-600">{permission.expiresAt ? new Date(permission.expiresAt).toLocaleDateString() : '-'}</td>
                        <td className="py-4 px-6 text-right">
                          {permission.status === 'pending' && permission.type === 'sent' && <button className="text-sm text-red-600 hover:underline">Cancel</button>}
                          {permission.status === 'approved' && <button className="text-sm text-[#3B82F6] hover:underline">View Details</button>}
                          {permission.status === 'rejected' && <button className="text-sm text-[#1E3A5F] hover:underline">Resend</button>}
                          {permission.status === 'expired' && <button className="text-sm text-[#1E3A5F] hover:underline">Renew</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredPermissions.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No permissions found</h3>
                  <p className="text-gray-500">No MC permission requests match your filter</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DispatcherDashboard;
