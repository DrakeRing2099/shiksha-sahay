import { Header } from '@/app/components/Header';
import { useApp } from '@/app/context/AppContext';
import { ArrowLeft, Search, MessageCircle } from 'lucide-react';

export const HistoryScreen = () => {
  const { language, setCurrentScreen } = useApp();

  const conversations = [
    {
      id: 1,
      title: language === 'hi' ? 'कक्षा प्रबंधन की समस्या' : 'Classroom management problem',
      preview: language === 'hi' ? 'मेरी कक्षा में बच्चे...' : 'Children in my class...',
      time: '12:34 PM',
      messageCount: 5,
      status: '✓',
      date: language === 'hi' ? 'आज' : 'Today',
    },
    {
      id: 2,
      title: language === 'hi' ? 'घटाव समझाने का तरीका' : 'How to explain subtraction',
      preview: language === 'hi' ? 'शून्य के साथ घटाव...' : 'Subtraction with zero...',
      time: '10:15 AM',
      messageCount: 8,
      status: '✓✓',
      date: language === 'hi' ? 'आज' : 'Today',
    },
    {
      id: 3,
      title: language === 'hi' ? 'समूह गतिविधि योजना' : 'Group activity plan',
      preview: language === 'hi' ? 'मिश्रित स्तर के लिए...' : 'For mixed levels...',
      time: language === 'hi' ? 'कल' : 'Yesterday',
      messageCount: 12,
      status: '✓',
      date: language === 'hi' ? 'कल' : 'Yesterday',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 z-50">
        <button
          onClick={() => setCurrentScreen('home')}
          className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#111827]" />
        </button>
        <h1 className="font-bold text-[#111827]">
          {language === 'hi' ? 'मेरी बातचीत' : 'My Conversations'}
        </h1>
        <button className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors">
          <Search className="w-6 h-6 text-[#111827]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 mt-16 overflow-y-auto px-4 py-4">
        {/* Today section */}
        <h2 className="text-sm font-bold text-[#6B7280] uppercase mb-3 px-2">
          {language === 'hi' ? 'आज | Today' : 'Today'}
        </h2>
        
        <div className="space-y-3 mb-6">
          {conversations.filter(c => c.date === (language === 'hi' ? 'आज' : 'Today')).map((conv) => (
            <div
              key={conv.id}
              className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-[#6B7280] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#111827] mb-1 line-clamp-2">{conv.title}</h3>
                  <p className="text-sm text-[#6B7280] mb-2 line-clamp-1">{conv.preview}</p>
                  <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                    <span>{conv.time}</span>
                    <span>•</span>
                    <span>{conv.messageCount} {language === 'hi' ? 'संदेश' : 'messages'}</span>
                    <span>•</span>
                    <span>{conv.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Yesterday section */}
        <h2 className="text-sm font-bold text-[#6B7280] uppercase mb-3 px-2">
          {language === 'hi' ? 'कल | Yesterday' : 'Yesterday'}
        </h2>
        
        <div className="space-y-3">
          {conversations.filter(c => c.date === (language === 'hi' ? 'कल' : 'Yesterday')).map((conv) => (
            <div
              key={conv.id}
              className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-[#6B7280] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#111827] mb-1 line-clamp-2">{conv.title}</h3>
                  <p className="text-sm text-[#6B7280] mb-2 line-clamp-1">{conv.preview}</p>
                  <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                    <span>{conv.time}</span>
                    <span>•</span>
                    <span>{conv.messageCount} {language === 'hi' ? 'संदेश' : 'messages'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
