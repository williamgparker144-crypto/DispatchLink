import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, User, LogIn, Settings, LayoutDashboard, Bell, MessageSquare, Users, UserPlus, Megaphone, Trash2, AlertTriangle, FileText } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { deleteUserAccount, getPendingConnectionRequests, getUserById, acceptConnection, rejectConnection, getConnectionFeedNotifications } from '@/lib/api';

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignupClick, currentView, setCurrentView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { currentUser, logout, unreadMessages, pendingConnections, setPendingConnections, feedNotifications, setFeedNotifications } = useAppContext();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Notification items for bell dropdown
  interface NotifItem {
    connectionId: string;
    userId: string;
    name: string;
    company: string;
    userType: string;
    image?: string;
    createdAt: string;
  }
  const [notifItems, setNotifItems] = useState<NotifItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Feed post notifications
  interface FeedNotifItem {
    postId: string;
    authorName: string;
    authorCompany: string;
    authorType: string;
    authorImage: string;
    content: string;
    postType: string;
    createdAt: string;
  }
  const [feedNotifItems, setFeedNotifItems] = useState<FeedNotifItem[]>([]);

  // Fetch pending connection requests + feed notifications when dropdown opens
  useEffect(() => {
    if (!notificationsOpen || !currentUser?.id) return;
    let cancelled = false;
    (async () => {
      setNotifLoading(true);
      try {
        const lastSeen = localStorage.getItem('dispatchlink_feed_last_seen') || new Date(0).toISOString();

        const [pendingReqs, feedPosts] = await Promise.all([
          getPendingConnectionRequests(currentUser.id),
          getConnectionFeedNotifications(currentUser.id, lastSeen).catch(() => []),
        ]);

        if (cancelled) return;

        // Map connection requests
        const items: NotifItem[] = [];
        for (const req of (pendingReqs || [])) {
          try {
            const user = await getUserById(req.requester_id);
            if (user) {
              items.push({
                connectionId: req.id,
                userId: user.id,
                name: `${user.first_name} ${user.last_name}`,
                company: user.company_name || '',
                userType: user.user_type || '',
                image: user.profile_image_url || undefined,
                createdAt: req.created_at,
              });
            }
          } catch { /* skip */ }
        }
        if (!cancelled) {
          setNotifItems(items);
          setFeedNotifItems(feedPosts.map((p: any) => ({
            postId: p.id,
            authorName: p.authorName,
            authorCompany: p.authorCompany,
            authorType: p.authorType,
            authorImage: p.authorImage,
            content: p.content,
            postType: p.postType,
            createdAt: p.createdAt,
          })));
        }
      } catch {
        if (!cancelled) {
          setNotifItems([]);
          setFeedNotifItems([]);
        }
      } finally {
        if (!cancelled) setNotifLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [notificationsOpen, currentUser?.id]);

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      await acceptConnection(connectionId);
      setNotifItems(prev => prev.filter(n => n.connectionId !== connectionId));
      setPendingConnections(Math.max(0, pendingConnections - 1));
    } catch (err) {
      console.warn('Failed to accept connection:', err);
    }
  };

  const handleRejectConnection = async (connectionId: string) => {
    try {
      await rejectConnection(connectionId);
      setNotifItems(prev => prev.filter(n => n.connectionId !== connectionId));
      setPendingConnections(Math.max(0, pendingConnections - 1));
    } catch (err) {
      console.warn('Failed to reject connection:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser?.id) return;
    setDeleting(true);
    try {
      await deleteUserAccount(currentUser.id);
      // Clear all local storage to fully remove traces
      localStorage.removeItem('dispatchlink_session');
      localStorage.removeItem('dispatchlink_users');
      logout();
      setCurrentView('home');
      setDeleteConfirmOpen(false);
      setUserMenuOpen(false);
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert('Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (notificationsOpen || userMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen, userMenuOpen]);

  const isLoggedIn = !!currentUser;
  const userType = currentUser?.userType || null;
  const userName = currentUser?.name || '';

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'feed', label: 'Feed' },
    { id: 'dispatchers', label: 'Find Dispatchers' },
    { id: 'carriers', label: 'Find Carriers' },
    { id: 'brokers', label: 'Brokers' },
    { id: 'verify', label: 'Verify DOT/MC' },
    { id: 'carrierscout', label: 'CarrierScout' },
  ];

  return (
    <header className="bg-[#1E3A5F]/95 backdrop-blur-md text-white sticky top-0 z-50 shadow-lg shadow-[#1E3A5F]/20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentView('home')}
          >
            <img
              src="/dispatchlink-logo-dark.svg"
              alt="DispatchLink"
              className="h-10 sm:h-12 w-auto"
            />
            <span className="relative flex h-2 w-2">
              <span className="animate-live-dot absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                  currentView === item.id
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
                {/* Active underline indicator */}
                {currentView === item.id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-[#3B82F6] rounded-full" />
                )}
              </button>
            ))}

            {isLoggedIn && userType === 'dispatcher' && (
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-md flex items-center gap-1 ${
                  currentView === 'dashboard'
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
                {currentView === 'dashboard' && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-[#3B82F6] rounded-full" />
                )}
              </button>
            )}
            {isLoggedIn && userType === 'advertiser' && (
              <button
                onClick={() => setCurrentView('advertiser-dashboard')}
                className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-md flex items-center gap-1 ${
                  currentView === 'advertiser-dashboard'
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                Ad Dashboard
                {currentView === 'advertiser-dashboard' && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-[#F59E0B] rounded-full" />
                )}
              </button>
            )}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <div className="flex items-center gap-1">
                {/* Messages */}
                <button
                  onClick={() => setCurrentView('messages')}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#3B82F6] rounded-full text-[10px] flex items-center justify-center font-bold">
                      {unreadMessages}
                    </span>
                  )}
                </button>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setUserMenuOpen(false);
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {(pendingConnections + feedNotifications) > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#3B82F6] rounded-full text-[10px] flex items-center justify-center font-bold">
                        {pendingConnections + feedNotifications}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                        {(notifItems.length + feedNotifItems.length) > 0 && (
                          <span className="text-xs text-gray-400">{notifItems.length + feedNotifItems.length} new</span>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifLoading ? (
                          <div className="py-8 text-center">
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#3B82F6] rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Loading...</p>
                          </div>
                        ) : (notifItems.length === 0 && feedNotifItems.length === 0) ? (
                          <div className="py-8 text-center">
                            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No notifications yet</p>
                          </div>
                        ) : (
                          <>
                            {/* Connection requests */}
                            {notifItems.length > 0 && (
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Connection Requests</p>
                              </div>
                            )}
                            {notifItems.map(item => (
                              <div key={item.connectionId} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                                    {item.image ? (
                                      <img src={item.image} alt={item.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                      item.name.charAt(0)
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">
                                      <span className="font-semibold">{item.name}</span>
                                      <span className="text-gray-500"> wants to connect</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      {item.company && `${item.company} · `}
                                      <span className="capitalize">{item.userType}</span>
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => handleAcceptConnection(item.connectionId)}
                                        className="px-3 py-1 bg-[#1E3A5F] text-white text-xs font-medium rounded-lg hover:bg-[#1E3A5F]/80 transition-colors"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        onClick={() => handleRejectConnection(item.connectionId)}
                                        className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                      >
                                        Decline
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Feed activity notifications */}
                            {feedNotifItems.length > 0 && (
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Feed Activity</p>
                              </div>
                            )}
                            {feedNotifItems.map(item => (
                              <div
                                key={item.postId}
                                className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => {
                                  // Mark feed as seen and navigate to feed
                                  localStorage.setItem('dispatchlink_feed_last_seen', new Date().toISOString());
                                  setFeedNotifications(0);
                                  setFeedNotifItems([]);
                                  setNotificationsOpen(false);
                                  setCurrentView('feed');
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10B981] to-[#3B82F6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                                    {item.authorImage ? (
                                      <img src={item.authorImage} alt={item.authorName} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                      item.authorName.charAt(0)
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">
                                      <span className="font-semibold">{item.authorName}</span>
                                      <span className="text-gray-500"> shared a {item.postType === 'looking_for' ? 'request' : item.postType}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.content}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                      {item.authorCompany && `${item.authorCompany} · `}
                                      {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="w-2 h-2 rounded-full bg-[#3B82F6] flex-shrink-0 mt-2" />
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setNotificationsOpen(false);
                            setCurrentView('connections');
                          }}
                          className="text-xs text-[#1E3A5F] font-medium hover:underline"
                        >
                          View Connections
                        </button>
                        {feedNotifItems.length > 0 && (
                          <button
                            onClick={() => {
                              localStorage.setItem('dispatchlink_feed_last_seen', new Date().toISOString());
                              setFeedNotifications(0);
                              setFeedNotifItems([]);
                              setNotificationsOpen(false);
                              setCurrentView('feed');
                            }}
                            className="text-xs text-[#3B82F6] font-medium hover:underline"
                          >
                            View Feed
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors ml-1"
                  >
                    {/* Avatar - LinkedIn/Facebook style */}
                    <div className="relative">
                      <div className="avatar-ring-sm w-8 h-8">
                        <div className="w-full h-full rounded-full bg-[#3B82F6] flex items-center justify-center overflow-hidden">
                          {currentUser?.image ? (
                            <img src={currentUser.image} alt={userName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-white text-sm font-bold">{userName.charAt(0)}</span>
                          )}
                        </div>
                      </div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10B981] border-[1.5px] border-[#1E3A5F] rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate">{userName}</span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-50 overflow-hidden animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500 capitalize">{userType} Account</p>
                      </div>

                      <button
                        onClick={() => {
                          setCurrentView('profile');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </button>
                      {userType === 'dispatcher' && (
                        <button
                          onClick={() => {
                            setCurrentView('dashboard');
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </button>
                      )}
                      {userType === 'advertiser' && (
                        <button
                          onClick={() => {
                            setCurrentView('advertiser-dashboard');
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Megaphone className="w-4 h-4" />
                          Ad Dashboard
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setCurrentView('connections');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        My Connections
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('messages');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Messages
                        {unreadMessages > 0 && (
                          <span className="ml-auto px-2 py-0.5 bg-[#3B82F6] text-white text-xs rounded-full">{unreadMessages}</span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('settings');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setDeleteConfirmOpen(true);
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            setCurrentView('home');
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:text-[#3B82F6] transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button
                  onClick={onSignupClick}
                  className="flex items-center gap-2 px-4 py-2 btn-glossy-primary rounded-lg text-sm transition-all"
                >
                  <User className="w-4 h-4" />
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1E3A5F] border-t border-white/10 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentView === item.id
                    ? 'bg-[#3B82F6] text-white'
                    : 'text-gray-200 hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}

            {isLoggedIn && (
              <>
                <button
                  onClick={() => {
                    setCurrentView('profile');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    currentView === 'profile'
                      ? 'bg-[#3B82F6] text-white'
                      : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <User className="w-4 h-4" />
                  My Profile
                </button>
                {userType === 'dispatcher' && (
                  <button
                    onClick={() => {
                      setCurrentView('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      currentView === 'dashboard'
                        ? 'bg-[#3B82F6] text-white'
                        : 'text-gray-200 hover:bg-white/10'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                )}
                {userType === 'advertiser' && (
                  <button
                    onClick={() => {
                      setCurrentView('advertiser-dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      currentView === 'advertiser-dashboard'
                        ? 'bg-[#F59E0B] text-white'
                        : 'text-gray-200 hover:bg-white/10'
                    }`}
                  >
                    <Megaphone className="w-4 h-4" />
                    Ad Dashboard
                  </button>
                )}
                <button
                  onClick={() => {
                    setCurrentView('connections');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Connections
                </button>
                <button
                  onClick={() => {
                    setCurrentView('messages');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Messages
                  {unreadMessages > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-[#3B82F6] text-white text-xs rounded-full">{unreadMessages}</span>
                  )}
                </button>
              </>
            )}

            <div className="pt-3 border-t border-white/10 space-y-1">
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-300 flex items-center gap-2">
                    <div className="relative">
                      <div className="w-6 h-6 rounded-full bg-[#3B82F6] flex items-center justify-center overflow-hidden">
                        {currentUser?.image ? (
                          <img src={currentUser.image} alt={userName} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <span className="text-white text-xs font-bold">{userName.charAt(0)}</span>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#10B981] border-[1.5px] border-[#1E3A5F] rounded-full"></div>
                    </div>
                    <span className="font-medium text-white">{userName}</span>
                  </div>
                  <button
                    onClick={() => {
                      setDeleteConfirmOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-center px-4 py-2.5 bg-red-500/10 text-red-300 rounded-lg text-sm font-medium hover:bg-red-500/20 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setCurrentView('home');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-center px-4 py-2.5 bg-red-500/20 text-red-300 rounded-lg text-sm font-medium hover:bg-red-500/30"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onLoginClick();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/10 rounded-lg"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      onSignupClick();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-center px-4 py-2.5 btn-glossy-primary rounded-lg text-sm transition-all"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Delete Account Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to permanently delete your account? This will remove your profile, connections, messages, and all associated data from DispatchLink.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleting}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete My Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
