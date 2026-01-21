// frontend/lib/apiClient.ts
import { db } from "@/lib/db";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

interface ApiFetchOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  if (!navigator.onLine) {
    throw new ApiError("Offline", 0);
  }

  // ✅ FORCE object type
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    const session = await db.auth.get("session");
    if (session?.accessToken) {
      finalHeaders["Authorization"] = `Bearer ${session.accessToken}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  if (!res.ok) {
    let msg = "Request failed";
    try {
      const body = await res.json();
      msg = body.detail || msg;
    } catch {}

    throw new ApiError(msg, res.status);
  }

  return res.json();
}
