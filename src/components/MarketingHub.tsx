import React, { useState } from 'react';
import { 
  Target, TrendingUp, Users, Mail, Phone, Building, 
  Clock, ChevronRight, Filter, BarChart3, Zap, Eye 
} from 'lucide-react';

const sampleLeads = [
  { id: '1', company: 'Swift Logistics', contact: 'John Smith', email: 'john@swiftlogistics.com', phone: '555-0101', source: 'Google Search', query: 'truck dispatcher services', score: 92, status: 'new', time: '2 hours ago' },
  { id: '2', company: 'Prime Carriers Inc', contact: 'Sarah Johnson', email: 'sarah@primecarriers.com', phone: '555-0102', source: 'DAT Search', query: 'find dispatcher for flatbed', score: 88, status: 'new', time: '4 hours ago' },
  { id: '3', company: 'Eagle Transport', contact: 'Mike Davis', email: 'mike@eagletransport.com', phone: '555-0103', source: 'Truckstop.com', query: 'dispatcher needed reefer', score: 85, status: 'contacted', time: '1 day ago' },
  { id: '4', company: 'Mountain Freight LLC', contact: 'Lisa Brown', email: 'lisa@mountainfreight.com', phone: '555-0104', source: 'Google Search', query: 'best truck dispatchers', score: 78, status: 'new', time: '1 day ago' },
  { id: '5', company: 'Coastal Trucking', contact: 'David Wilson', email: 'david@coastaltrucking.com', phone: '555-0105', source: 'LinkedIn', query: 'dispatcher services OTR', score: 75, status: 'contacted', time: '2 days ago' },
  { id: '6', company: 'Midwest Haulers', contact: 'Jennifer Lee', email: 'jennifer@midwesthaulers.com', phone: '555-0106', source: 'Google Search', query: 'trucking dispatch company', score: 72, status: 'converted', time: '3 days ago' },
];

const MarketingHub: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'new' | 'contacted' | 'converted'>('all');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const filteredLeads = selectedStatus === 'all' 
    ? sampleLeads 
    : sampleLeads.filter(lead => lead.status === selectedStatus);

  const stats = [
    { label: 'Total Leads', value: '156', change: '+12%', icon: <Users className="w-5 h-5" /> },
    { label: 'Avg. Score', value: '82', change: '+5%', icon: <Target className="w-5 h-5" /> },
    { label: 'Conversion Rate', value: '24%', change: '+3%', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Active Campaigns', value: '4', change: '0', icon: <Zap className="w-5 h-5" /> },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'contacted': return 'bg-yellow-100 text-yellow-700';
      case 'converted': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <section className="py-12 page-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#3B82F6] rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#1E3A5F]">Intent Marketing Hub</h1>
          </div>
          <p className="text-gray-600">
            Access carriers actively searching for dispatcher services based on real-time intent data
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-[#1E3A5F]/10 rounded-lg text-[#1E3A5F]">
                  {stat.icon}
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-[#1E3A5F]">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Leads List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Filter Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-[#1E3A5F]">Intent Leads</h2>
                <div className="flex gap-2">
                  {['all', 'new', 'contacted', 'converted'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status as any)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                        selectedStatus === status
                          ? 'bg-[#1E3A5F] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leads Table */}
              <div className="divide-y divide-gray-100">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(selectedLead === lead.id ? null : lead.id)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedLead === lead.id ? 'bg-[#3B82F6]/5' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1E3A5F]/10 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-[#1E3A5F]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1E3A5F]">{lead.company}</h3>
                          <p className="text-sm text-gray-500">{lead.contact}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
                          Score: {lead.score}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {lead.source}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {lead.time}
                      </span>
                    </div>

                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Search Query:</span> "{lead.query}"
                      </p>
                    </div>

                    {/* Expanded Details */}
                    {selectedLead === lead.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid sm:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <a href={`mailto:${lead.email}`} className="text-[#3B82F6] hover:underline">
                              {lead.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${lead.phone}`} className="text-[#3B82F6] hover:underline">
                              {lead.phone}
                            </a>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors">
                            Contact Lead
                          </button>
                          <button className="py-2 px-4 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            Mark Contacted
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Intent Sources */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-[#1E3A5F] mb-4">Lead Sources</h3>
              <div className="space-y-3">
                {[
                  { source: 'Google Search', count: 68, percent: 44 },
                  { source: 'DAT', count: 42, percent: 27 },
                  { source: 'Truckstop.com', count: 28, percent: 18 },
                  { source: 'LinkedIn', count: 18, percent: 11 },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.source}</span>
                      <span className="font-medium text-[#1E3A5F]">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#3B82F6] rounded-full"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-[#1E3A5F] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-700">Create Campaign</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-700">Export Leads</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-700">View Analytics</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Upgrade CTA */}
            <div className="bg-gradient-to-br from-[#1E3A5F] to-[#1E3A5F]/80 rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-[#3B82F6]" />
                <span className="text-sm font-medium text-[#3B82F6]">Premier Feature</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Unlock More Leads</h3>
              <p className="text-sm text-gray-300 mb-4">
                Upgrade to Premier for 50+ monthly leads and advanced intent analytics.
              </p>
              <button className="w-full py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketingHub;
