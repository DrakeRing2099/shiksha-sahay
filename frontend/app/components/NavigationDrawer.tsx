import { Home, Clock, Bookmark, BookOpen, BarChart, Settings, HelpCircle, LogOut, X } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import type { Screen } from '@/app/context/AppContext';

export const NavigationDrawer = () => {
  const { isDrawerOpen, setIsDrawerOpen, currentScreen, setCurrentScreen, userProfile, language } = useApp();

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
    setIsDrawerOpen(false);
  };

  const menuItems = [
    {
      icon: Home,
      labelHi: 'होम',
      labelEn: 'Home',
      screen: 'home' as Screen,
    },
    {
      icon: Clock,
      labelHi: 'मेरी बातचीत',
      labelEn: 'My Conversations',
      screen: 'history' as Screen,
    },
    {
      icon: Bookmark,
      labelHi: 'सहेजे गए',
      labelEn: 'Saved',
      screen: 'saved' as Screen,
    },
    {
      icon: BookOpen,
      labelHi: 'सीखने के संसाधन',
      labelEn: 'Learning Resources',
      screen: 'home' as Screen, // Placeholder
    },
    {
      icon: BarChart,
      labelHi: 'मेरी प्रगति',
      labelEn: 'My Progress',
      screen: 'home' as Screen, // Placeholder
    },
  ];

  const bottomItems = [
    {
      icon: Settings,
      labelHi: 'सेटिंग्स',
      labelEn: 'Settings',
      screen: 'settings' as Screen,
    },
    {
      icon: HelpCircle,
      labelHi: 'मदद',
      labelEn: 'Help',
      screen: 'home' as Screen, // Placeholder
    },
    {
      icon: LogOut,
      labelHi: 'लॉग आउट',
      labelEn: 'Log Out',
      screen: 'home' as Screen, // Placeholder
    },
  ];

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-250 animate-in fade-in"
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl animate-slide-in">
        {/* Profile Header */}
        <div className="h-20 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold">
              {userProfile.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold">{userProfile.name}</div>
              <div className="text-sm opacity-90">
                {language === 'hi' ? `${userProfile.grade} शिक्षक` : `${userProfile.grade} Teacher`}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Menu Items */}
        <nav className="py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => navigate(item.screen)}
                className={`w-full h-[52px] px-4 flex items-center gap-4 transition-colors ${
                  isActive ? 'bg-[#DBEAFE] text-[#2563EB]' : 'text-[#111827] hover:bg-[#F9FAFB]'
                }`}
              >
                <Icon className="w-6 h-6" />
                <div className="text-left">
                  <div>{language === 'hi' ? item.labelHi : item.labelEn}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-[#E5E7EB] mx-4" />

        {/* Bottom Items */}
        <nav className="py-4">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.screen;
            return (
              <button
                key={item.labelEn}
                onClick={() => navigate(item.screen)}
                className={`w-full h-[52px] px-4 flex items-center gap-4 transition-colors ${
                  isActive ? 'bg-[#DBEAFE] text-[#2563EB]' : 'text-[#111827] hover:bg-[#F9FAFB]'
                }`}
              >
                <Icon className="w-6 h-6" />
                <div className="text-left">
                  <div>{language === 'hi' ? item.labelHi : item.labelEn}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};