import { Menu, Globe, Settings } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';

export const Header = () => {
  const { language, setLanguage, isDrawerOpen, setIsDrawerOpen, isOnline, setCurrentScreen } = useApp();

  const toggleLanguage = () => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 z-50">
      <button
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
        aria-label="Menu"
      >
        <Menu className="w-6 h-6 text-[#111827]" />
      </button>

      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#10B981]' : 'bg-[#6B7280]'}`} />
        <h1 className="font-bold text-[#111827]">
          {language === 'hi' ? 'शिक्षा सहाय' : 'Siksha Sahay'}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-3 py-1.5 hover:bg-[#F9FAFB] rounded-lg transition-colors"
          aria-label="Change language"
        >
          <Globe className="w-4 h-4 text-[#6B7280]" />
          <span className="text-sm text-[#111827]">{language === 'hi' ? 'हिं' : 'EN'}</span>
        </button>
        <button
          onClick={() => setCurrentScreen('settings')}
          className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-6 h-6 text-[#111827]" />
        </button>
      </div>
    </header>
  );
};
