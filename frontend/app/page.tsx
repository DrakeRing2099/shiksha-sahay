"use client";

import { useState } from "react";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello 👋 How can I help you today?",
    },
  ]);

  const sendMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      {
        role: "assistant",
        content: "This is a dummy response (backend later).",
      },
    ]);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white text-black">
      
      {/* Header */}
      <div className="p-4 text-center border-b border-gray-200 font-semibold">
        Siksha Sahay AI
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 w-full lg:max-w-3xl lg:mx-auto">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
      </div>

      {/* Input */}
      <div className="w-full border-t border-gray-200">
        <ChatInput onSend={sendMessage} />
      </div>

    </div>
  );
}
