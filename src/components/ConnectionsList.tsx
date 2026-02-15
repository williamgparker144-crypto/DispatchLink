import React, { useState } from 'react';
import { Users, Clock, Send, UserCheck, Shield, Search } from 'lucide-react';
import ConnectionButton from './ConnectionButton';

interface ConnectionEntry {
  id: string;
  name: string;
  company: string;
  userType: 'dispatcher' | 'carrier' | 'broker';
  image?: string;
  verified: boolean;
  connectedAt?: string;
}

const sampleConnections: ConnectionEntry[] = [];

const samplePending: ConnectionEntry[] = [];

const sampleSent: ConnectionEntry[] = [];

const ConnectionsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'connections' | 'pending' | 'sent'>('connections');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filterBySearch = (entries: ConnectionEntry[]) => {
    if (!searchQuery) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.company.toLowerCase().includes(q)
    );
  };

  const renderConnectionCard = (entry: ConnectionEntry, variant: 'connection' | 'pending' | 'sent') => (
    <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className="relative flex-shrink-0">
        <div className="avatar-ring w-14 h-14">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center text-white font-bold text-xl overflow-hidden">
            {entry.image ? (
              <img src={entry.image} alt={entry.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              entry.name.charAt(0)
            )}
          </div>
        </div>
        <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#10B981] border-2 border-white rounded-full"></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[#1E3A5F]">{entry.name}</span>
          {entry.verified && <Shield className="w-4 h-4 text-green-500" />}
          {getTypeBadge(entry.userType)}
        </div>
        <p className="text-sm text-gray-500 truncate">{entry.company}</p>
        {entry.connectedAt && (
          <p className="text-xs text-gray-400 mt-1">Connected {new Date(entry.connectedAt).toLocaleDateString()}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        {variant === 'connection' && (
          <ConnectionButton status="connected" onConnect={() => {}} size="sm" />
        )}
        {variant === 'pending' && (
          <ConnectionButton status="pending_received" onConnect={() => {}} onAccept={() => {}} onReject={() => {}} size="sm" />
        )}
        {variant === 'sent' && (
          <ConnectionButton status="pending_sent" onConnect={() => {}} size="sm" />
        )}
      </div>
    </div>
  );

  return (
    <section className="py-8 page-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Connections</h1>
          <p className="text-gray-600">Manage your professional network</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'connections' ? 'bg-[#1E3A5F] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            My Connections ({sampleConnections.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'pending' ? 'bg-[#1E3A5F] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending ({samplePending.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'sent' ? 'bg-[#1E3A5F] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Send className="w-4 h-4" />
            Sent ({sampleSent.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search connections..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
          />
        </div>

        {/* Connection Lists */}
        <div className="space-y-3">
          {activeTab === 'connections' && filterBySearch(sampleConnections).map(c => renderConnectionCard(c, 'connection'))}
          {activeTab === 'pending' && filterBySearch(samplePending).map(c => renderConnectionCard(c, 'pending'))}
          {activeTab === 'sent' && filterBySearch(sampleSent).map(c => renderConnectionCard(c, 'sent'))}

          {activeTab === 'connections' && filterBySearch(sampleConnections).length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No connections yet</h3>
              <p className="text-gray-500">Start connecting with dispatchers, carriers, and brokers</p>
            </div>
          )}
          {activeTab === 'pending' && filterBySearch(samplePending).length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No pending requests</h3>
              <p className="text-gray-500">You're all caught up!</p>
            </div>
          )}
          {activeTab === 'sent' && filterBySearch(sampleSent).length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No sent requests</h3>
              <p className="text-gray-500">Browse the directory to find people to connect with</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ConnectionsList;
