import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Search, MessageSquare, Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { getConversations, getMessages, sendMessage, markMessagesRead, getUserById, getUnreadCountPerConversation } from '@/lib/api';

interface ConversationDisplay {
  id: string;
  participantId: string;
  participantName: string;
  participantCompany: string;
  participantType: string;
  participantImage?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface MessageDisplay {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface MessagesViewProps {
  initialConversationId?: string | null;
}

const MessagesView: React.FC<MessagesViewProps> = ({ initialConversationId }) => {
  const { currentUser } = useAppContext();
  const [conversations, setConversations] = useState<ConversationDisplay[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<MessageDisplay[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = currentUser?.id || '';

  const loadConversations = useCallback(async () => {
    if (!currentUserId) return;
    setLoadingConvos(true);
    try {
      const data = await getConversations(currentUserId);
      if (!data) { setConversations([]); return; }

      const resolved: ConversationDisplay[] = [];
      for (const conv of data) {
        const otherId = conv.participant_a === currentUserId ? conv.participant_b : conv.participant_a;
        try {
          const [user, unread] = await Promise.all([
            getUserById(otherId),
            getUnreadCountPerConversation(conv.id, currentUserId),
          ]);
          if (!user) continue;
          resolved.push({
            id: conv.id,
            participantId: otherId,
            participantName: `${user.first_name} ${user.last_name}`,
            participantCompany: user.company_name || '',
            participantType: user.user_type || '',
            participantImage: user.profile_image_url,
            lastMessage: conv.last_message || '',
            lastMessageAt: conv.last_message_at || conv.created_at,
            unreadCount: unread,
          });
        } catch {
          // Skip unresolvable
        }
      }
      setConversations(resolved);
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    } finally {
      setLoadingConvos(false);
    }
  }, [currentUserId]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Auto-select initial conversation after loading
  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      setSelectedConversation(initialConversationId);
    }
  }, [initialConversationId, conversations]);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedConversation || !currentUserId) return;
    let cancelled = false;
    (async () => {
      setLoadingMessages(true);
      try {
        const data = await getMessages(selectedConversation);
        if (cancelled) return;
        const mapped: MessageDisplay[] = (data || []).map((m: any) => ({
          id: m.id,
          conversationId: m.conversation_id,
          senderId: m.sender_id,
          content: m.content,
          read: m.read,
          createdAt: m.created_at,
        }));
        setMessages(mapped);
        // Mark as read
        await markMessagesRead(selectedConversation, currentUserId);
        // Clear unread count for this conversation locally
        setConversations(prev =>
          prev.map(c => c.id === selectedConversation ? { ...c, unreadCount: 0 } : c)
        );
      } catch (err) {
        console.warn('Failed to load messages:', err);
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedConversation, currentUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !currentUserId) return;
    const content = messageInput.trim();
    setMessageInput('');

    // Optimistic update
    const optimistic: MessageDisplay = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation,
      senderId: currentUserId,
      content,
      read: true,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    // Update conversation last message locally
    setConversations(prev =>
      prev.map(c =>
        c.id === selectedConversation
          ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() }
          : c
      )
    );

    try {
      const sent = await sendMessage({
        conversation_id: selectedConversation,
        sender_id: currentUserId,
        content,
      });
      // Replace optimistic with real
      setMessages(prev =>
        prev.map(m => m.id === optimistic.id ? { ...optimistic, id: sent.id } : m)
      );
    } catch (err) {
      console.warn('Failed to send message:', err);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'dispatcher':
        return <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Dispatcher</span>;
      case 'carrier':
        return <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">Carrier</span>;
      case 'broker':
        return <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Broker</span>;
      case 'advertiser':
        return <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">Advertiser</span>;
      default:
        return null;
    }
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  const filteredConversations = conversations.filter(c =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.participantCompany.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <section className="page-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Messages</h1>
          <p className="text-gray-600">Chat with your connections</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* Conversation List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loadingConvos ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
                        selectedConversation === conv.id ? 'bg-blue-50 border-l-2 border-[#1E3A5F]' : ''
                      }`}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A5F] to-[#1E3A5F]/80 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                        {conv.participantImage ? (
                          <img src={conv.participantImage} alt={conv.participantName} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          conv.participantName.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 truncate">{conv.participantName}</span>
                          {conv.lastMessageAt && (
                            <span className="text-xs text-gray-400">{timeAgo(conv.lastMessageAt)}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{conv.lastMessage || 'Start a conversation'}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-[#3B82F6] text-white rounded-full text-xs flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 flex flex-col">
              {selectedConv ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A5F] to-[#1E3A5F]/80 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                      {selectedConv.participantImage ? (
                        <img src={selectedConv.participantImage} alt={selectedConv.participantName} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        selectedConv.participantName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1E3A5F]">{selectedConv.participantName}</span>
                        {getTypeBadge(selectedConv.participantType)}
                      </div>
                      <p className="text-xs text-gray-500">{selectedConv.participantCompany}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center">
                        <div>
                          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No messages yet. Say hello!</p>
                        </div>
                      </div>
                    ) : (
                      messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                              msg.senderId === currentUserId
                                ? 'bg-[#1E3A5F] text-white rounded-br-md'
                                : 'bg-gray-100 text-gray-800 rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.senderId === currentUserId ? 'text-blue-200' : 'text-gray-400'}`}>
                              {timeAgo(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        className="px-4 py-2.5 btn-glossy-primary rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      {conversations.length > 0
                        ? 'Select a conversation'
                        : 'Connect with others to start messaging'
                      }
                    </h3>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MessagesView;
