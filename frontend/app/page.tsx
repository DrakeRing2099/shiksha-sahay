// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { SplashScreen } from "@/app/screens/SplashScreen";
// import { useAuth } from "@/app/context/AuthContext";

// export default function Page() {
//   const router = useRouter();
//   const { isReady, isAuthenticated } = useAuth();
 

//   useEffect(() => {
//     console.log("ROOT PAGE EFFECT", { isReady, isAuthenticated });
//     if (!isReady) return;

//     if (!isAuthenticated) {
//       router.replace("/login");
//       return;
//     }

//     // 🔑 authenticated users ALWAYS go home
//     router.replace("/home");
//   }, [isReady, isAuthenticated, router]);

//   return <SplashScreen />;
// }
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
