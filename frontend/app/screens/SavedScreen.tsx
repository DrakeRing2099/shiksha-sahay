"use client";

import { ArrowLeft, ChevronDown, Bookmark, Eye, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { useEffect, useState } from "react";
import { db, SavedInsight } from "@/lib/db";

export const SavedScreen = () => {
  const router = useRouter();
  const { language } = useApp();

  const [savedItems, setSavedItems] = useState<SavedInsight[]>([]);

  /* =========================
     Load saved insights
  ========================= */

  const loadSaved = async () => {
    const items = await db.saved_insights
      .orderBy("savedAt")
      .reverse()
      .toArray();

    setSavedItems(items);
  };

  useEffect(() => {
    loadSaved();
  }, []);

  /* =========================
     Remove saved insight
  ========================= */

  const removeSaved = async (id: string) => {
    await db.saved_insights.delete(id);
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
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
          {language === "hi" ? "सहेजे गए" : "Saved"}
        </h1>

        <button className="flex items-center gap-1 px-3 py-1.5 hover:bg-[#F9FAFB] rounded-lg transition-colors">
          <span className="text-sm text-[#111827]">
            {language === "hi" ? "फ़िल्टर" : "Filter"}
          </span>
          <ChevronDown className="w-4 h-4 text-[#6B7280]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 mt-16 overflow-y-auto px-4 py-4">
        {savedItems.length === 0 && (
          <div className="text-center text-[#6B7280] mt-20">
            {language === "hi"
              ? "कोई सहेजा गया संसाधन नहीं"
              : "No saved resources"}
          </div>
        )}

        <div className="space-y-3">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-3 mb-3">
                <Bookmark className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B] mt-0.5" />

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#111827] mb-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-[#6B7280] mb-3 line-clamp-3">
                    {item.problem}
                  </p>

                  <p className="text-xs text-[#9CA3AF] mb-3">
                    {language === "hi"
                      ? "सहेजा गया"
                      : "Saved"}{" "}
                    ·{" "}
                    {new Date(item.savedAt).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        console.log("VIEW INSIGHT", item.id)
                      }
                      className="flex-1 h-10 border border-[#2563EB] text-[#2563EB] rounded-lg font-medium hover:bg-[#DBEAFE] transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">
                        {language === "hi" ? "देखें" : "View"}
                      </span>
                    </button>

                    <button
                      onClick={() => removeSaved(item.id)}
                      className="h-10 px-4 border border-[#EF4444] text-[#EF4444] rounded-lg font-medium hover:bg-[#FEE2E2] transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm">
                        {language === "hi" ? "हटाएं" : "Remove"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
