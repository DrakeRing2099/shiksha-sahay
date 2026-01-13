"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'hi' | 'en';

export type Screen = 'splash' | 'onboarding' | 'home' | 'history' | 'settings' | 'saved';

interface UserProfile {
  name: string;
  phone: string;
  grade: string;
  subject: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  isOnline: boolean;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('hi');
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'राज कुमार',
    phone: '+91 98765 43210',
    grade: 'Class 4',
    subject: 'गणित',
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Listen for online/offline events
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currentScreen,
        setCurrentScreen,
        isDrawerOpen,
        setIsDrawerOpen,
        userProfile,
        setUserProfile,
        isOnline,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};