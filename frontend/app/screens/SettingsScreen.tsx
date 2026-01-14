'use client';

import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Switch } from '@/app/components/ui/switch';
import { useApp } from '@/app/context/AppContext';
import { useRouter } from 'next/navigation';
import { Checkmark } from '@/app/components/ui/checkmark';
import { useState } from 'react';


export default function SettingsScreen() {
  const router = useRouter();
  const { language, userProfile } = useApp();
  const [notifications, setNotifications] = useState({
    messages: true,
    tips: true,
    report: false,
  });

  const [dataSettings, setDataSettings] = useState({
    offline: true,
    wifiOnly: true,
  });

  return (
    <div className="flex h-full flex-col bg-[#F9FAFB]">
      {/* Fixed Header */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-16 items-center border-b border-[#E5E7EB] bg-white px-4">
        <button
          onClick={() => router.back()}
          className="mr-2 rounded-lg p-2 transition hover:bg-[#F9FAFB]"
          aria-label="Back"
        >
          <ArrowLeft className="h-6 w-6 text-[#111827]" />
        </button>

        <h1 className="font-bold text-[#111827]">
          {language === 'hi' ? 'सेटिंग्स | Settings' : 'Settings'}
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="mt-16 flex-1 overflow-y-auto">
        {/* Profile */}
        <Section title={language === 'hi' ? 'प्रोफ़ाइल | Profile' : 'Profile'}>
          <Input label={language === 'hi' ? 'नाम' : 'Name'} value={userProfile.name} />
          <Input
            label={language === 'hi' ? 'फ़ोन नंबर' : 'Phone Number'}
            value={userProfile.phone}
            type="tel"
          />

          <Select
            label={language === 'hi' ? 'कक्षा' : 'Grade'}
            value={userProfile.grade}
            options={[...Array(12)].map((_, i) => `Class ${i + 1}`)}
          />

          <Select
            label={language === 'hi' ? 'विषय' : 'Subject'}
            value={userProfile.subject}
            options={[
              'गणित / Math',
              'विज्ञान / Science',
              'पर्यावरण / EVS',
            ]}
          />
        </Section>

        {/* Language */}
        <Section title={language === 'hi' ? 'भाषा | Language' : 'Language'}>
          <Select
            label={language === 'hi' ? 'ऐप भाषा' : 'App Language'}
            options={['हिंदी', 'English']}
          />

          <Select
            label={language === 'hi' ? 'आवाज पहचान' : 'Voice Recognition'}
            options={[
              'हिंदी + English',
              'हिंदी Only',
              'English Only',
            ]}
          />
        </Section>

        {/* Notifications */}
        <Section title={language === 'hi' ? 'सूचनाएं | Notifications' : 'Notifications'}>
          <CheckRow
            label="New messages"
            checked={notifications.messages}
            onToggle={() =>
              setNotifications((s) => ({ ...s, messages: !s.messages }))
            }
          />

          <CheckRow
            label="Daily tips"
            checked={notifications.tips}
            onToggle={() =>
              setNotifications((s) => ({ ...s, tips: !s.tips }))
            }
          />

          <CheckRow
            label="Weekly report"
            checked={notifications.report}
            onToggle={() =>
              setNotifications((s) => ({ ...s, report: !s.report }))
            }
          />
        </Section>

        {/* Data */}
        <Section title={language === 'hi' ? 'डेटा | Data' : 'Data'}>
          {/* <Toggle
            label={language === 'hi' ? 'ऑफ़लाइन संदेश सहेजें' : 'Save offline messages'}
            defaultChecked
          />
          <Toggle
            label={language === 'hi' ? 'केवल Wi-Fi पर डाउनलोड' : 'Download on Wi-Fi only'}
            defaultChecked
          /> */}
          <CheckRow
            label="Save offline messages"
            checked={dataSettings.offline}
            onToggle={() =>
              setDataSettings((s) => ({ ...s, offline: !s.offline }))
            }
          />

          <CheckRow
            label="Download on Wi-Fi only"
            checked={dataSettings.wifiOnly}
            onToggle={() =>
              setDataSettings((s) => ({ ...s, wifiOnly: !s.wifiOnly }))
            }
          />
          <div className="border-t border-[#E5E7EB] pt-3">
            <p className="mb-3 text-sm text-[#6B7280]">
              {language === 'hi' ? 'संग्रहीत डेटा: 2.3 MB' : 'Stored data: 2.3 MB'}
            </p>

            <button className="h-12 w-full rounded-lg border-2 border-[#2563EB] font-medium text-[#2563EB] transition hover:bg-[#DBEAFE]">
              {language === 'hi' ? 'कैश साफ़ करें' : 'Clear Cache'}
            </button>
          </div>
        </Section>

        {/* Account */}
        <Section title={language === 'hi' ? 'अकाउंट | Account' : 'Account'}>
          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] font-medium text-[#111827] transition hover:bg-[#F9FAFB]">
            {language === 'hi' ? '🚪 लॉग आउट' : '🚪 Log Out'}
          </button>

          <button className="h-12 w-full rounded-lg font-medium text-[#EF4444] transition hover:bg-[#FEE2E2]">
            {language === 'hi' ? '🗑️ अकाउंट डिलीट करें' : '🗑️ Delete Account'}
          </button>
        </Section>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Reusable UI Helpers                */
/* ---------------------------------- */
function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className="flex w-full items-center justify-between py-2"
    >
      <span className="text-[#111827]">{label}</span>
      <Checkmark checked={checked} />
    </button>
  );
}


function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2 bg-white">
      <h2 className="border-b border-[#E5E7EB] px-4 pb-2 pt-6 text-sm font-bold uppercase text-[#6B7280]">
        {title}
      </h2>
      <div className="space-y-4 p-4">{children}</div>
    </div>
  );
}

function Input({
  label,
  value,
  type = 'text',
}: {
  label: string;
  value: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-[#6B7280]">{label}</label>
      <input
        type={type}
        value={value}
        readOnly
        className="h-12 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-[#111827]"
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
}: {
  label: string;
  value?: string;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-[#6B7280]">{label}</label>

      <div className="relative">
        <select
          defaultValue={value}
          className="h-12 w-full appearance-none rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-[#111827]"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
      </div>
    </div>
  );
}

function Toggle({
  label,
  defaultChecked,
}: {
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#111827]">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
