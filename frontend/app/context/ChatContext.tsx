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
import { coachRequest, createConversation } from "@/lib/api";
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

  showFeedback: boolean;
  setShowFeedback: (v: boolean) => void;

  feedbackSubmitted: boolean;
  setFeedbackSubmitted: (v: boolean) => void;

  startNewChat: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

/* =========================
   Provider
========================= */

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { teacher } = useAuth();
  const { userProfile, language } = useApp();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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

  const enforceLast10Conversations = async (teacherId: string) => {
    const all = await db.conversations
      .where("teacherId")
      .equals(teacherId)
      .sortBy("updatedAt");

    if (all.length <= 10) return;

    const excess = all.slice(0, all.length - 10);
    await db.conversations.bulkDelete(excess.map(c => c.id));
  };

  /* =========================
     Conversation helpers
  ========================= */

  const startNewChat = async () => {
    setConversationId(null);
    setMessages([]);
    setShowFeedback(false);
    setFeedbackSubmitted(false);
  };

  const loadConversation = async (id: string) => {
    if (!teacher?.id) return;

    const msgs = await db.messages
      .where("conversationId")
      .equals(id)
      .sortBy("timestamp");

    setConversationId(id);
    setMessages(msgs);
    setShowFeedback(false);
    setFeedbackSubmitted(false);
  };


  /* =========================
     Send message
  ========================= */

  const sendMessage = async (content: string) => {
    if (!teacher?.id) return;

    let activeConversationId = conversationId;

    // ✅ BACKEND creates conversation
    if (!activeConversationId) {
      const convo = await createConversation({
        title: content.slice(0, 60),
      });

      activeConversationId = convo.id;

      await db.conversations.put({
        id: convo.id,
        teacherId: teacher.id,
        title: content.slice(0, 60),
        updatedAt: Date.now(),
      });

      await enforceLast10Conversations(teacher.id);
      setConversationId(convo.id);
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

    await db.messages.put(userMessage);
    setMessages(prev => [...prev, userMessage]);

    if (!navigator.onLine) {
      await db.pending_actions.put({
        id: crypto.randomUUID(),
        type: "SEND_MESSAGE",
        payload: { messageId, content, conversationId: activeConversationId },
        retries: 0,
        createdAt: Date.now(),
      });
      return;
    }

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
      setMessages(prev => [...prev, aiMessage]);

      await db.conversations.update(activeConversationId, {
        lastMessagePreview: data.output?.slice(0, 80),
        updatedAt: Date.now(),
      });

      await enforceLast10Conversations(teacher.id);

      // ✅ show feedback after FIRST AI response
      setShowFeedback(true);

    } catch {
      await db.messages.update(messageId, { status: "failed" });
    } finally {
      setIsAIThinking(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversationId,
        messages,
        isAIThinking,

        showFeedback,
        setShowFeedback,

        feedbackSubmitted,
        setFeedbackSubmitted,

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
