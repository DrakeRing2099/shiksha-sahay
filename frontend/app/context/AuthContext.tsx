"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";

/* =========================
   Types
========================= */

export interface Teacher {
  id: string;
  onboarding_status?: number;
}

interface AuthContextType {
  isReady: boolean;
  isAuthenticated: boolean;
  teacher: Teacher | null;
  accessToken: string | null;

  requestOtp: (params: {
    channel: "phone" | "email";
    destination: string;
  }) => Promise<any>;

  verifyOtp: (params: {
    channel: "phone" | "email";
    destination: string;
    otp: string;
  }) => Promise<void>;

  signupRequestOtp: (params: {
    name: string;
    phone: string;
    email: string;
    school_id: string;
  }) => Promise<any>;

  signupVerifyOtp: (params: {
    phone: string;
    otp: string;
  }) => Promise<void>;

  logout: () => Promise<void>;
}

/* =========================
   Context
========================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/* =========================
   Helpers
========================= */

const decodeJwtSub = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
};

/* =========================
   Provider
========================= */

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  /* =========================
     Bootstrap from IndexedDB
  ========================= */

  useEffect(() => {
    const bootstrap = async () => {
      const session = await db.auth.get("session");

      if (!session || !session.refreshToken) {
        setIsReady(true);
        return;
      }

      // Offline? trust existing access token
      if (!navigator.onLine && session.accessToken) {
        setAccessToken(session.accessToken);
        setIsAuthenticated(true);
        if (session.teacherId) {
          setTeacher({ id: session.teacherId });
        }
        setIsReady(true);
        return;
      }

      // Online → refresh access token
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: session.refreshToken }),
        });

        if (!res.ok) throw new Error("Refresh failed");

        const data = await res.json();
        const teacherId = decodeJwtSub(data.access_token);

        await db.auth.put({
          id: "session",
          accessToken: data.access_token,
          refreshToken: session.refreshToken,
          teacherId,
          expiresAt: Date.now() + 10 * 60 * 1000,
        });

        setAccessToken(data.access_token);
        setIsAuthenticated(true);
        if (teacherId) setTeacher({ id: teacherId });
      } catch {
        await db.auth.clear();
      } finally {
        setIsReady(true);
      }
    };

    bootstrap();
  }, []);

  /* =========================
     OTP – LOGIN
  ========================= */

  const requestOtp = async (params: {
    channel: "phone" | "email";
    destination: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error("OTP request failed");
    return res.json();
  };

  const verifyOtp = async (params: {
    channel: "phone" | "email";
    destination: string;
    otp: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error("OTP verification failed");

    const data = await res.json();
    const teacherId = decodeJwtSub(data.access_token);

    await db.auth.put({
      id: "session",
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      teacherId,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    setAccessToken(data.access_token);
    setIsAuthenticated(true);
    if (teacherId) setTeacher({ id: teacherId });
  };

  /* =========================
     OTP – SIGNUP
  ========================= */

  const signupRequestOtp = async (params: {
    name: string;
    phone: string;
    email: string;
    school_id: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error("Signup OTP request failed");
    return res.json();
  };

  const signupVerifyOtp = async (params: {
    phone: string;
    otp: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error("Signup OTP verification failed");

    const data = await res.json();
    const teacherId = decodeJwtSub(data.access_token);

    await db.auth.put({
      id: "session",
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      teacherId,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    setAccessToken(data.access_token);
    setIsAuthenticated(true);
    if (teacherId) setTeacher({ id: teacherId, onboarding_status: 1 });
  };

  /* =========================
     Logout
  ========================= */

  const logout = async () => {
    const session = await db.auth.get("session");

    if (session?.refreshToken && navigator.onLine) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: session.refreshToken }),
      });
    }

    await db.auth.clear();

    setAccessToken(null);
    setTeacher(null);
    setIsAuthenticated(false);

    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isReady,
        isAuthenticated,
        teacher,
        accessToken,
        requestOtp,
        verifyOtp,
        signupRequestOtp,
        signupVerifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =========================
   Hook
========================= */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
