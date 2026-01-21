import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Shiksha Sahay",
  description: "App made for teachers support",
  manifest: "/manifest.json",
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="size-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
