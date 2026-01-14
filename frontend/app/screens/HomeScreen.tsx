"use client";
import { useEffect, useRef } from 'react';
import { Header } from '@/app/components/Header';
import { ChatProvider, useChat } from '@/app/context/ChatContext';
import { ContextCard } from '@/app/components/chat/ContextCard';
import { MessageBubble } from '@/app/components/chat/MessageBubble';
import { ThinkingIndicator } from '@/app/components/chat/ThinkingIndicator';
import { QuickActions } from '@/app/components/chat/QuickActions';
import { InputBar } from '@/app/components/chat/InputBar';

const HomeScreenContent = () => {
  const { messages, isAIThinking, addMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAIThinking]);

  const handleQuickAction = (text: string) => {
    addMessage({
      type: 'user',
      content: text,
      status: 'sent',
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <Header />
      
      {/* Context card */}
      <div className="mt-16">
        <ContextCard />
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto mb-20 pb-4">
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

      {/* Input bar */}
      <InputBar />
    </div>
  );
};

export const HomeScreen = () => {
  return (
    <ChatProvider>
      <HomeScreenContent />
    </ChatProvider>
  );
};
