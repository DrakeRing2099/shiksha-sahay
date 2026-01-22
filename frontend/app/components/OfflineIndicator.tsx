"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/context/AppContext";
import { WifiOff } from "lucide-react";

export const OfflineIndicator = () => {
  const { language } = useApp();

  // null = not hydrated yet
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      setShowIndicator(true);

      if (online) {
        setTimeout(() => setShowIndicator(false), 3000);
      }
    };

    // 🔑 first client-only sync
    updateStatus();

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  // 🔑 CRITICAL: identical HTML on server + first client render
  if (isOnline === null || !showIndicator) return null;

  return (
    <div
      className={`fixed top-20 left-4 right-4 z-50 p-4 rounded-lg shadow-lg border-2 transition-all duration-300 pointer-events-none ${
        isOnline
          ? "bg-[#D1FAE5] border-[#10B981]"
          : "bg-[#FEF3C7] border-[#F59E0B]"
      }`}
    >
      <div className="flex items-center gap-3">
        {!isOnline && <WifiOff className="w-5 h-5 text-[#F59E0B]" />}
        <div className="flex-1">
          <p className="font-medium text-[#111827]">
            {isOnline
              ? language === "hi"
                ? "आप फिर से ऑनलाइन हैं"
                : "You are back online"
              : language === "hi"
              ? "ऑफ़लाइन मोड"
              : "Offline Mode"}
          </p>
          <p className="text-sm text-[#6B7280]">
            {isOnline
              ? language === "hi"
                ? "सभी फीचर्स उपलब्ध हैं"
                : "All features available"
              : language === "hi"
              ? "संदेश बाद में भेजे जाएंगे"
              : "Messages will be sent later"}
          </p>
        </div>
      </div>
    </div>
  );
};
