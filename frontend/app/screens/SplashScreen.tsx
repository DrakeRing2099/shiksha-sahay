"use client";

export const SplashScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-linear-to-b from-[#F9FAFB] to-white">
      <div className="w-24 h-24 rounded-full bg-[#2563EB] flex items-center justify-center mb-6 shadow-lg">
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-[#111827] mb-2">शिक्षा सहाय</h1>
      <p className="text-[#6B7280]">Siksha Sahay</p>

      <div className="flex gap-2 mt-8">
        <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse [animation-delay:200ms]" />
        <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse [animation-delay:400ms]" />
      </div>

      <p className="text-sm text-[#6B7280] mt-4">Checking connection...</p>
    </div>
  );
};
