"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { db } from "@/lib/db";

/* =========================
   Types
========================= */

export type Language = "hi" | "en";

export type Screen =
  | "splash"
  | "onboarding"
  | "home"
  | "history"
  | "settings"
  | "saved";

export interface UserProfile {
  name?: string;
  phone?: string;
  grade?: string;
  subject?: string;
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

  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;

  isOnline: boolean;
}

/* =========================
   Context
========================= */

const AppContext = createContext<AppContextType | undefined>(undefined);

/* =========================
   Provider
========================= */

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("hi");
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] =
    useState(false);
  const [userProfile, setUserProfileState] = useState<UserProfile>({});
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  /* =========================
     Hydrate from IndexedDB
  ========================= */

  useEffect(() => {
    const hydrate = async () => {
      const lang = await db.settings.get("language");
      const onboarding = await db.settings.get("onboarding");
      const profile = await db.profile.toArray();

      if (lang?.value) setLanguageState(lang.value);
      if (typeof onboarding?.value === "boolean") {
        setHasCompletedOnboardingState(onboarding.value);
      }

      if (profile.length > 0) {
        setUserProfileState(profile[0]);
      }
    };

    hydrate();
  }, []);

  /* =========================
     Persistors
  ========================= */

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await db.settings.put({ key: "language", value: lang });
  };

  const setHasCompletedOnboarding = async (completed: boolean) => {
    setHasCompletedOnboardingState(completed);
    await db.settings.put({ key: "onboarding", value: completed });
  };

  const setUserProfile = async (profile: UserProfile) => {
    setUserProfileState(profile);

    // Single-profile assumption (teacher app)
    await db.profile.clear();
    await db.profile.put({
      teacherId: "local", // replaced later by real teacherId during sync
      ...profile,
    });
  };

  /* =========================
     Online / Offline detection
  ========================= */

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
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
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        isOnline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

/* =========================
   Hook
========================= */

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
