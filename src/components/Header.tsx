import React, { useState, useRef, useEffect } from 'react';
import { Truck, Menu, X, User, LogIn, Settings, LayoutDashboard, Bell, MessageSquare, Users, UserPlus } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

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
  const { currentUser, unreadMessages, pendingConnections } = useAppContext();

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

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
    <header className="bg-[#1E3A5F] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentView('home')}
          >
            <div className="bg-[#3B82F6] p-2 rounded-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="relative flex h-2 w-2">
              <span className="animate-live-dot absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <div>
              <span className="text-xl font-bold">DispatchLink</span>
              <span className="text-xs block text-gray-300">Trucking Network</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`text-sm font-medium transition-colors hover:text-[#3B82F6] ${
                  currentView === item.id ? 'text-[#3B82F6]' : 'text-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}

            {isLoggedIn && userType === 'dispatcher' && (
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`text-sm font-medium transition-colors hover:text-[#3B82F6] flex items-center gap-1 ${
                  currentView === 'dashboard' ? 'text-[#3B82F6]' : 'text-gray-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            )}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative flex items-center gap-2">
                {/* Messages */}
                <button
                  onClick={() => setCurrentView('messages')}
                  className="p-2 rounded-lg hover:bg-[#1E3A5F]/80 transition-colors relative"
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
                    className="p-2 rounded-lg hover:bg-[#1E3A5F]/80 transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {pendingConnections > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#3B82F6] rounded-full text-[10px] flex items-center justify-center font-bold">
                        {pendingConnections}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                        <span className="text-xs text-[#3B82F6] font-medium cursor-pointer hover:underline">Mark all read</span>
                      </div>
                      <div className="py-8 text-center">
                        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No notifications yet</p>
                      </div>
                      <div className="px-4 py-3 border-t border-gray-100 text-center">
                        <button
                          onClick={() => {
                            setNotificationsOpen(false);
                            setCurrentView('connections');
                          }}
                          className="text-xs text-[#1E3A5F] font-medium hover:underline"
                        >
                          View All Notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1E3A5F]/80 transition-colors"
                >
                  <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{userName}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">{userName}</p>
                      <p className="text-xs text-gray-500 capitalize">{userType} Account</p>
                    </div>

                    {userType === 'dispatcher' && (
                      <button
                        onClick={() => {
                          setCurrentView('dashboard');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setCurrentView('connections');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      My Connections
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('messages');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Messages
                      {unreadMessages > 0 && (
                        <span className="ml-auto px-2 py-0.5 bg-[#3B82F6] text-white text-xs rounded-full">{unreadMessages}</span>
                      )}
                    </button>
                    <button
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
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
                  className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors"
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
            className="md:hidden p-2 rounded-lg hover:bg-[#1E3A5F]/80 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1E3A5F] border-t border-[#1E3A5F]">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === item.id
                    ? 'bg-[#3B82F6] text-white'
                    : 'text-gray-200 hover:bg-[#1E3A5F]/80'
                }`}
              >
                {item.label}
              </button>
            ))}

            {isLoggedIn && (
              <>
                {userType === 'dispatcher' && (
                  <button
                    onClick={() => {
                      setCurrentView('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      currentView === 'dashboard'
                        ? 'bg-[#3B82F6] text-white'
                        : 'text-gray-200 hover:bg-[#1E3A5F]/80'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                )}
                <button
                  onClick={() => {
                    setCurrentView('connections');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-[#1E3A5F]/80 flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Connections
                </button>
                <button
                  onClick={() => {
                    setCurrentView('messages');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-[#1E3A5F]/80 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Messages
                  {unreadMessages > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-[#3B82F6] text-white text-xs rounded-full">{unreadMessages}</span>
                  )}
                </button>
              </>
            )}

            <div className="pt-4 border-t border-[#1E3A5F] space-y-2">
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-300">
                    Signed in as <span className="font-medium text-white">{userName}</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
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
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-200 hover:bg-[#1E3A5F]/80 rounded-lg"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      onSignupClick();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-center px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
