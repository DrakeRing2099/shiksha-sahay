"use client";
import { Message } from '@/app/context/ChatContext';
import { Mic, ThumbsUp, ThumbsDown, Bookmark } from 'lucide-react';
import { useState } from 'react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const [liked, setLiked] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (message.type === 'user') {
    return (
      <div className="flex justify-end mb-4 px-4">
        <div className="max-w-[75%]">
          <div className="bg-[#2563EB] text-white rounded-2xl px-4 py-3">
            {message.isVoice && (
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <Mic className="w-4 h-4" />
                <span className="text-sm">0:{message.voiceDuration?.toString().padStart(2, '0')}</span>
              </div>
            )}
            <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="flex items-center justify-end gap-2 mt-1 px-2">
            <span className="text-xs text-[#9CA3AF]">{formatTime(message.timestamp)}</span>
            {message.status === 'sent' && <span className="text-xs text-[#9CA3AF]">✓</span>}
            {message.status === 'delivered' && <span className="text-xs text-[#9CA3AF]">✓✓</span>}
          </div>
        </div>
      </div>
    );
  }

  // AI message
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
          
          <div className="text-base leading-relaxed text-[#111827] whitespace-pre-wrap">
            {message.content.split('\n').map((line, i) => {
              // Bold text
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <p key={i} className="font-bold mt-3 mb-1">
                    {line.replace(/\*\*/g, '')}
                  </p>
                );
              }
              // Bullet points
              if (line.startsWith('•')) {
                return (
                  <p key={i} className="ml-4 mb-1">
                    {line}
                  </p>
                );
              }
              // Regular text
              if (line.trim()) {
                return <p key={i} className="mb-2">{line}</p>;
              }
              return <br key={i} />;
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#E5E7EB]">
            <button
              onClick={() => setLiked(true)}
              className={`p-2 rounded-lg transition-colors ${
                liked === true ? 'bg-[#DBEAFE] text-[#2563EB]' : 'hover:bg-[#F3F4F6] text-[#6B7280]'
              }`}
              aria-label="Helpful"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLiked(false)}
              className={`p-2 rounded-lg transition-colors ${
                liked === false ? 'bg-[#FEE2E2] text-[#EF4444]' : 'hover:bg-[#F3F4F6] text-[#6B7280]'
              }`}
              aria-label="Not helpful"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className={`p-2 rounded-lg transition-colors ${
                saved ? 'bg-[#FEF3C7] text-[#F59E0B]' : 'hover:bg-[#F3F4F6] text-[#6B7280]'
              }`}
              aria-label="Save"
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
        <div className="px-2 mt-1">
          <span className="text-xs text-[#9CA3AF]">{formatTime(message.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};
