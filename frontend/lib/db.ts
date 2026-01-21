// frontend/lib/db.ts
import Dexie, { Table } from "dexie";

/* =========================
   Types
========================= */

export interface AuthSession {
  id: "session";
  accessToken: string | null;
  refreshToken: string | null;
  teacherId: string | null;
  expiresAt: number | null;
}

export interface TeacherProfile {
  teacherId: string;
  name?: string;
  phone?: string;
  email?: string;
  onboardingStatus?: number;
  lastSyncedAt?: number;
}

/* 🆕 Conversation */
export interface Conversation {
  id: string;
  teacherId: string;
  title: string;
  lastMessagePreview?: string;
  updatedAt: number;
  deletedAt?: number;
}

/* 🆕 Message now belongs to a conversation */
export interface ChatMessage {
  id: string;
  teacherId: string;
  conversationId: string;
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
  conversations!: Table<Conversation>;
  messages!: Table<ChatMessage>;
  pending_actions!: Table<PendingAction>;
  settings!: Table<AppSetting>;

  constructor() {
    super("shikshaSahayDB");

    /* -------------------------
       v1 (OLD – kept for users)
    -------------------------- */
    this.version(1).stores({
      auth: "id",
      profile: "teacherId",
      messages: "id, teacherId, timestamp",
      pending_actions: "id, type, createdAt",
      settings: "key",
    });

    /* -------------------------
       v2 (NEW – Conversations)
    -------------------------- */
    this.version(2).stores({
      auth: "id",
      profile: "teacherId",
      conversations: "id, teacherId, updatedAt",
      messages: "id, teacherId, conversationId, timestamp",
      pending_actions: "id, type, createdAt",
      settings: "key",
    }).upgrade(async (tx) => {
      /**
       * MIGRATION STRATEGY
       * - Old messages had no conversationId
       * - We create ONE default conversation per teacher
       * - Attach all old messages to it
       */

      const messagesTable = tx.table("messages");
      const conversationsTable = tx.table("conversations");

      const messages = await messagesTable.toArray();
      if (messages.length === 0) return;

      const teacherId = messages[0].teacherId;
      const conversationId = crypto.randomUUID();

      await conversationsTable.put({
        id: conversationId,
        teacherId,
        title: "Previous Conversation",
        updatedAt: Date.now(),
      });

      for (const msg of messages) {
        await messagesTable.update(msg.id, {
          conversationId,
        });
      }
    });
  }
}

export const db = new ShikshaSahayDB();
