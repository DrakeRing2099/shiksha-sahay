"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { submitConversationFeedback } from "@/lib/api";
import { useChat } from "@/app/context/ChatContext";
import { db } from "@/lib/db";


interface Props {
  conversationId: string;
}

export const FeedbackBar = ({ conversationId }: Props) => {
  const {
    setShowFeedback,
    setFeedbackSubmitted,
  } = useChat();

  const handleFeedback = async (worked: boolean) => {
    console.log("FEEDBACK CLICKED:", worked);
    try {
        await submitConversationFeedback(conversationId, worked);
    } catch (e) {
        console.error("Failed to submit feedback", e);
    } finally {
        // ✅ persist locally
        await db.conversations.update(conversationId, {
        feedbackSubmitted: true,
        });

        setFeedbackSubmitted(true);
        setShowFeedback(false);
    }
    };

  return (
    <div className="mx-4 mb-2 p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-[#111827]">
        Did this solution work?
      </span>

      <div className="flex gap-3">
        <button
          onClick={() => handleFeedback(true)}
          className="
            flex items-center gap-1 px-3 py-2 rounded-lg
            bg-green-50 text-green-700
            hover:bg-green-100
            transition
          "
        >
          <ThumbsUp className="w-4 h-4" />
          Yes
        </button>

        <button
          onClick={() => handleFeedback(false)}
          className="
            flex items-center gap-1 px-3 py-2 rounded-lg
            bg-red-50 text-red-700
            hover:bg-red-100
            transition
          "
        >
          <ThumbsDown className="w-4 h-4" />
          No
        </button>
      </div>
    </div>
  );
};
