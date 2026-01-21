"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { db } from "@/lib/db";
import { useAuth } from "@/app/context/AuthContext";
import { coachRequest } from "@/lib/api";
import { useApp } from "@/app/context/AppContext";

/* =========================
   Types
========================= */

export interface Message {
  id: string;
  teacherId: string;
  type: "user" | "ai";
  content: string;
  timestamp: number;
  status: "pending" | "sent" | "failed";
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  isAIThinking: boolean;
}

/* =========================
   Context
========================= */

const ChatContext = createContext<ChatContextType | undefined>(undefined);

/* =========================
   Provider
========================= */

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { teacher } = useAuth();
  const { userProfile, language } = useApp();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);

  /* =========================
     Helpers
  ========================= */

  const buildCoachPayload = (prompt: string) => ({
    prompt,
    grade: userProfile.grade ? Number(userProfile.grade) : undefined,
    subject: userProfile.subject || undefined,
    language,
    time_left_minutes: 10,
  });

  /* =========================
     Load messages from IndexedDB
  ========================= */

  useEffect(() => {
    if (!teacher?.id) return;

    const loadMessages = async () => {
      const localMessages = await db.messages
        .where("teacherId")
        .equals(teacher.id)
        .sortBy("timestamp");

      setMessages(localMessages);
    };

    loadMessages();
  }, [teacher?.id]);

  /* =========================
     Online sync trigger
  ========================= */

  useEffect(() => {
    if (!teacher?.id) return;

    const sync = async () => {
      if (!navigator.onLine) return;

      const pending = await db.pending_actions
        .where("type")
        .equals("SEND_MESSAGE")
        .toArray();

      for (const action of pending) {
        try {
          const data = await coachRequest(
            buildCoachPayload(action.payload.content)
          );

          await db.messages.update(action.payload.id, { status: "sent" });

          const aiMessage: Message = {
            id: crypto.randomUUID(),
            teacherId: teacher.id,
            type: "ai",
            content: data.output || "No response",
            timestamp: Date.now(),
            status: "sent",
          };

          await db.messages.put(aiMessage);
          await db.pending_actions.delete(action.id);
        } catch {
          await db.pending_actions.update(action.id, {
            retries: action.retries + 1,
          });
        }
      }

      const updated = await db.messages
        .where("teacherId")
        .equals(teacher.id)
        .sortBy("timestamp");

      setMessages(updated);
    };

    // 🔑 CRITICAL: run once + on reconnect
    sync();
    window.addEventListener("online", sync);

    return () => window.removeEventListener("online", sync);
  }, [teacher?.id, userProfile, language]);

  /* =========================
     Public API
  ========================= */

  const sendMessage = async (content: string) => {
    if (!teacher?.id) return;

    const messageId = crypto.randomUUID();

    const userMessage: Message = {
      id: messageId,
      teacherId: teacher.id,
      type: "user",
      content,
      timestamp: Date.now(),
      status: "pending",
    };

    // 1️⃣ Save locally
    await db.messages.put(userMessage);

    // 2️⃣ Optimistic UI
    setMessages((prev) => [...prev, userMessage]);

    // 3️⃣ Online → send now
    if (navigator.onLine) {
      try {
        setIsAIThinking(true);

        const data = await coachRequest(buildCoachPayload(content));

        await db.messages.update(messageId, { status: "sent" });

        const aiMessage: Message = {
          id: crypto.randomUUID(),
          teacherId: teacher.id,
          type: "ai",
          content: data.output || "No response",
          timestamp: Date.now(),
          status: "sent",
        };

        await db.messages.put(aiMessage);
        setMessages((prev) => [...prev, aiMessage]);
      } catch {
        await db.messages.update(messageId, { status: "failed" });
      } finally {
        setIsAIThinking(false);
      }
    } else {
      // 4️⃣ Offline → queue action
      await db.pending_actions.put({
        id: crypto.randomUUID(),
        type: "SEND_MESSAGE",
        payload: { id: messageId, content },
        retries: 0,
        createdAt: Date.now(),
      });

      // 🔁 Background sync (best-effort)
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        try {
          const reg = await navigator.serviceWorker.ready;
          const syncManager = (reg as any).sync as SyncManager | undefined;
          if (syncManager) {
            await syncManager.register("sync-pending-messages");
          }
        } catch {
          // Safe to ignore
        }
      }
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        isAIThinking,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

/* =========================
   Hook
========================= */

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return ctx;
};
