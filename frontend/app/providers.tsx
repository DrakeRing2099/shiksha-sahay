"use client";

import { AppProvider } from "@/app/context/AppContext";
import { ChatProvider } from "@/app/context/ChatContext";
import { NavigationDrawer } from "@/app/components/NavigationDrawer";
import { OfflineIndicator } from "@/app/components/OfflineIndicator";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <ChatProvider>
        <NavigationDrawer />
        <OfflineIndicator />
        <main className="size-full">{children}</main>
      </ChatProvider>
    </AppProvider>
  );
}
