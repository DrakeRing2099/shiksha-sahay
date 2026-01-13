import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/app/context/AppContext';
import { useChat } from '@/app/context/ChatContext';
import { Mic, Send, Square } from 'lucide-react';

export const InputBar = () => {
  const { language } = useApp();
  const { addMessage, isRecording, setIsRecording, recordingDuration, setRecordingDuration } = useChat();
  const [inputText, setInputText] = useState('');
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRecording) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingDuration(elapsed);
        
        // Generate random waveform heights for animation
        setWaveformHeights(Array.from({ length: 20 }, () => Math.random() * 40 + 10));
        
        // Auto-stop at 2 minutes
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
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, setRecordingDuration]);

  const handleStartRecording = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert(language === 'hi' 
        ? 'माइक्रोफ़ोन एक्सेस की अनुमति दें' 
        : 'Please allow microphone access');
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    const duration = recordingDuration;
    setRecordingDuration(0);
    
    // Add voice message
    addMessage({
      type: 'user',
      content: language === 'hi' 
        ? 'यह एक वॉइस मैसेज है (रिकॉर्डिंग फीचर डेमो के लिए)' 
        : 'This is a voice message (recording feature for demo)',
      isVoice: true,
      voiceDuration: duration,
      status: 'sent',
    });
  };

  const handleSendText = () => {
    if (inputText.trim()) {
      addMessage({
        type: 'user',
        content: inputText.trim(),
        status: 'sent',
      });
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isRecording) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-[#FEF3C7] border-t-2 border-[#F59E0B] px-4 py-4 z-40">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleStopRecording}
            className="w-12 h-12 rounded-full bg-[#EF4444] flex items-center justify-center shadow-lg hover:bg-[#DC2626] transition-colors"
            aria-label="Stop recording"
          >
            <Square className="w-5 h-5 text-white fill-white" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
            <span className="text-sm font-medium text-[#111827]">
              {language === 'hi' ? 'रिकॉर्ड हो रहा है' : 'Recording...'}
            </span>
            <span className="text-sm font-mono text-[#6B7280]">
              {formatRecordingTime(recordingDuration)}
            </span>
          </div>
          
          <div className="w-12" /> {/* Spacer for centering */}
        </div>

        {/* Waveform animation */}
        <div className="flex items-center justify-center gap-1 h-12">
          {waveformHeights.map((height, i) => (
            <div
              key={i}
              className="w-1 bg-[#F59E0B] rounded-full transition-all duration-100"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-[#E5E7EB] px-4 flex items-center gap-3 z-40">
      <button
        onClick={handleStartRecording}
        className="w-12 h-12 rounded-full bg-[#10B981] hover:bg-[#059669] flex items-center justify-center shadow-lg transition-colors flex-shrink-0"
        aria-label="Start voice recording"
      >
        <Mic className="w-6 h-6 text-white" />
      </button>
      
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={language === 'hi' ? 'अपनी समस्या लिखें...' : 'Type your problem...'}
        className="flex-1 h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-full text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
      />
      
      <button
        onClick={handleSendText}
        disabled={!inputText.trim()}
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
          inputText.trim()
            ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
            : 'bg-[#9CA3AF] text-white cursor-not-allowed'
        }`}
        aria-label="Send message"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};
