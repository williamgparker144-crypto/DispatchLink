import React, { createContext, useContext, useState } from 'react';

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  company: string;
  userType: 'dispatcher' | 'carrier' | 'broker';
  image?: string;
  verified: boolean;
}

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
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
  unreadMessages: 0,
  setUnreadMessages: () => {},
  pendingConnections: 0,
  setPendingConnections: () => {},
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>({
    id: 'demo-user-1',
    name: 'John Smith',
    email: 'john@smithdispatch.com',
    company: 'Smith Dispatch Services',
    userType: 'dispatcher',
    verified: true,
  });
  const [unreadMessages, setUnreadMessages] = useState(3);
  const [pendingConnections, setPendingConnections] = useState(2);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        currentUser,
        setCurrentUser,
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
