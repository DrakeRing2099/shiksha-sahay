"use client";

import { useState, useEffect, useRef } from "react";
import { useApp } from "@/app/context/AppContext";
import { useChat } from "@/app/context/ChatContext";
import { Mic, Send, Square } from "lucide-react";

export const InputBar = () => {
  const { language } = useApp();
  const { sendMessage, isAIThinking } = useChat();

  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  /* =========================
     Recording timer + waveform
  ========================= */

  useEffect(() => {
    if (isRecording) {
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - startTimeRef.current) / 1000
        );
        setRecordingDuration(elapsed);

        setWaveformHeights(
          Array.from({ length: 20 }, () => Math.random() * 40 + 10)
        );

        if (elapsed >= 120) {
          handleStopRecording();
        }
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setWaveformHeights([]);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  /* =========================
     Voice recording handlers
  ========================= */

  const handleStartRecording = async () => {
    if (typeof window === "undefined") return;

    if (
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== "function"
    ) {
      alert(
        language === "hi"
          ? "यह डिवाइस ऑडियो रिकॉर्डिंग को सपोर्ट नहीं करता"
          : "Audio recording is not supported on this device"
      );
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (error) {
      console.error("Microphone error:", error);
      alert(
        language === "hi"
          ? "माइक्रोफ़ोन एक्सेस की अनुमति दें"
          : "Please allow microphone access"
      );
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    const duration = recordingDuration;
    setRecordingDuration(0);

    // For now: send a text placeholder
    await sendMessage(
      language === "hi"
        ? `🎤 वॉइस मैसेज (${duration}s)`
        : `🎤 Voice message (${duration}s)`
    );
  };

  /* =========================
     Text messaging
  ========================= */

  const handleSendText = async () => {
    if (!inputText.trim()) return;

    await sendMessage(inputText.trim());
    setInputText("");
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSendText();
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /* =========================
     Recording UI
  ========================= */

  if (isRecording) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-[#FEF3C7] border-t-2 border-[#F59E0B] px-4 py-4 z-40">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleStopRecording}
            className="w-12 h-12 rounded-full bg-[#EF4444] flex items-center justify-center shadow-lg hover:bg-[#DC2626]"
          >
            <Square className="w-5 h-5 text-white fill-white" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
            <span className="text-sm font-medium">
              {language === "hi" ? "रिकॉर्ड हो रहा है" : "Recording..."}
            </span>
            <span className="text-sm font-mono text-gray-500">
              {formatRecordingTime(recordingDuration)}
            </span>
          </div>

          <div className="w-12" />
        </div>

        <div className="flex items-center justify-center gap-1 h-12">
          {waveformHeights.map((height, i) => (
            <div
              key={i}
              className="w-1 bg-[#F59E0B] rounded-full"
              style={{ height }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* =========================
     Normal input UI
  ========================= */

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t px-4 flex items-center gap-3 z-40 pointer-events-auto">
      <button
        onClick={handleStartRecording}
        className="w-12 h-12 rounded-full bg-[#10B981] hover:bg-[#059669] flex items-center justify-center"
      >
        <Mic className="w-6 h-6 text-white" />
      </button>

      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={
          language === "hi" ? "अपनी समस्या लिखें..." : "Type your problem..."
        }
        className="flex-1 h-12 px-4 rounded-full border bg-gray-50 focus:outline-none"
        disabled={isAIThinking}
      />

      <button
        onClick={handleSendText}
        disabled={!inputText.trim()}
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          inputText.trim()
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        <Send className="w-5 h-5 text-white" />
      </button>
    </div>
  );
};
