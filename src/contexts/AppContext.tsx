import React, { createContext, useContext, useState } from 'react';
import { allSeedUsers } from '@/lib/seedData';

export interface CarrierReference {
  carrierName: string;
  mcNumber: string;
  verified: boolean;
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
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingConnections, setPendingConnections] = useState(0);
  const [registeredUsers, setRegisteredUsers] = useState<CurrentUser[]>(
    allSeedUsers as CurrentUser[]
  );

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

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        currentUser,
        setCurrentUser,
        updateProfile,
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
