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
  conversationId: string;
  type: "user" | "ai";
  content: string;
  timestamp: number;
  status: "pending" | "sent" | "failed";
}

interface ChatContextType {
  conversationId: string | null;
  messages: Message[];
  isAIThinking: boolean;
  startNewChat: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
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

  const [conversationId, setConversationId] = useState<string | null>(null);
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
     Conversation helpers
  ========================= */

  const startNewChat = async () => {
    if (!teacher?.id) return;

    const newConversationId = crypto.randomUUID();

    await db.conversations.put({
      id: newConversationId,
      teacherId: teacher.id,
      title: "New Conversation",
      updatedAt: Date.now(),
    });

    setConversationId(newConversationId);
    setMessages([]);
  };

  const loadConversation = async (id: string) => {
    if (!teacher?.id) return;

    const msgs = await db.messages
      .where("conversationId")
      .equals(id)
      .sortBy("timestamp");

    setConversationId(id);
    setMessages(msgs);
  };

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
          const { content, messageId, conversationId } = action.payload;

          const data = await coachRequest(buildCoachPayload(content));

          await db.messages.update(messageId, { status: "sent" });

          const aiMessage: Message = {
            id: crypto.randomUUID(),
            teacherId: teacher.id,
            conversationId,
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

      if (conversationId) {
        const updated = await db.messages
          .where("conversationId")
          .equals(conversationId)
          .sortBy("timestamp");

        setMessages(updated);
      }
    };

    sync();
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, [teacher?.id, conversationId, userProfile, language]);

  /* =========================
     Send message
  ========================= */

  const sendMessage = async (content: string) => {
    if (!teacher?.id) return;

    let activeConversationId = conversationId;

    // 🔹 Auto-create conversation on first message
    if (!activeConversationId) {
      activeConversationId = crypto.randomUUID();

      await db.conversations.put({
        id: activeConversationId,
        teacherId: teacher.id,
        title: content.slice(0, 40),
        updatedAt: Date.now(),
      });

      setConversationId(activeConversationId);
    }

    const messageId = crypto.randomUUID();

    const userMessage: Message = {
      id: messageId,
      teacherId: teacher.id,
      conversationId: activeConversationId,
      type: "user",
      content,
      timestamp: Date.now(),
      status: "pending",
    };

    // 1️⃣ Save locally
    await db.messages.put(userMessage);
    setMessages((prev) => [...prev, userMessage]);

    // 2️⃣ Online
    if (navigator.onLine) {
      try {
        setIsAIThinking(true);

        const data = await coachRequest(buildCoachPayload(content));

        await db.messages.update(messageId, { status: "sent" });

        const aiMessage: Message = {
          id: crypto.randomUUID(),
          teacherId: teacher.id,
          conversationId: activeConversationId,
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
      // 3️⃣ Offline → queue
      await db.pending_actions.put({
        id: crypto.randomUUID(),
        type: "SEND_MESSAGE",
        payload: {
          messageId,
          content,
          conversationId: activeConversationId,
        },
        retries: 0,
        createdAt: Date.now(),
      });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversationId,
        messages,
        isAIThinking,
        startNewChat,
        loadConversation,
        sendMessage,
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
