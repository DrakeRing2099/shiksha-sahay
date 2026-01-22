"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { fetchTeachingInsights, TeachingInsightDTO } from "@/lib/api";
import { ResourceCard } from "@/app/components/ResourceCard";
import { useApp } from "@/app/context/AppContext";

export const LearningResourcesScreen = () => {
  const router = useRouter();
  const { language } = useApp();

  const [insights, setInsights] = useState<TeachingInsightDTO[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     Load feed
  ========================= */

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTeachingInsights(20);
        setInsights(data);
      } catch (e) {
        console.error("Failed to load insights", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* =========================
     Render
  ========================= */

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E5E7EB] flex items-center px-4 z-50">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-[#F9FAFB] rounded-lg"
        >
          <ArrowLeft className="w-6 h-6 text-[#111827]" />
        </button>

        <h1 className="ml-3 font-bold text-[#111827]">
          {language === "hi" ? "शिक्षण संसाधन" : "Learning Resources"}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 mt-16 overflow-y-auto px-4 py-4">
        {loading && (
          <div className="text-center text-[#6B7280] mt-20">
            {language === "hi" ? "लोड हो रहा है..." : "Loading resources..."}
          </div>
        )}

        {!loading && insights.length === 0 && (
          <div className="text-center text-[#6B7280] mt-20">
            {language === "hi"
              ? "कोई संसाधन नहीं मिला"
              : "No resources found"}
          </div>
        )}

        <div className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              onClick={() => router.push(`/insight/${insight.id}`)}
              className="cursor-pointer"
            >
              <ResourceCard
                insight={{
                  id: insight.id,
                  title: insight.title,
                  problem: insight.problem,
                  solution: insight.solution,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
