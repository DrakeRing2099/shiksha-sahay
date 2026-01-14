"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { ChevronRight, Mic, Brain, CheckCircle } from "lucide-react";

export const OnboardingScreen = () => {
  const router = useRouter();
  const { language, setLanguage } = useApp();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    grade: "",
    subject: "",
    language: "hi",
  });

  const handleNext = () => {
    if (step < 2) setStep((s) => s + 1);
  };

  const completeOnboarding = () => {
    // persist onboarding completion
    localStorage.setItem("hasCompletedOnboarding", "true");

    // persist user preferences (optional but recommended)
    localStorage.setItem("userProfile", JSON.stringify({
      grade: formData.grade,
      subject: formData.subject,
      language: formData.language,
    }));

    setLanguage(formData.language as "hi" | "en");

    router.replace("/home");
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-8">
        {step === 0 && (
          <div className="text-center">
            <div className="w-48 h-48 mx-auto mb-8 flex items-center justify-center">
              {/* SVG stays unchanged */}
              {/* ... */}
            </div>

            <h2 className="text-2xl font-bold text-[#111827] mb-4">
              {language === "hi"
                ? "आपका व्यक्तिगत शिक्षण सहायक"
                : "Your Personal Teaching Assistant"}
            </h2>

            <p className="text-[#6B7280]">
              {language === "hi"
                ? "कभी भी, कहीं भी समाधान"
                : "Anytime, anywhere solutions"}
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="text-center space-y-12">
            <Feature
              icon={<Mic className="w-8 h-8 text-[#10B981]" />}
              titleHi="अपनी समस्या बोलें"
              titleEn="Speak your problem"
            />
            <Feature
              icon={<Brain className="w-8 h-8 text-[#2563EB]" />}
              titleHi="तुरंत समाधान पाएं"
              titleEn="Get instant solutions"
            />
            <Feature
              icon={<CheckCircle className="w-8 h-8 text-[#F59E0B]" />}
              titleHi="कक्षा में लागू करें"
              titleEn="Apply in classroom"
            />
          </div>
        )}

        {step === 2 && (
          <div className="w-full max-w-sm space-y-4">
            <select
              value={formData.grade}
              onChange={(e) =>
                setFormData({ ...formData, grade: e.target.value })
              }
              className="w-full h-12 border rounded-lg px-4"
            >
              <option value="">Select grade</option>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={`Class ${i + 1}`}>
                  Class {i + 1}
                </option>
              ))}
            </select>

            <select
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full h-12 border rounded-lg px-4"
            >
              <option value="">Select subject</option>
              <option value="Math">Math</option>
              <option value="Science">Science</option>
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setFormData({ ...formData, language: "hi" })
                }
                className={`flex-1 h-12 rounded-lg border ${
                  formData.language === "hi"
                    ? "bg-blue-100 border-blue-600"
                    : ""
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() =>
                  setFormData({ ...formData, language: "en" })
                }
                className={`flex-1 h-12 rounded-lg border ${
                  formData.language === "en"
                    ? "bg-blue-100 border-blue-600"
                    : ""
                }`}
              >
                English
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div className="p-4">
        {step < 2 ? (
          <>
            <button
              onClick={handleNext}
              className="w-full h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={completeOnboarding}
              className="w-full mt-2 text-gray-500"
            >
              Skip
            </button>
          </>
        ) : (
          <button
            onClick={completeOnboarding}
            disabled={!formData.grade || !formData.subject}
            className="w-full h-12 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Start
          </button>
        )}
      </div>
    </div>
  );
};

/* small helper */
const Feature = ({
  icon,
  titleHi,
  titleEn,
}: {
  icon: React.ReactNode;
  titleHi: string;
  titleEn: string;
}) => (
  <div className="flex flex-col items-center">
    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      {icon}
    </div>
    <h3 className="font-semibold text-center">
      {titleHi} / {titleEn}
    </h3>
  </div>
);
