import React, { useState } from 'react';
import { Send, Search, MessageSquare, Shield } from 'lucide-react';
import type { Conversation, Message } from '@/types';

const sampleConversations: Conversation[] = [];

const sampleMessages: Record<string, Message[]> = {};

const MessagesView: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState(sampleMessages);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      conversation_id: selectedConversation,
      sender_id: 'demo-user-1',
      sender_name: 'You',
      content: messageInput,
      read: true,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => ({
      ...prev,
      [selectedConversation]: [...(prev[selectedConversation] || []), newMessage],
    }));
    setMessageInput('');
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'dispatcher':
        return <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Dispatcher</span>;
      case 'carrier':
        return <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">Carrier</span>;
      case 'broker':
        return <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Broker</span>;
      default:
        return null;
    }
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  const filteredConversations = sampleConversations.filter(c =>
    c.participant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.participant_company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = sampleConversations.find(c => c.id === selectedConversation);
  const currentMessages = selectedConversation ? (messages[selectedConversation] || []) : [];

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
                {filteredConversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
                      selectedConversation === conv.id ? 'bg-blue-50 border-l-2 border-[#1E3A5F]' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A5F] to-[#1E3A5F]/80 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {conv.participant_image ? (
                        <img src={conv.participant_image} alt={conv.participant_name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        conv.participant_name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 truncate">{conv.participant_name}</span>
                        <span className="text-xs text-gray-400">{timeAgo(conv.last_message_at)}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{conv.last_message}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="w-5 h-5 bg-[#3B82F6] text-white rounded-full text-xs flex items-center justify-center flex-shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 flex flex-col">
              {selectedConv ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A5F] to-[#1E3A5F]/80 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {selectedConv.participant_image ? (
                        <img src={selectedConv.participant_image} alt={selectedConv.participant_name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        selectedConv.participant_name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1E3A5F]">{selectedConv.participant_name}</span>
                        {getTypeBadge(selectedConv.participant_type)}
                      </div>
                      <p className="text-xs text-gray-500">{selectedConv.participant_company}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {currentMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === 'demo-user-1' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                            msg.sender_id === 'demo-user-1'
                              ? 'bg-[#1E3A5F] text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-800 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.sender_id === 'demo-user-1' ? 'text-blue-200' : 'text-gray-400'}`}>
                            {timeAgo(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
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
                        className="px-4 py-2.5 bg-[#3B82F6] text-white rounded-xl hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Connect with carriers to start messaging</h3>
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
