"use client";

import { Trash2 } from "lucide-react";

interface Props {
  onDelete: () => void;
}

export const DeleteConversationButton = ({ onDelete }: Props) => {
  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete();
      }}
      className="
        p-2 rounded-md
        text-[#6B7280]
        hover:text-[#DC2626]
        hover:bg-[#FEF2F2]
        active:bg-[#FEE2E2]
        flex items-center justify-center
        pointer-events-auto
      "
      aria-label="Delete conversation"
    >
      <Trash2 className="w-4 h-4 pointer-events-none" />
    </button>
  );
};
