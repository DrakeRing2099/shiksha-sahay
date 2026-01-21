// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/app/context/AuthContext";
// import { OnboardingScreen } from "@/app/screens/OnboardingScreen";

// export default function Page() {
//   const router = useRouter();
//   const { isAuthenticated, isReady } = useAuth();

//   useEffect(() => {
//     console.log("ONBOARDING PAGE MOUNTED");

//     if (!isReady) return;

//     if (!isAuthenticated) {
//       router.replace("/login");
//       return;
//     }

//     const completed =
//       localStorage.getItem("hasCompletedOnboarding") === "true";

//     if (completed) {
//       router.replace("/home");
//     }
//   }, [isAuthenticated, isReady]);

//   return <OnboardingScreen />;
// }
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingScreen } from "@/app/screens/OnboardingScreen";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // OPTIONAL: if already logged in, don't allow signup
    // router.replace("/home");
  }, [router]);

  return <OnboardingScreen />;
}
