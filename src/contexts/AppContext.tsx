import React, { createContext, useContext, useState } from 'react';

interface CurrentUser {
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
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingConnections, setPendingConnections] = useState(0);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const updateProfile = (updates: Partial<CurrentUser>) => {
    setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
