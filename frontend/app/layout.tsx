"use client";

import "./globals.css";

import { AppProvider } from "@/app/context/AppContext";
import { ChatProvider } from "@/app/context/ChatContext";

import { NavigationDrawer } from "@/app/components/NavigationDrawer";
import { OfflineIndicator } from "@/app/components/OfflineIndicator";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="size-full">
        <AppProvider>
          <ChatProvider>
            {/* Persistent UI */}
            <NavigationDrawer />
            <OfflineIndicator />

            {/* Route-based screens */}
            <main className="size-full">
              {children}
            </main>
          </ChatProvider>
        </AppProvider>
      </body>
    </html>
  );
}
