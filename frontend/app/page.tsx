"use client";
// app/page.tsx
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {SplashScreen} from "@/app/screens/SplashScreen";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasCompletedOnboarding =
        localStorage.getItem("hasCompletedOnboarding") === "true";

      if (hasCompletedOnboarding) {
        router.replace("/home");
      } else {
        router.replace("/onboarding");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return <SplashScreen />;
}
