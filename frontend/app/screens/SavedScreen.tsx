import { Header } from '@/app/components/Header';
import { useApp } from '@/app/context/AppContext';
import { ArrowLeft, ChevronDown, Bookmark, Eye, X } from 'lucide-react';

export const SavedScreen = () => {
  const { language, setCurrentScreen } = useApp();

  const savedItems = [
    {
      id: 1,
      title: language === 'hi' ? 'कक्षा प्रबंधन रणनीति' : 'Classroom management strategy',
      content: language === 'hi' ? 'समूह गतिविधि के दौरान...' : 'During group activities...',
      tags: [`${language === 'hi' ? 'कक्षा 4' : 'Class 4'}`, `${language === 'hi' ? 'गणित' : 'Math'}`],
      date: language === 'hi' ? '2 दिन पहले' : '2 days ago',
    },
    {
      id: 2,
      title: language === 'hi' ? 'शून्य के साथ घटाव' : 'Subtraction with zero',
      content: language === 'hi' ? 'बेस-10 ब्लॉक का उपयोग...' : 'Use base-10 blocks...',
      tags: [`${language === 'hi' ? 'कक्षा 4' : 'Class 4'}`, `${language === 'hi' ? 'गणित' : 'Math'}`],
      date: language === 'hi' ? '5 दिन पहले' : '5 days ago',
    },
    {
      id: 3,
      title: language === 'hi' ? 'प्रश्न पूछने की तकनीक' : 'Question asking technique',
      content: language === 'hi' ? 'खुले प्रश्नों का उपयोग...' : 'Use open-ended questions...',
      tags: [`${language === 'hi' ? 'सभी विषय' : 'All subjects'}`],
      date: language === 'hi' ? '1 सप्ताह पहले' : '1 week ago',
    },
  ];

  const categories = [
    language === 'hi' ? 'सभी' : 'All',
    language === 'hi' ? 'रणनीतियाँ' : 'Strategies',
    language === 'hi' ? 'उदाहरण' : 'Examples',
    language === 'hi' ? 'टिप्स' : 'Tips',
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
          {language === 'hi' ? 'सहेजे गए' : 'Saved'}
        </h1>
        <button className="flex items-center gap-1 px-3 py-1.5 hover:bg-[#F9FAFB] rounded-lg transition-colors">
          <span className="text-sm text-[#111827]">
            {language === 'hi' ? 'फ़िल्टर' : 'Filter'}
          </span>
          <ChevronDown className="w-4 h-4 text-[#6B7280]" />
        </button>
      </div>

      {/* Category tabs */}
      <div className="fixed top-16 left-0 right-0 bg-white border-b border-[#E5E7EB] px-4 py-3 z-40">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category, index) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                index === 0
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-[#F9FAFB]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mt-[116px] overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-3 mb-3">
                <Bookmark className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5 fill-[#F59E0B]" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#111827] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#6B7280] mb-3">{item.content}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-[#DBEAFE] text-[#2563EB] text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-xs text-[#9CA3AF] mb-3">{item.date}</p>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 h-10 border border-[#2563EB] text-[#2563EB] rounded-lg font-medium hover:bg-[#DBEAFE] transition-colors flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{language === 'hi' ? 'देखें' : 'View'}</span>
                    </button>
                    <button className="h-10 px-4 border border-[#EF4444] text-[#EF4444] rounded-lg font-medium hover:bg-[#FEE2E2] transition-colors flex items-center justify-center gap-2">
                      <X className="w-4 h-4" />
                      <span className="text-sm">{language === 'hi' ? 'हटाएं' : 'Remove'}</span>
                    </button>
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
