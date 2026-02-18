import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { allSeedUsers } from '@/lib/seedData';
import { saveSession, loadSession, clearSession, cacheRegisteredUsers, loadCachedUsers } from '@/lib/session';
import { getUserById, getUserByAuthId, getCarrierReferences, updateUser, updateDispatcherProfile, updateAdvertiserProfile, syncCarrierReferences, getPendingConnectionRequests, getUnreadMessagesCount, getConnectionFeedNotifications, updatePresence, getOnlineUserIds } from '@/lib/api';
import { dbUserToCurrentUser, currentUserToDbFields } from '@/lib/mappers';
import { onAuthStateChange, signOutAuth } from '@/lib/auth';

export interface CarrierReference {
  carrierName: string;
  mcNumber: string;
  verified: boolean;
  /** Name of uploaded dispatch agreement file (stored locally) */
  agreementFileName?: string;
  /** Timestamp when agreement was uploaded */
  agreementUploadedAt?: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  company: string;
  userType: 'dispatcher' | 'carrier' | 'broker' | 'advertiser';
  image?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  verified: boolean;
  yearsExperience?: number;
  specialties?: string[];
  carriersWorkedWith?: CarrierReference[];
  carrierScoutSubscribed?: boolean;
  mcNumber?: string;
  dotNumber?: string;
  // Advertiser-specific
  businessName?: string;
  businessWebsite?: string;
  industry?: string;
}

export interface PendingAuthResult {
  authId: string;
  email?: string;
  phone?: string;
  name?: string;
  image?: string;
}

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  updateProfile: (updates: Partial<CurrentUser>) => void;
  logout: () => void;
  unreadMessages: number;
  setUnreadMessages: (count: number) => void;
  pendingConnections: number;
  setPendingConnections: (count: number) => void;
  feedNotifications: number;
  setFeedNotifications: (count: number) => void;
  registeredUsers: CurrentUser[];
  registerUser: (user: CurrentUser) => void;
  pendingAuthResult: PendingAuthResult | null;
  setPendingAuthResult: (result: PendingAuthResult | null) => void;
  clearPendingAuthResult: () => void;
  onlineUserIds: Set<string>;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  currentUser: null,
  setCurrentUser: () => {},
  updateProfile: () => {},
  logout: () => {},
  unreadMessages: 0,
  setUnreadMessages: () => {},
  pendingConnections: 0,
  setPendingConnections: () => {},
  feedNotifications: 0,
  setFeedNotifications: () => {},
  registeredUsers: [],
  registerUser: () => {},
  pendingAuthResult: null,
  setPendingAuthResult: () => {},
  clearPendingAuthResult: () => {},
  onlineUserIds: new Set<string>(),
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => loadSession());
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingConnections, setPendingConnections] = useState(0);
  const [feedNotifications, setFeedNotifications] = useState(0);
  const [registeredUsers, setRegisteredUsers] = useState<CurrentUser[]>(() => {
    const cached = loadCachedUsers();
    // Filter out old seed/demo users from any cached data
    const base = cached
      ? cached.filter(u => !u.id.startsWith('seed-'))
      : [];
    // Ensure the logged-in user is always in the registry
    const session = loadSession();
    if (session && !base.some(u => u.id === session.id)) {
      return [...base, session];
    }
    if (session && base.some(u => u.id === session.id)) {
      return base.map(u => u.id === session.id ? session : u);
    }
    return base;
  });

  const [pendingAuthResult, setPendingAuthResult] = useState<PendingAuthResult | null>(null);
  const clearPendingAuthResult = useCallback(() => setPendingAuthResult(null), []);

  // Supabase Auth state listener — bridges auth.users → public.users
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const authUser = session.user;
        try {
          const dbUser = await getUserByAuthId(authUser.id);
          if (dbUser) {
            // Existing user — load and set
            let carrierRefs;
            if (dbUser.user_type === 'dispatcher') {
              carrierRefs = await getCarrierReferences(dbUser.id);
            }
            const mapped = dbUserToCurrentUser(dbUser, carrierRefs);
            setCurrentUser(mapped);
            registerUser(mapped);
          } else {
            // Check if this is a deleted account re-appearing via stale auth token
            // vs a genuinely new OAuth/phone sign-up
            // Only show signup prompt if there's no existing session being cleared
            const existingSession = loadSession();
            if (existingSession) {
              // User was deleted — clear everything and sign out
              clearSession();
              setCurrentUser(null);
              signOutAuth().catch(() => {});
            } else {
              // Genuinely new user — need to collect user type
              setPendingAuthResult({
                authId: authUser.id,
                email: authUser.email,
                phone: authUser.phone,
                name: authUser.user_metadata?.full_name,
                image: authUser.user_metadata?.avatar_url,
              });
            }
          }
        } catch (err) {
          console.warn('Auth state change handler error:', err);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Persist currentUser to localStorage
  useEffect(() => {
    if (currentUser) {
      saveSession(currentUser);
    } else {
      clearSession();
    }
  }, [currentUser]);

  // Cache registeredUsers to localStorage
  useEffect(() => {
    cacheRegisteredUsers(registeredUsers);
  }, [registeredUsers]);

  // ── Online Presence ──────────────────────────────────────
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  // Heartbeat: update last_seen_at every 2 minutes while logged in
  useEffect(() => {
    if (!currentUser?.id) return;
    const isReal = !currentUser.id.startsWith('user-') && !currentUser.id.startsWith('seed-');
    if (!isReal) return;

    // Send heartbeat immediately on mount, then every 2 minutes
    updatePresence(currentUser.id);
    const heartbeat = setInterval(() => updatePresence(currentUser.id), 2 * 60 * 1000);
    return () => clearInterval(heartbeat);
  }, [currentUser?.id]);

  // Fetch online user IDs every 60 seconds
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const ids = await getOnlineUserIds(5);
      if (active) setOnlineUserIds(ids);
    };
    refresh();
    const interval = setInterval(refresh, 60 * 1000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  // Helper: check if a user ID is a real Supabase UUID (not local-only)
  const isSupabaseId = (id: string) => !id.startsWith('user-') && !id.startsWith('seed-');

  // Sync profile updates to Supabase (fire-and-forget)
  const syncProfileToSupabase = useCallback(async (userId: string, updates: Partial<CurrentUser>) => {
    if (!isSupabaseId(userId)) return;
    try {
      const { userFields, dispatcherFields, advertiserFields } = currentUserToDbFields(updates);
      if (Object.keys(userFields).length > 0) {
        await updateUser(userId, userFields);
      }
      if (Object.keys(dispatcherFields).length > 0) {
        await updateDispatcherProfile(userId, dispatcherFields);
      }
      if (updates.carriersWorkedWith !== undefined) {
        await syncCarrierReferences(userId, updates.carriersWorkedWith);
      }
      if (Object.keys(advertiserFields).length > 0) {
        await updateAdvertiserProfile(userId, advertiserFields);
      }
    } catch (err) {
      console.warn('Supabase sync failed (will retry on next save):', err);
    }
  }, []);

  // On mount: refresh session from Supabase if user has a real UUID
  const sessionRefreshed = useRef(false);
  useEffect(() => {
    if (sessionRefreshed.current) return;
    const session = loadSession();
    if (!session || !isSupabaseId(session.id)) return;
    sessionRefreshed.current = true;

    (async () => {
      try {
        const dbUser = await getUserById(session.id);
        if (!dbUser) {
          // User was deleted — clear local state
          clearSession();
          setCurrentUser(null);
          setRegisteredUsers(prev => prev.filter(u => u.id !== session.id));
          return;
        }
        let carrierRefs;
        if (dbUser.user_type === 'dispatcher') {
          carrierRefs = await getCarrierReferences(dbUser.id);
        }
        const refreshed = dbUserToCurrentUser(dbUser, carrierRefs);
        setCurrentUser(refreshed);
        setRegisteredUsers(prev =>
          prev.map(u => (u.id === refreshed.id ? refreshed : u))
        );
      } catch {
        // Supabase unreachable — keep localStorage version silently
      }
    })();
  }, []);

  // Poll for pending connections + unread messages
  useEffect(() => {
    if (!currentUser?.id || !isSupabaseId(currentUser.id)) return;

    const fetchCounts = async () => {
      try {
        // Get last-seen feed timestamp from localStorage
        const lastSeen = localStorage.getItem('dispatchlink_feed_last_seen') || new Date(0).toISOString();

        const [pendingReqs, unreadCount, feedPosts] = await Promise.all([
          getPendingConnectionRequests(currentUser.id),
          getUnreadMessagesCount(currentUser.id),
          getConnectionFeedNotifications(currentUser.id, lastSeen).catch(() => []),
        ]);
        setPendingConnections(pendingReqs?.length || 0);
        setUnreadMessages(unreadCount);
        setFeedNotifications(feedPosts.length);
      } catch {
        // Silently fail — counts stay at previous values
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const updateProfile = (updates: Partial<CurrentUser>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      // Sync changes to the registry copy
      setRegisteredUsers(users =>
        users.map(u => (u.id === updated.id ? updated : u))
      );
      // Fire-and-forget sync to Supabase
      syncProfileToSupabase(updated.id, updates);
      return updated;
    });
  };

  const registerUser = (user: CurrentUser) => {
    setRegisteredUsers(prev => {
      // Deduplicate by id
      if (prev.some(u => u.id === user.id)) {
        return prev.map(u => (u.id === user.id ? user : u));
      }
      return [...prev, user];
    });
  };

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    setPendingAuthResult(null);
    // Also sign out of Supabase Auth (fire-and-forget)
    signOutAuth().catch(() => {});
  }, []);

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        currentUser,
        setCurrentUser,
        updateProfile,
        logout,
        unreadMessages,
        setUnreadMessages,
        pendingConnections,
        setPendingConnections,
        feedNotifications,
        setFeedNotifications,
        registeredUsers,
        registerUser,
        pendingAuthResult,
        setPendingAuthResult,
        clearPendingAuthResult,
        onlineUserIds,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
