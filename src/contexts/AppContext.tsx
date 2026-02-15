import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { allSeedUsers } from '@/lib/seedData';
import { saveSession, loadSession, clearSession, cacheRegisteredUsers, loadCachedUsers } from '@/lib/session';
import { getUserById, getCarrierReferences, updateUser, updateDispatcherProfile, syncCarrierReferences } from '@/lib/api';
import { dbUserToCurrentUser, currentUserToDbFields } from '@/lib/mappers';

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
  userType: 'dispatcher' | 'carrier' | 'broker';
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
  registeredUsers: CurrentUser[];
  registerUser: (user: CurrentUser) => void;
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
  registeredUsers: [],
  registerUser: () => {},
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => loadSession());
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingConnections, setPendingConnections] = useState(0);
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

  // Helper: check if a user ID is a real Supabase UUID (not local-only)
  const isSupabaseId = (id: string) => !id.startsWith('user-') && !id.startsWith('seed-');

  // Sync profile updates to Supabase (fire-and-forget)
  const syncProfileToSupabase = useCallback(async (userId: string, updates: Partial<CurrentUser>) => {
    if (!isSupabaseId(userId)) return;
    try {
      const { userFields, dispatcherFields } = currentUserToDbFields(updates);
      if (Object.keys(userFields).length > 0) {
        await updateUser(userId, userFields);
      }
      if (Object.keys(dispatcherFields).length > 0) {
        await updateDispatcherProfile(userId, dispatcherFields);
      }
      if (updates.carriersWorkedWith !== undefined) {
        await syncCarrierReferences(userId, updates.carriersWorkedWith);
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
        if (!dbUser) return; // User deleted? Keep localStorage version
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
        registeredUsers,
        registerUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
