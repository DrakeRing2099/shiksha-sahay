"use client";

import {
  Home,
  Clock,
  Bookmark,
  BookOpen,
  BarChart,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/app/context/AppContext";

export const NavigationDrawer = () => {
  const router = useRouter();
  const pathname = usePathname();

  const {
    isDrawerOpen,
    setIsDrawerOpen,
    userProfile,
    language,
  } = useApp();

  const navigate = (href: string) => {
    router.push(href);
    setIsDrawerOpen(false);
  };

  const menuItems = [
    {
      id: "home",
      icon: Home,
      labelHi: "होम",
      labelEn: "Home",
      href: "/home",
    },
    {
      id: "history",
      icon: Clock,
      labelHi: "मेरी बातचीत",
      labelEn: "My Conversations",
      href: "/history",
    },
    {
      id: "saved",
      icon: Bookmark,
      labelHi: "सहेजे गए",
      labelEn: "Saved",
      href: "/saved",
    },
    {
      id: "resources",
      icon: BookOpen,
      labelHi: "सीखने के संसाधन",
      labelEn: "Learning Resources",
      href: "/resources", // can be added later
    },
    {
      id: "progress",
      icon: BarChart,
      labelHi: "मेरी प्रगति",
      labelEn: "My Progress",
      href: "/progress", // can be added later
    },
  ];

  const bottomItems = [
    {
      id: "settings",
      icon: Settings,
      labelHi: "सेटिंग्स",
      labelEn: "Settings",
      href: "/settings",
    },
    {
      id: "help",
      icon: HelpCircle,
      labelHi: "मदद",
      labelEn: "Help",
      href: "/help",
    },
    {
      id: "logout",
      icon: LogOut,
      labelHi: "लॉग आउट",
      labelEn: "Log Out",
      href: "/logout",
    },
  ];

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
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
                {language === "hi"
                  ? `${userProfile.grade} शिक्षक`
                  : `${userProfile.grade} Teacher`}
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

        {/* Main Menu */}
        <nav className="py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <button
                key={item.id} // ✅ UNIQUE
                onClick={() => navigate(item.href)}
                className={`w-full h-[52px] px-4 flex items-center gap-4 transition-colors ${
                  isActive
                    ? "bg-[#DBEAFE] text-[#2563EB]"
                    : "text-[#111827] hover:bg-[#F9FAFB]"
                }`}
              >
                <Icon className="w-6 h-6" />
                {language === "hi" ? item.labelHi : item.labelEn}
              </button>
            );
          })}
        </nav>

        <div className="h-px bg-[#E5E7EB] mx-4" />

        {/* Bottom Menu */}
        <nav className="py-4">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <button
                key={item.id} // ✅ UNIQUE
                onClick={() => navigate(item.href)}
                className={`w-full h-[52px] px-4 flex items-center gap-4 transition-colors ${
                  isActive
                    ? "bg-[#DBEAFE] text-[#2563EB]"
                    : "text-[#111827] hover:bg-[#F9FAFB]"
                }`}
              >
                <Icon className="w-6 h-6" />
                {language === "hi" ? item.labelHi : item.labelEn}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
