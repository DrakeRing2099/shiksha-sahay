"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
  voiceDuration?: number;
  status?: 'sending' | 'sent' | 'delivered';
}

interface ChatContextType {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  recordingDuration: number;
  setRecordingDuration: (duration: number) => void;
  isAIThinking: boolean;
  setIsAIThinking: (thinking: boolean) => void;
  contextVisible: boolean;
  setContextVisible: (visible: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [contextVisible, setContextVisible] = useState(true);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate AI response
    if (message.type === 'user') {
      setIsAIThinking(true);
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: generateMockAIResponse(),
          timestamp: new Date(),
          status: 'delivered',
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsAIThinking(false);
      }, 2000);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        isRecording,
        setIsRecording,
        recordingDuration,
        setRecordingDuration,
        isAIThinking,
        setIsAIThinking,
        contextVisible,
        setContextVisible,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Mock AI response generator
function generateMockAIResponse(): string {
  const responses = [
    `मैं समझता हूं कि कक्षा प्रबंधन चुनौतीपूर्ण हो सकता है।

यहां 3 रणनीतियां हैं:

**1. समूह गतिविधि**
बच्चों को 4-5 के समूहों में बांटें। प्रत्येक समूह को एक नेता बनाएं जो शोर को नियंत्रित करने में मदद करे।

**2. ध्यान संकेत**
एक विशेष ताली या संगीत का उपयोग करें जिसे सुनकर बच्चे शांत हो जाएं।

**3. पॉजिटिव रीइन्फोर्समेंट**
शांत रहने वाले बच्चों को स्टार या प्रशंसा दें।`,
    
    `यह एक बढ़िया सवाल है! मैं इसमें आपकी मदद कर सकता हूं।

**समाधान:**

• विजुअल एड्स का उपयोग करें - चार्ट, चित्र, या वास्तविक वस्तुएं
• छोटे-छोटे समूहों में अभ्यास करवाएं
• हाथ से की जाने वाली गतिविधियों को शामिल करें

**उदाहरण:**
यदि आप घटाव सिखा रहे हैं, तो पत्थरों या बटनों का उपयोग करें जिन्हें बच्चे देख और छू सकें।`,
    
    `बहुत अच्छा प्रश्न! आइए इसे चरण-दर-चरण देखें:

**तरीका 1:** कहानियों के माध्यम से
**तरीका 2:** खेल-खेल में सिखाना
**तरीका 3:** व्यावहारिक उदाहरण

क्या आप चाहेंगे कि मैं किसी विशेष तरीके को और विस्तार से समझाऊं?`,
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
