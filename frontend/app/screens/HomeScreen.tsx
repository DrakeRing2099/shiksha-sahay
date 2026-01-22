"use client";

import { useEffect, useRef } from "react";
import { Header } from "@/app/components/Header";
import { useChat } from "@/app/context/ChatContext";
import { ContextCard } from "@/app/components/chat/ContextCard";
import { MessageBubble } from "@/app/components/chat/MessageBubble";
import { ThinkingIndicator } from "@/app/components/chat/ThinkingIndicator";
import { QuickActions } from "@/app/components/chat/QuickActions";
import { InputBar } from "@/app/components/chat/InputBar";
import { FeedbackBar } from "@/app/components/chat/FeedbackBar"; 

const HomeScreenContent = () => {
  const {
    messages,
    isAIThinking,
    sendMessage,
    showFeedback,         
    conversationId,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* =========================
     Auto-scroll
  ========================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAIThinking]);

  /* =========================
     Handlers
  ========================= */

  const handleQuickAction = async (text: string) => {
    await sendMessage(text);
  };

  return (
    <div className="flex flex-col h-full bg-white pb-32">
      <Header />

      {/* Context card */}
      <div className="mt-16">
        <ContextCard />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto mb-20 pb-4 px-3">
        {messages.length === 0 ? (
          <QuickActions onActionClick={handleQuickAction} />
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isAIThinking && <ThinkingIndicator />}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 🔜 Feedback UI goes HERE (after messages) */}
      {showFeedback && conversationId && (
        <FeedbackBar conversationId={conversationId} />
      )}

      {/* Input bar */}
      <InputBar />
    </div>
  );
};

export const HomeScreen = () => {
  return <HomeScreenContent />;
};
