"use client";
import { useApp } from '@/app/context/AppContext';

export const ThinkingIndicator = () => {
  const { language } = useApp();

  return (
    <div className="flex justify-start mb-4 px-4">
      <div className="max-w-[85%]">
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-[#2563EB] flex items-center justify-center">
              <span className="text-white text-xs">🤖</span>
            </div>
            <span className="text-xs font-medium text-[#6B7280]">AI Coach</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse [animation-delay:200ms]" />
              <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse [animation-delay:400ms]" />
            </div>
            <span className="text-sm text-[#6B7280]">
              {language === 'hi' ? 'विचार कर रहा हूं...' : 'Thinking...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
