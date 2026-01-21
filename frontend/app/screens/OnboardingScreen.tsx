"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { fetchSchools } from "@/lib/api";
import { AuthStep } from "@/app/components/auth/AuthStep";
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

  const [schools, setSchools] = useState<
    { id: string; name: string; location: string | null }[]
  >([]);

  const [schoolId, setSchoolId] = useState("");
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  /* ------------------------
     Navigation
  ------------------------ */

  const handleNext = () => {
    if (step < 2) setStep((s) => s + 1);
  };

  const goToAuthStep = () => {
    // Save preferences (not completed yet)
    localStorage.setItem(
      "userProfile",
      JSON.stringify({
      grade: formData.grade,
      subject: formData.subject,
      language: formData.language,
        schoolId,
      })
    );

    setLanguage(formData.language as "hi" | "en");
    setStep(3);
  };

  /* ------------------------
     Fetch schools
  ------------------------ */

  useEffect(() => {
    if (step === 2) {
      setSchoolsLoading(true);
      fetchSchools()
        .then(setSchools)
        .catch(console.error)
        .finally(() => setSchoolsLoading(false));
    }
  }, [step]);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-8">
        {/* Step 0 */}
        {step === 0 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              {language === "hi"
                ? "आपका व्यक्तिगत शिक्षण सहायक"
                : "Your Personal Teaching Assistant"}
            </h2>
            <p className="text-gray-500">
              {language === "hi"
                ? "कभी भी, कहीं भी समाधान"
                : "Anytime, anywhere solutions"}
            </p>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="text-center space-y-12">
            <Feature
              icon={<Mic className="w-8 h-8 text-green-500" />}
              titleHi="अपनी समस्या बोलें"
              titleEn="Speak your problem"
            />
            <Feature
              icon={<Brain className="w-8 h-8 text-blue-600" />}
              titleHi="तुरंत समाधान पाएं"
              titleEn="Get instant solutions"
            />
            <Feature
              icon={<CheckCircle className="w-8 h-8 text-yellow-500" />}
              titleHi="कक्षा में लागू करें"
              titleEn="Apply in classroom"
            />
          </div>
        )}

        {/* Step 2 */}
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

            <select
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              className="w-full h-12 border rounded-lg px-4"
              disabled={schoolsLoading}
            >
              <option value="">
                {schoolsLoading ? "Loading schools..." : "Select school"}
              </option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.location ? ` — ${s.location}` : ""}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setFormData({ ...formData, language: "hi" })
                }
                className={`flex-1 h-12 border rounded-lg ${
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
                className={`flex-1 h-12 border rounded-lg ${
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

        {/* Step 3: Auth */}
        {step === 3 && (
          <AuthStep
            schoolId={schoolId}
            onAuthSuccess={() => {
              localStorage.setItem("hasCompletedOnboarding", "true");
              router.replace("/home");
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-4">
        {step < 2 && (
            <button
              onClick={handleNext}
              className="w-full h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
        )}

        {step === 2 && (
          <button
            onClick={goToAuthStep}
            disabled={!formData.grade || !formData.subject || !schoolId}
            className="w-full h-12 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Start
          </button>
        )}
      </div>
    </div>
  );
};

/* Helper */
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
