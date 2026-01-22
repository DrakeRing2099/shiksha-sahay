"use client";

import { useParams } from "next/navigation";
import { InsightDetailScreen } from "@/app/screens/InsightDetailScreen";

export default function Page() {
  const params = useParams<{ id: string }>();

  return <InsightDetailScreen insightId={params.id} />;
}
