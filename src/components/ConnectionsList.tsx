import React, { useState, useEffect, useCallback } from 'react';
import { Users, Clock, Send, UserCheck, Shield, Search, Loader2, UserPlus } from 'lucide-react';
import ConnectionButton from './ConnectionButton';
import { useAppContext } from '@/contexts/AppContext';
import {
  getConnections,
  getPendingConnectionRequests,
  getSentConnectionRequests,
  acceptConnection,
  rejectConnection,
  getUserById,
  searchUsers,
  getAllUsers,
  sendConnectionRequest,
  getConnectionStatus,
} from '@/lib/api';
import type { ViewableUser } from '@/types';

interface ConnectionEntry {
  id: string; // connection row ID
  userId: string; // the other user's ID
  name: string;
  company: string;
  userType: 'dispatcher' | 'carrier' | 'broker' | 'advertiser';
  image?: string;
  verified: boolean;
  connectedAt?: string;
}

interface SearchResult {
  id: string;
  name: string;
  company: string;
  userType: string;
  image?: string;
  verified: boolean;
  connectionStatus: 'none' | 'pending_sent' | 'pending_received' | 'connected';
  connectionId?: string;
}

interface ConnectionsListProps {
  onViewProfile?: (user: ViewableUser) => void;
}

const ConnectionsList: React.FC<ConnectionsListProps> = ({ onViewProfile }) => {
  const { currentUser, onlineUserIds } = useAppContext();
  const [activeTab, setActiveTab] = useState<'find' | 'connections' | 'pending' | 'sent'>('find');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<ConnectionEntry[]>([]);
  const [pending, setPending] = useState<ConnectionEntry[]>([]);
  const [sent, setSent] = useState<ConnectionEntry[]>([]);

  // Find People state
  const [findQuery, setFindQuery] = useState('');
  const [allPeople, setAllPeople] = useState<SearchResult[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingPeople, setLoadingPeople] = useState(true);

  // Resolve a user ID to a ConnectionEntry
  const resolveUser = useCallback(async (connId: string, userId: string, connectedAt?: string): Promise<ConnectionEntry | null> => {
    try {
      const dbUser = await getUserById(userId);
      if (!dbUser) return null;
      return {
        id: connId,
        userId: dbUser.id,
        name: `${dbUser.first_name} ${dbUser.last_name}`,
        company: dbUser.company_name || '',
        userType: dbUser.user_type as ConnectionEntry['userType'],
        image: dbUser.profile_image_url,
        verified: dbUser.verified ?? false,
        connectedAt,
      };
    } catch {
      return null;
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const [accepted, pendingReqs, sentReqs] = await Promise.all([
        getConnections(currentUser.id),
        getPendingConnectionRequests(currentUser.id),
        getSentConnectionRequests(currentUser.id),
      ]);

      // Resolve accepted connections
      const connPromises = (accepted || []).map((c: any) => {
        const otherId = c.requester_id === currentUser.id ? c.recipient_id : c.requester_id;
        return resolveUser(c.id, otherId, c.updated_at || c.created_at);
      });

      // Resolve pending (received) — other user is the requester
      const pendingPromises = (pendingReqs || []).map((c: any) =>
        resolveUser(c.id, c.requester_id, c.created_at)
      );

      // Resolve sent — other user is the recipient
      const sentPromises = (sentReqs || []).map((c: any) =>
        resolveUser(c.id, c.recipient_id, c.created_at)
      );

      const [connResults, pendingResults, sentResults] = await Promise.all([
        Promise.all(connPromises),
        Promise.all(pendingPromises),
        Promise.all(sentPromises),
      ]);

      setConnections(connResults.filter((c): c is ConnectionEntry => c !== null));
      setPending(pendingResults.filter((c): c is ConnectionEntry => c !== null));
      setSent(sentResults.filter((c): c is ConnectionEntry => c !== null));
    } catch (err) {
      console.warn('Failed to load connections:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, resolveUser]);

  useEffect(() => { loadData(); }, [loadData]);

  // Helper: resolve connection status for a batch of users
  const resolveConnectionStatuses = useCallback(async (users: any[]): Promise<SearchResult[]> => {
    if (!currentUser?.id) return [];
    return Promise.all(
      users.map(async (u: any) => {
        let connectionStatus: SearchResult['connectionStatus'] = 'none';
        let connectionId: string | undefined;
        try {
          const conn = await getConnectionStatus(currentUser.id, u.id);
          if (conn) {
            connectionId = conn.id;
            if (conn.status === 'accepted') {
              connectionStatus = 'connected';
            } else if (conn.status === 'pending') {
              connectionStatus = conn.requester_id === currentUser.id ? 'pending_sent' : 'pending_received';
            }
          }
        } catch {
          // No connection found — status stays 'none'
        }
        return {
          id: u.id,
          name: `${u.first_name} ${u.last_name}`,
          company: u.company_name || '',
          userType: u.user_type,
          image: u.profile_image_url || undefined,
          verified: u.verified ?? false,
          connectionStatus,
          connectionId,
        };
      })
    );
  }, [currentUser?.id]);

  // Auto-load all platform users on mount
  useEffect(() => {
    if (!currentUser?.id) return;
    (async () => {
      setLoadingPeople(true);
      try {
        const users = await getAllUsers(currentUser.id);
        const results = await resolveConnectionStatuses(users);
        setAllPeople(results);
      } catch (err) {
        console.warn('Failed to load people:', err);
      } finally {
        setLoadingPeople(false);
      }
    })();
  }, [currentUser?.id, resolveConnectionStatuses]);

  // Find People search (filters the already-loaded list, or searches server for specific queries)
  const handleSearch = useCallback(async () => {
    if (!currentUser?.id || findQuery.trim().length < 2) return;
    setSearching(true);
    try {
      const users = await searchUsers(findQuery, currentUser.id);
      const results = await resolveConnectionStatuses(users);
      setSearchResults(results);
    } catch (err) {
      console.warn('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [currentUser?.id, findQuery, resolveConnectionStatuses]);

  const updatePersonStatus = (userId: string, status: SearchResult['connectionStatus'], connectionId?: string) => {
    const updater = (prev: SearchResult[]) =>
      prev.map(r => r.id === userId ? { ...r, connectionStatus: status, connectionId } : r);
    setSearchResults(updater);
    setAllPeople(updater);
  };

  const handleSendRequest = async (userId: string) => {
    if (!currentUser?.id) return;
    try {
      const conn = await sendConnectionRequest(currentUser.id, userId);
      updatePersonStatus(userId, 'pending_sent', conn.id);
      await loadData();
    } catch (err) {
      console.warn('Failed to send connection request:', err);
      alert('Failed to send connection request. Please try again.');
    }
  };

  const handleAcceptFromSearch = async (connectionId: string, userId: string) => {
    try {
      await acceptConnection(connectionId);
      updatePersonStatus(userId, 'connected');
      await loadData();
    } catch (err) {
      console.warn('Failed to accept:', err);
    }
  };

  const handleRejectFromSearch = async (connectionId: string, userId: string) => {
    try {
      await rejectConnection(connectionId);
      updatePersonStatus(userId, 'none', undefined);
      await loadData();
    } catch (err) {
      console.warn('Failed to reject:', err);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'dispatcher':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Dispatcher</span>;
      case 'carrier':
        return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Carrier</span>;
      case 'broker':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Broker</span>;
      case 'advertiser':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Advertiser</span>;
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

  const handleEntryClick = (entry: { userId?: string; id: string; name: string; company: string; userType: string; image?: string; verified: boolean }) => {
    onViewProfile?.({
      id: entry.userId || entry.id,
      name: entry.name,
      company: entry.company,
      userType: entry.userType as ViewableUser['userType'],
      image: entry.image,
      verified: entry.verified,
    });
  };

  const handleAccept = async (connectionId: string) => {
    try {
      await acceptConnection(connectionId);
      await loadData();
    } catch (err) {
      console.warn('Failed to accept:', err);
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      await rejectConnection(connectionId);
      await loadData();
    } catch (err) {
      console.warn('Failed to reject:', err);
    }
  };

  const renderConnectionCard = (entry: ConnectionEntry, variant: 'connection' | 'pending' | 'sent') => (
    <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className="relative flex-shrink-0 cursor-pointer" onClick={() => handleEntryClick(entry)}>
        <div className="avatar-ring w-14 h-14">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center text-white font-bold text-xl overflow-hidden">
            {entry.image ? (
              <img src={entry.image} alt={entry.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              entry.name.charAt(0)
            )}
          </div>
        </div>
        {onlineUserIds.has(entry.userId) && (
          <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#10B981] border-2 border-white rounded-full"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[#1E3A5F] cursor-pointer hover:underline" onClick={() => handleEntryClick(entry)}>{entry.name}</span>
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
          <ConnectionButton
            status="pending_received"
            onConnect={() => {}}
            onAccept={() => handleAccept(entry.id)}
            onReject={() => handleReject(entry.id)}
            size="sm"
          />
        )}
        {variant === 'sent' && (
          <ConnectionButton status="pending_sent" onConnect={() => {}} size="sm" />
        )}
      </div>
    </div>
  );

  const renderSearchResultCard = (result: SearchResult) => (
    <div key={result.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className="relative flex-shrink-0 cursor-pointer" onClick={() => handleEntryClick(result)}>
        <div className="avatar-ring w-14 h-14">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center text-white font-bold text-xl overflow-hidden">
            {result.image ? (
              <img src={result.image} alt={result.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              result.name.charAt(0)
            )}
          </div>
        </div>
        {onlineUserIds.has(result.id) && (
          <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#10B981] border-2 border-white rounded-full"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[#1E3A5F] cursor-pointer hover:underline" onClick={() => handleEntryClick(result)}>{result.name}</span>
          {result.verified && <Shield className="w-4 h-4 text-green-500" />}
          {getTypeBadge(result.userType)}
        </div>
        <p className="text-sm text-gray-500 truncate">{result.company}</p>
      </div>
      <div className="flex-shrink-0">
        <ConnectionButton
          status={result.connectionStatus}
          onConnect={() => handleSendRequest(result.id)}
          onAccept={result.connectionId ? () => handleAcceptFromSearch(result.connectionId!, result.id) : undefined}
          onReject={result.connectionId ? () => handleRejectFromSearch(result.connectionId!, result.id) : undefined}
          size="sm"
        />
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
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('find')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'find' ? 'bg-[#3B82F6] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Search className="w-4 h-4" />
            Find People
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'connections' ? 'bg-[#1E3A5F] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            My Connections ({connections.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'pending' ? 'bg-[#1E3A5F] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending ({pending.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'sent' ? 'bg-[#1E3A5F] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Send className="w-4 h-4" />
            Sent ({sent.length})
          </button>
        </div>

        {/* Find People Tab */}
        {activeTab === 'find' && (
          <div>
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={findQuery}
                  onChange={(e) => {
                    setFindQuery(e.target.value);
                    if (e.target.value.trim().length < 2) {
                      setSearchResults([]);
                    }
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && findQuery.trim().length >= 2 && handleSearch()}
                  placeholder="Search by name or company..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                />
              </div>
              {findQuery.trim().length >= 2 && (
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-medium hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </button>
              )}
            </div>

            {/* Show search results when actively searching */}
            {searching && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin mx-auto mb-3" />
                <p className="text-gray-500">Searching...</p>
              </div>
            )}

            {!searching && searchResults.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-2">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found</p>
                {searchResults.map(renderSearchResultCard)}
              </div>
            )}

            {/* Default: show all platform users */}
            {!searching && searchResults.length === 0 && (
              <>
                {loadingPeople ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin mx-auto mb-3" />
                    <p className="text-gray-500">Loading people on the platform...</p>
                  </div>
                ) : allPeople.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 mb-2">
                      {allPeople.length} {allPeople.length === 1 ? 'person' : 'people'} on the platform
                    </p>
                    {allPeople
                      .filter(p => {
                        if (!findQuery.trim()) return true;
                        const q = findQuery.toLowerCase();
                        return p.name.toLowerCase().includes(q) || p.company.toLowerCase().includes(q);
                      })
                      .map(renderSearchResultCard)}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No other users yet</h3>
                    <p className="text-gray-500">Invite dispatchers, carriers, and brokers to join the platform</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Search bar for connections/pending/sent tabs */}
        {activeTab !== 'find' && (
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter connections..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
            />
          </div>
        )}

        {/* Loading */}
        {activeTab !== 'find' && loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading connections...</p>
          </div>
        )}

        {/* Connection Lists */}
        {activeTab !== 'find' && !loading && (
          <div className="space-y-3">
            {activeTab === 'connections' && filterBySearch(connections).map(c => renderConnectionCard(c, 'connection'))}
            {activeTab === 'pending' && filterBySearch(pending).map(c => renderConnectionCard(c, 'pending'))}
            {activeTab === 'sent' && filterBySearch(sent).map(c => renderConnectionCard(c, 'sent'))}

            {activeTab === 'connections' && filterBySearch(connections).length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No connections yet</h3>
                <p className="text-gray-500">Use the "Find People" tab to search for dispatchers, carriers, and brokers</p>
              </div>
            )}
            {activeTab === 'pending' && filterBySearch(pending).length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No pending requests</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            )}
            {activeTab === 'sent' && filterBySearch(sent).length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No sent requests</h3>
                <p className="text-gray-500">Use the "Find People" tab to find people to connect with</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ConnectionsList;
