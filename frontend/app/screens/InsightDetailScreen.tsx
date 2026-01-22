"use client";

import { ArrowLeft, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useApp } from "@/app/context/AppContext";
import { useSavedInsights } from "@/app/hooks/useSavedInsights";
import { db, SavedInsight } from "@/lib/db";
import { fetchTeachingInsights, TeachingInsightDTO } from "@/lib/api";

interface Props {
  insightId: string;
}

export const InsightDetailScreen = ({ insightId }: Props) => {
  const router = useRouter();
  const { language } = useApp();
  const { isSaved, save, remove } = useSavedInsights();

  const [insight, setInsight] = useState<TeachingInsightDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const saved = isSaved(insightId);

  /* =========================
     Load insight (offline first)
  ========================= */

  useEffect(() => {
    const load = async () => {
      // 1️⃣ Try IndexedDB first
      const local = await db.saved_insights.get(insightId);
      if (local) {
        setInsight({
        id: local.id,
        title: local.title,
        problem: local.problem,
        solution: local.solution,
        created_at: new Date(local.savedAt).toISOString(),
        context: null,        // ✅ offline-safe default
        likes_count: 0,       // ✅ offline-safe default
        });

        setLoading(false);
        return;
      }

      // 2️⃣ Fallback to API
      try {
        const list = await fetchTeachingInsights(50);
        const found = list.find((i) => i.id === insightId);
        if (found) setInsight(found);
      } catch (e) {
        console.error("Failed to load insight", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [insightId]);

  /* =========================
     Save / Unsave
  ========================= */

  const toggleSave = async () => {
    if (!insight) return;

    if (saved) {
      await remove(insight.id);
    } else {
      const record: SavedInsight = {
        id: insight.id,
        title: insight.title,
        problem: insight.problem,
        solution: insight.solution,
        savedAt: Date.now(),
      };
      await save(record);
    }
  };

  /* =========================
     Render
  ========================= */

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-[#6B7280]">
        {language === "hi" ? "लोड हो रहा है..." : "Loading..."}
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="h-full flex items-center justify-center text-[#6B7280]">
        {language === "hi"
          ? "संसाधन नहीं मिला"
          : "Resource not found"}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="h-16 border-b border-[#E5E7EB] flex items-center justify-between px-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-[#F9FAFB] rounded-lg"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          onClick={toggleSave}
          className={`p-2 rounded-lg transition ${
            saved
              ? "bg-yellow-100 text-yellow-600"
              : "hover:bg-gray-100 text-gray-500"
          }`}
        >
          <Bookmark className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <h1 className="text-xl font-bold text-[#111827] mb-4">
          {insight.title}
        </h1>

        <h2 className="font-semibold text-[#374151] mb-2">
          {language === "hi" ? "समस्या" : "Problem"}
        </h2>
        <p className="text-[#4B5563] mb-6 whitespace-pre-wrap">
          {insight.problem}
        </p>

        <h2 className="font-semibold text-[#374151] mb-2">
          {language === "hi" ? "समाधान" : "Solution"}
        </h2>
        <p className="text-[#4B5563] whitespace-pre-wrap">
          {insight.solution}
        </p>
      </div>
    </div>
  );
};
