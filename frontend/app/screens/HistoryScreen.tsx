"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Search, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { useChat } from "@/app/context/ChatContext";
import { db, Conversation } from "@/lib/db";
import { DeleteConversationButton } from "@/app/components/ui/DeleteConversationButton";

/* =========================
   Helpers
========================= */

const isToday = (ts: number) => {
  const d = new Date(ts);
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

const isYesterday = (ts: number) => {
  const d = new Date(ts);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toDateString() === y.toDateString();
};

export const HistoryScreen = () => {
  const router = useRouter();
  const { language } = useApp();
  const { loadConversation } = useChat();

  const [conversations, setConversations] = useState<Conversation[]>([]);

  /* =========================
     Load conversations
  ========================= */

  useEffect(() => {
    const load = async () => {
      const all = await db.conversations
        .orderBy("updatedAt")
        .reverse()
        .toArray();

      setConversations(all);
    };

    load();
  }, []);

  /* =========================
     Handlers
  ========================= */

  const openConversation = async (id: string) => {
    await loadConversation(id);
    router.push("/home");
  };

  const visible = conversations.filter((c) => !c.deletedAt);
  const today = visible.filter((c) => isToday(c.updatedAt));
  const yesterday = visible.filter((c) => isYesterday(c.updatedAt));
  const older = visible.filter(
    (c) => !isToday(c.updatedAt) && !isYesterday(c.updatedAt)
  );

  const deleteConversation = async (id: string) => {
    await db.conversations.update(id, {
      deletedAt: Date.now(),
    });

    // Optional: also delete messages (commented for safety)
    //await db.messages.where("conversationId").equals(id).delete();

    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, deletedAt: Date.now() } : c
      )
    );
  };
  
  return (
    <div className="flex flex-col h-full bg-[#F9FAFB]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 z-50">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-[#111827]" />
        </button>

        <h1 className="font-bold text-[#111827]">
          {language === "hi" ? "मेरी बातचीत" : "My Conversations"}
        </h1>

        <button className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors">
          <Search className="w-6 h-6 text-[#111827]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 mt-16 overflow-y-auto px-4 py-4">
        {/* Today */}
        {today.length > 0 && (
          <>
            <h2 className="text-sm font-bold text-[#6B7280] uppercase mb-3 px-2">
              {language === "hi" ? "आज | Today" : "Today"}
            </h2>

            <div className="space-y-3 mb-6">
              {today.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conv={conv}
                  onClick={openConversation}
                  onDelete={deleteConversation}
                  language={language}
                />
              ))}
            </div>
          </>
        )}

        {/* Yesterday */}
        {yesterday.length > 0 && (
          <>
            <h2 className="text-sm font-bold text-[#6B7280] uppercase mb-3 px-2">
              {language === "hi" ? "कल | Yesterday" : "Yesterday"}
            </h2>

            <div className="space-y-3 mb-6">
              {yesterday.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conv={conv}
                  onClick={openConversation}
                  onDelete={deleteConversation}
                  language={language}
                />
              ))}
            </div>
          </>
        )}

        {/* Older */}
        {older.length > 0 && (
          <>
            <h2 className="text-sm font-bold text-[#6B7280] uppercase mb-3 px-2">
              {language === "hi" ? "पुरानी बातचीत" : "Older"}
            </h2>

            <div className="space-y-3">
              {older.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conv={conv}
                  onClick={openConversation}
                  onDelete={deleteConversation}
                  language={language}
                />
              ))}
            </div>
          </>
        )}

        {conversations.length === 0 && (
          <div className="text-center text-[#6B7280] mt-20">
            {language === "hi"
              ? "कोई बातचीत नहीं मिली"
              : "No conversations yet"}
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================
   Conversation Card
========================= */

const ConversationCard = ({
  conv,
  onClick,
  onDelete,
  language,
}: {
  conv: Conversation;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  language: string;
}) => {
  const time = new Date(conv.updatedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        
        {/* Clickable content area ONLY */}
        <div
          onClick={() => onClick(conv.id)}
          className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 text-[#6B7280] mt-0.5 flex-shrink-0" />

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#111827] mb-1 line-clamp-2">
              {conv.title || (language === "hi" ? "नई बातचीत" : "New Chat")}
            </h3>

            {conv.lastMessagePreview && (
              <p className="text-sm text-[#6B7280] mb-2 line-clamp-1">
                {conv.lastMessagePreview}
              </p>
            )}

            <div className="text-xs text-[#9CA3AF]">{time}</div>
          </div>
        </div>

        {/* Delete button – isolated click zone */}
        <div className="flex-shrink-0">
          <DeleteConversationButton
            onDelete={() => onDelete(conv.id)}
          />
        </div>
      </div>
    </div>
  );
};
