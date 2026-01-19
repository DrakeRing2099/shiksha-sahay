"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  isVoice?: boolean;
  voiceDuration?: number;
  status?: "sending" | "sent" | "delivered";
}

interface ChatContextType {
  messages: Message[];
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  recordingDuration: number;
  setRecordingDuration: (duration: number) => void;
  isAIThinking: boolean;
  setIsAIThinking: (thinking: boolean) => void;
  contextVisible: boolean;
  setContextVisible: (visible: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [contextVisible, setContextVisible] = useState(true);

  const addMessage = async (
    message: Omit<Message, "id" | "timestamp">
  ) => {
    // 1️⃣ Add user message immediately
    const userMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // 2️⃣ If user message → call backend
    if (message.type === "user") {
      setIsAIThinking(true);

      try {
        const res = await fetch(`${API_BASE_URL}/api/coach`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teacher_id: "a1b2c3d4-1234-4abc-9def-987654321000", // ✅ existing UUID
            prompt: message.content,
            grade: 5,
            subject: "Mathematics",
            language: "English",
            time_left_minutes: 10,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to get AI response");
        }

        const data = await res.json();

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: data.output || "No response from AI",
          timestamp: new Date(),
          status: "delivered",
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("AI error:", error);

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            type: "ai",
            content:
              "⚠️ Sorry, I couldn't process your request. Please try again.",
            timestamp: new Date(),
            status: "delivered",
          },
        ]);
      } finally {
        setIsAIThinking(false);
      }
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        isRecording,
        setIsRecording,
        recordingDuration,
        setRecordingDuration,
        isAIThinking,
        setIsAIThinking,
        contextVisible,
        setContextVisible,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
