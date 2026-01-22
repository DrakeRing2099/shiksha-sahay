"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Search, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { useChat } from "@/app/context/ChatContext";
import { DeleteConversationButton } from "@/app/components/ui/DeleteConversationButton";
import { fetchConversations, ConversationDTO, deleteConversation as deleteConversationApi } from "@/lib/api";
import { db } from "@/lib/db";

/* =========================
   Helpers
========================= */

const isToday = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

const isYesterday = (iso: string) => {
  const d = new Date(iso);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toDateString() === y.toDateString();
};

export const HistoryScreen = () => {
  const router = useRouter();
  const { language } = useApp();
  const { loadConversation } = useChat();

  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     Load conversations
  ========================= */

  useEffect(() => {
    const load = async () => {
      try {
        const local = await db.conversations
          .orderBy("updatedAt")
          .reverse()
          .toArray();

        setConversations(
          local.map(c => ({
            id: c.id,
            title: c.title,
            last_message_preview: c.lastMessagePreview || "",
            updated_at: new Date(c.updatedAt).toISOString(),
          }))
        );
      } catch (e) {
        console.error("Failed to fetch conversations", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* =========================
     Handlers
  ========================= */

  const openConversation = async (id: string) => {
    const localCount = await db.messages
      .where("conversationId")
      .equals(id)
      .count();

    if (localCount === 0) {
      alert("This conversation is not available offline yet.");
      return;
    }

    await loadConversation(id);
    router.push("/home");
  };



  const deleteConversation = async (id: string) => {
    try {
      await deleteConversationApi(id);

      await db.conversations.delete(id);
      await db.messages
        .where("conversationId")
        .equals(id)
        .delete();

      setConversations(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error("Delete failed", e);
    }
  };


  const today = conversations.filter((c) => isToday(c.updated_at));
  const yesterday = conversations.filter((c) =>
    isYesterday(c.updated_at)
  );
  const older = conversations.filter(
    (c) => !isToday(c.updated_at) && !isYesterday(c.updated_at)
  );

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
        {loading && (
          <div className="text-center text-[#6B7280] mt-20">
            {language === "hi" ? "लोड हो रहा है..." : "Loading conversations..."}
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="text-center text-[#6B7280] mt-20">
            {language === "hi"
              ? "कोई बातचीत नहीं मिली"
              : "No conversations yet"}
          </div>
        )}

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
  conv: ConversationDTO;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  language: string;
}) => {
  const time = new Date(conv.updated_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        {/* Clickable content */}
        <div
          onClick={() => onClick(conv.id)}
          className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 text-[#6B7280] mt-0.5 flex-shrink-0" />

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#111827] mb-1 line-clamp-2">
              {conv.title || (language === "hi" ? "नई बातचीत" : "New Chat")}
            </h3>

            {conv.last_message_preview && (
              <p className="text-sm text-[#6B7280] mb-2 line-clamp-1">
                {conv.last_message_preview}
              </p>
            )}

            <div className="text-xs text-[#9CA3AF]">{time}</div>
          </div>
        </div>

        {/* Delete */}
        <DeleteConversationButton
          onDelete={() => onDelete(conv.id)}
        />
      </div>
    </div>
  );
};
