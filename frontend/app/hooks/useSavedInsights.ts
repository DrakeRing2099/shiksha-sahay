"use client";

import { useEffect, useState } from "react";
import { db, SavedInsight } from "@/lib/db";

export function useSavedInsights() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const refresh = async () => {
    const all = await db.saved_insights.toArray();
    setSavedIds(new Set(all.map(i => i.id)));
  };

  const save = async (insight: SavedInsight) => {
    await db.saved_insights.put(insight);
    await refresh();
  };

  const remove = async (id: string) => {
    await db.saved_insights.delete(id);
    await refresh();
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    savedIds,
    isSaved: (id: string) => savedIds.has(id),
    save,
    remove,
    refresh,
  };
}
