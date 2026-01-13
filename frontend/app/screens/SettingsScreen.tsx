import { Header } from '@/app/components/Header';
import { useApp } from '@/app/context/AppContext';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Switch } from '@/app/components/ui/switch';

export const SettingsScreen = () => {
  const { language, setCurrentScreen, userProfile } = useApp();

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E5E7EB] flex items-center px-4 z-50">
        <button
          onClick={() => setCurrentScreen('home')}
          className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors mr-2"
        >
          <ArrowLeft className="w-6 h-6 text-[#111827]" />
        </button>
        <h1 className="font-bold text-[#111827]">
          {language === 'hi' ? 'सेटिंग्स | Settings' : 'Settings'}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 mt-16 overflow-y-auto">
        {/* Profile Section */}
        <div className="bg-white mb-2">
          <h2 className="text-sm font-bold text-[#6B7280] uppercase px-4 pt-6 pb-2 border-b border-[#E5E7EB]">
            {language === 'hi' ? 'प्रोफ़ाइल | Profile' : 'Profile'}
          </h2>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm text-[#6B7280] mb-2">
                {language === 'hi' ? 'नाम' : 'Name'}
              </label>
              <input
                type="text"
                value={userProfile.name}
                className="w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#111827]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#6B7280] mb-2">
                {language === 'hi' ? 'फ़ोन नंबर' : 'Phone Number'}
              </label>
              <input
                type="tel"
                value={userProfile.phone}
                className="w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#111827]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#6B7280] mb-2">
                {language === 'hi' ? 'कक्षा' : 'Grade'}
              </label>
              <div className="relative">
                <select
                  value={userProfile.grade}
                  className="w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#111827] appearance-none"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={`Class ${i + 1}`}>Class {i + 1}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#6B7280] mb-2">
                {language === 'hi' ? 'विषय' : 'Subject'}
              </label>
              <div className="relative">
                <select
                  value={userProfile.subject}
                  className="w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#111827] appearance-none"
                >
                  <option value="गणित">गणित / Math</option>
                  <option value="विज्ञान">विज्ञान / Science</option>
                  <option value="पर्यावरण">पर्यावरण / EVS</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Language Section */}
        <div className="bg-white mb-2">
          <h2 className="text-sm font-bold text-[#6B7280] uppercase px-4 pt-6 pb-2 border-b border-[#E5E7EB]">
            {language === 'hi' ? 'भाषा | Language' : 'Language'}
          </h2>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm text-[#6B7280] mb-2">
                {language === 'hi' ? 'ऐप भाषा' : 'App Language'}
              </label>
              <div className="relative">
                <select className="w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#111827] appearance-none">
                  <option value="hi">हिंदी</option>
                  <option value="en">English</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#6B7280] mb-2">
                {language === 'hi' ? 'आवाज पहचान' : 'Voice Recognition'}
              </label>
              <div className="relative">
                <select className="w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#111827] appearance-none">
                  <option value="hi-en">हिंदी + English</option>
                  <option value="hi">हिंदी Only</option>
                  <option value="en">English Only</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white mb-2">
          <h2 className="text-sm font-bold text-[#6B7280] uppercase px-4 pt-6 pb-2 border-b border-[#E5E7EB]">
            {language === 'hi' ? 'सूचनाएं | Notifications' : 'Notifications'}
          </h2>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#111827]">
                {language === 'hi' ? 'नए संदेश' : 'New messages'}
              </span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#111827]">
                {language === 'hi' ? 'दैनिक सुझाव' : 'Daily tips'}
              </span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#111827]">
                {language === 'hi' ? 'साप्ताहिक रिपोर्ट' : 'Weekly report'}
              </span>
              <Switch />
            </div>
          </div>
        </div>

        {/* Data Section */}
        <div className="bg-white mb-2">
          <h2 className="text-sm font-bold text-[#6B7280] uppercase px-4 pt-6 pb-2 border-b border-[#E5E7EB]">
            {language === 'hi' ? 'डेटा | Data' : 'Data'}
          </h2>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#111827]">
                {language === 'hi' ? 'ऑफ़लाइन संदेश सहेजें' : 'Save offline messages'}
              </span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#111827]">
                {language === 'hi' ? 'केवल Wi-Fi पर डाउनलोड' : 'Download on Wi-Fi only'}
              </span>
              <Switch defaultChecked />
            </div>
            <div className="pt-2 border-t border-[#E5E7EB]">
              <p className="text-sm text-[#6B7280] mb-3">
                {language === 'hi' ? 'संग्रहीत डेटा: 2.3 MB' : 'Stored data: 2.3 MB'}
              </p>
              <button className="w-full h-12 border-2 border-[#2563EB] text-[#2563EB] rounded-lg font-medium hover:bg-[#DBEAFE] transition-colors">
                {language === 'hi' ? 'कैश साफ़ करें' : 'Clear Cache'}
              </button>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-white mb-2">
          <h2 className="text-sm font-bold text-[#6B7280] uppercase px-4 pt-6 pb-2 border-b border-[#E5E7EB]">
            {language === 'hi' ? 'अकाउंट | Account' : 'Account'}
          </h2>
          
          <div className="p-4 space-y-3">
            <button className="w-full h-12 border border-[#E5E7EB] text-[#111827] rounded-lg font-medium hover:bg-[#F9FAFB] transition-colors flex items-center justify-center gap-2">
              <span>{language === 'hi' ? '🚪 लॉग आउट' : '🚪 Log Out'}</span>
            </button>
            <button className="w-full h-12 text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg font-medium transition-colors">
              {language === 'hi' ? '🗑️ अकाउंट डिलीट करें' : '🗑️ Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
