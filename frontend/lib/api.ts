import { apiFetch } from "@/lib/apiClient";

/* =========================
   Types
========================= */
export interface CoachResponse {
  output: string;
  context_used?: any;
}

export interface School {
  id: string;
  name: string;
  location: string | null;
}

/* =========================
   Schools (public)
========================= */

export function fetchSchools(): Promise<School[]> {
  return apiFetch<School[]>("/schools", { auth: false });
}

/* =========================
   Auth – Signup
========================= */

export function signupRequestOtp(payload: {
  name: string;
  phone: string;
  email: string;
  school_id: string;
}) {
  return apiFetch("/auth/signup/request-otp", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export function signupVerifyOtp(payload: {
  phone: string;
  otp: string;
}) {
  return apiFetch("/auth/signup/verify-otp", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

/* =========================
   Auth – Login
========================= */

export function requestOtp(payload: {
  channel: "phone" | "email";
  destination: string;
}) {
  return apiFetch("/auth/request-otp", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export function verifyOtp(payload: {
  channel: "phone" | "email";
  destination: string;
  otp: string;
}) {
  return apiFetch("/auth/verify-otp", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

/* =========================
   Coach (protected)
========================= */

export function coachRequest(payload: {
  prompt: string;
  grade?: number;
  subject?: string;
  language?: string;
  time_left_minutes?: number;
}) {
  return apiFetch<CoachResponse>("/api/coach", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
