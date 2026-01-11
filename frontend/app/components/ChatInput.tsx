"use client";

import { useState } from "react";

export default function ChatInput({ onSend }: any) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="p-4 border-t border-(--border) bg-white">
      <div className="flex items-center gap-2 max-w-3xl mx-auto">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message Siksha Sahay..."
          className="flex-1 resize-none rounded-lg px-4 py-3 bg-[#f9fafb] text-gray-900 outline-none border border-[var(--border)]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}
