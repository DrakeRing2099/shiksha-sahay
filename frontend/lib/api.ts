// frontend/lib/api.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/* =========================
   Types
========================= */

export interface School {
  id: string;
  name: string;
  location: string | null;
}

/* =========================
   Schools
========================= */

export async function fetchSchools(): Promise<School[]> {
  const res = await fetch(`${API_BASE_URL}/schools`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch schools");
  }

  return res.json();
}

/* =========================
   Auth – Signup
========================= */

export async function signupRequestOtp(payload: {
  name: string;
  phone: string;
  email: string;
  school_id: string; // UUID
}) {
  const res = await fetch(`${API_BASE_URL}/auth/signup/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to request OTP");
  }

  /**
   * In dev you may receive:
   * { ok: true, dev_otp, teacher_id }
   */
  return res.json();
}

export async function signupVerifyOtp(payload: {
  phone: string;
  otp: string;
}) {
  const res = await fetch(`${API_BASE_URL}/auth/signup/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "OTP verification failed");
  }

  /**
   * { access_token, refresh_token }
   */
  return res.json();
}

/* =========================
   Auth – Login (optional reuse)
========================= */

export async function requestOtp(payload: {
  channel: "phone" | "email";
  destination: string;
}) {
  const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to request OTP");
  }

  return res.json();
}

export async function verifyOtp(payload: {
  channel: "phone" | "email";
  destination: string;
  otp: string;
}) {
  const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Invalid OTP");
  }

  return res.json(); // { access_token, refresh_token }
}
