"use client";
import { useApp } from '@/app/context/AppContext';
import { BarChart3, BookOpen, HelpCircle, Target } from 'lucide-react';

interface QuickActionsProps {
  onActionClick: (text: string) => void;
}

export const QuickActions = ({ onActionClick }: QuickActionsProps) => {
  const { language } = useApp();

  const actions = [
    {
      icon: BarChart3,
      labelHi: 'कक्षा प्रबंधन',
      labelEn: 'Classroom Management',
      query: language === 'hi' 
        ? 'मेरी कक्षा में बच्चे बहुत शोर करते हैं, मैं क्या करूं?' 
        : 'Children in my class are very noisy, what should I do?',
    },
    {
      icon: BookOpen,
      labelHi: 'पाठ योजना',
      labelEn: 'Lesson Plan',
      query: language === 'hi'
        ? 'मुझे आज के पाठ के लिए गतिविधियों के विचार चाहिए'
        : 'I need activity ideas for today\'s lesson',
    },
    {
      icon: HelpCircle,
      labelHi: 'अवधारणा स्पष्टीकरण',
      labelEn: 'Concept Explanation',
      query: language === 'hi'
        ? 'बच्चों को यह अवधारणा समझाने का सबसे अच्छा तरीका क्या है?'
        : 'What is the best way to explain this concept to children?',
    },
    {
      icon: Target,
      labelHi: 'मूल्यांकन',
      labelEn: 'Assessment',
      query: language === 'hi'
        ? 'मैं बच्चों की समझ का मूल्यांकन कैसे करूं?'
        : 'How do I assess children\'s understanding?',
    },
  ];

  return (
    <div className="px-4 py-4">
      <p className="text-sm text-[#6B7280] mb-3">
        {language === 'hi' ? 'अक्सर पूछे जाने वाले सवाल:' : 'Frequently asked questions:'}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.labelEn}
              onClick={() => onActionClick(action.query)}
              className="p-3 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#2563EB] hover:bg-[#DBEAFE]/30 transition-colors text-left"
            >
              <Icon className="w-5 h-5 text-[#2563EB] mb-2" />
              <span className="text-sm text-[#111827] block">
                {language === 'hi' ? action.labelHi : action.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
