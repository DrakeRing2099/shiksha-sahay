// frontend/lib/db.ts
import Dexie, { Table } from "dexie";

/* =========================
   Types
========================= */

export interface AuthSession {
  id: "session"; // single-row table
  accessToken: string | null;
  refreshToken: string | null;
  teacherId: string | null;
  expiresAt: number | null; // epoch ms
}

export interface TeacherProfile {
  teacherId: string;
  name?: string;
  phone?: string;
  email?: string;
  onboardingStatus?: number;
  lastSyncedAt?: number;
}

export interface ChatMessage {
  id: string;
  teacherId: string;
  type: "user" | "ai";
  content: string;
  timestamp: number;
  status: "pending" | "sent" | "failed";
}

export interface PendingAction {
  id: string;
  type: "SEND_MESSAGE" | "UPDATE_PROFILE";
  payload: any;
  retries: number;
  createdAt: number;
}

export interface AppSetting {
  key: string;
  value: any;
}

/* =========================
   Dexie Database
========================= */

class ShikshaSahayDB extends Dexie {
  auth!: Table<AuthSession>;
  profile!: Table<TeacherProfile>;
  messages!: Table<ChatMessage>;
  pending_actions!: Table<PendingAction>;
  settings!: Table<AppSetting>;

  constructor() {
    super("shikshaSahayDB");

    this.version(1).stores({
      auth: "id",
      profile: "teacherId",
      messages: "id, teacherId, timestamp",
      pending_actions: "id, type, createdAt",
      settings: "key",
    });
  }
}

export const db = new ShikshaSahayDB();
