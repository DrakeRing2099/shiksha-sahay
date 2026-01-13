import { useApp } from "@/app/context/AppContext";
import { useChat } from "@/app/context/ChatContext";
import { Info, X } from "lucide-react";

export const ContextCard = () => {
  const { language, userProfile } = useApp();
  const { contextVisible, setContextVisible } = useChat();

  if (!contextVisible) return null;

  return (
    <div className="mx-4 mt-4 mb-2 p-3 bg-[#DBEAFE] border border-[#93C5FD] rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
        <span className="text-sm text-[#111827]">
          {userProfile.grade} | {userProfile.subject}
        </span>
      </div>
      <button
        onClick={() => setContextVisible(false)}
        className="p-1 hover:bg-[#93C5FD]/30 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-[#2563EB]" />
      </button>
    </div>
  );
};