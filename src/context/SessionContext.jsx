import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockEmployee } from '../mock/employeeData';

const SESSION_STORAGE_KEY = 'skillstat_display_name';

const SessionContext = createContext({
  displayName: '',
  setDisplayName: () => {},
  signOut: () => {},
});

export function SessionProvider({ children }) {
  const [displayName, setDisplayNameState] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      return stored && stored.trim() ? stored.trim() : '';
    } catch {
      return '';
    }
  });

  const setDisplayName = (newName) => {
    const trimmed = typeof newName === 'string' ? newName.trim() : '';
    const finalName = trimmed || mockEmployee.name;
    setDisplayNameState(finalName);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, finalName);
    } catch {
      // Ignore localStorage errors in sandboxed environments
    }
  };

  const signOut = () => {
    setDisplayNameState('');
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore localStorage errors
    }
  };

  return (
    <SessionContext.Provider value={{ displayName, setDisplayName, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    return {
      displayName: '',
      setDisplayName: () => {},
      signOut: () => {},
    };
  }
  return context;
}
