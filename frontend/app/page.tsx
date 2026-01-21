"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SplashScreen } from "@/app/screens/SplashScreen";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Root always goes to login
    router.replace("/login");
  }, [router]);

  return <SplashScreen />;
}
