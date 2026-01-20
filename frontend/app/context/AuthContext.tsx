"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/* =========================
   Types
========================= */

export interface Teacher {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
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
  }) => Promise<{ ok: boolean; dev_otp?: string }>;


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
}) => Promise<{ ok: boolean; dev_otp?: string; teacher_id?: string }>;

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
     Bootstrap auth
  ========================= */

  useEffect(() => {
    const bootstrap = async () => {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        setIsReady(true);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!res.ok) throw new Error("Refresh failed");

        const data = await res.json();

        localStorage.setItem("access_token", data.access_token);
        setAccessToken(data.access_token);
        setIsAuthenticated(true);

        const teacherId = decodeJwtSub(data.access_token);
        if (teacherId) setTeacher({ id: teacherId });

      } catch {
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("access_token");
      } finally {
        setIsReady(true);
      }
    };

    bootstrap();
  }, []);

/* =========================
     OTP – LOGIN
========================= */

  const requestOtp = async ({
    channel,
    destination,
  }: {
    channel: "phone" | "email";
    destination: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, destination }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Teacher not found");
    }

    return res.json(); // 🔑 THIS IS THE KEY
  };



  const verifyOtp = async ({
    channel,
    destination,
    otp,
  }: {
    channel: "phone" | "email";
    destination: string;
    otp: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, destination, otp }),
    });

    if (!res.ok) {
      throw new Error("Invalid OTP");
    }

    const data = await res.json();

    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("access_token", data.access_token);

    setAccessToken(data.access_token);
    setIsAuthenticated(true);

    const teacherId = decodeJwtSub(data.access_token);
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

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Signup OTP request failed");
  }

  return res.json(); // ✅ IMPORTANT
};



  const signupVerifyOtp = async ({
    phone,
    otp,
  }: {
    phone: string;
    otp: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });

    if (!res.ok) {
      throw new Error("Signup OTP verification failed");
    }

    const data = await res.json();

    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("access_token", data.access_token);

    setAccessToken(data.access_token);
    setIsAuthenticated(true);

    const teacherId = decodeJwtSub(data.access_token);
    if (teacherId) {
      setTeacher({ id: teacherId, onboarding_status: 1 });
    }
  };

  /* =========================
     Logout
  ========================= */

  const logout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }

    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("hasCompletedOnboarding");
    localStorage.removeItem("userProfile");

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
