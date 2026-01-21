"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomeScreen } from "../screens/HomeScreen";
import { useAuth } from "@/app/context/AuthContext";

export default function Page() {
  const router = useRouter();
  const { isReady, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log("HOME PAGE MOUNTED");

    if (!isReady) return;

    // 🔑 Home only cares about authentication
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady || !isAuthenticated) return null;

  return <HomeScreen />;
}
