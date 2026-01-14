"use client";

import { Menu, Globe, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";

export const Header = () => {
  const router = useRouter();
  const { language, setLanguage, isDrawerOpen, setIsDrawerOpen } = useApp();

  // 🔑 hydration-safe online status
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);

    update(); // first client sync
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === "hi" ? "en" : "hi");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 z-50">
      {/* Menu */}
      <button
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
        aria-label="Menu"
      >
        <Menu className="w-6 h-6 text-[#111827]" />
      </button>

      {/* Title + status */}
      <div className="flex items-center gap-2">
        {/* 🔑 Render dot ONLY after hydration */}
        {isOnline !== null && (
          <div
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-[#10B981]" : "bg-[#6B7280]"
            }`}
          />
        )}

        <h1 className="font-bold text-[#111827]">
          {language === "hi" ? "शिक्षा सहाय" : "Siksha Sahay"}
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-3 py-1.5 hover:bg-[#F9FAFB] rounded-lg transition-colors"
          aria-label="Change language"
        >
          <Globe className="w-4 h-4 text-[#6B7280]" />
          <span className="text-sm text-[#111827]">
            {language === "hi" ? "हिं" : "EN"}
          </span>
        </button>

        <button
          onClick={() => router.push("/settings")}
          className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-6 h-6 text-[#111827]" />
        </button>
      </div>
    </header>
  );
};
