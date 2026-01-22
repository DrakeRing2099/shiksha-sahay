"use client";

import { Bookmark } from "lucide-react";
import { useSavedInsights } from "@/app/hooks/useSavedInsights";
import { SavedInsight } from "@/lib/db";

interface Props {
  insight: {
    id: string;
    title: string;
    problem: string;
    solution: string;
  };
}

export const ResourceCard = ({ insight }: Props) => {
  const { isSaved, save, remove } = useSavedInsights();
  const saved = isSaved(insight.id);

  const toggleSave = async () => {
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

  return (
    <div className="bg-white border rounded-xl p-4">
      <h3 className="font-bold">{insight.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-3">
        {insight.problem}
      </p>

      <div className="flex justify-end mt-3">
        <button
          onClick={toggleSave}
          className={`p-2 rounded-lg transition ${
            saved
              ? "bg-yellow-100 text-yellow-600"
              : "hover:bg-gray-100 text-gray-500"
          }`}
        >
          <Bookmark
            className={`w-5 h-5 ${saved ? "fill-current" : ""}`}
          />
        </button>
      </div>
    </div>
  );
};
