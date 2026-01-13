import { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { ChevronRight, Mic, Brain, CheckCircle } from 'lucide-react';

export const OnboardingScreen = () => {
  const { setCurrentScreen, setHasCompletedOnboarding, language } = useApp();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    grade: '',
    subject: '',
    language: 'hi',
  });

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    setHasCompletedOnboarding(true);
    setCurrentScreen('home');
  };

  const handleStart = () => {
    setHasCompletedOnboarding(true);
    setCurrentScreen('home');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Swipeable content */}
      <div className="flex-1 flex items-center justify-center px-8">
        {step === 0 && (
          <div className="text-center">
            <div className="w-48 h-48 mx-auto mb-8 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="70" cy="100" r="40" fill="#2563EB" opacity="0.2" />
                <circle cx="70" cy="90" r="25" fill="#2563EB" />
                <path d="M 70 115 L 70 145 M 55 125 L 70 125 M 70 125 L 85 125 M 70 145 L 55 165 M 70 145 L 85 165" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
                
                <circle cx="140" cy="100" r="30" fill="#10B981" opacity="0.2" />
                <circle cx="140" cy="100" r="20" fill="#10B981" />
                <path d="M 130 100 L 135 105 L 145 90" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#111827] mb-4">
              {language === 'hi' ? 'आपका व्यक्तिगत शिक्षण सहायक' : 'Your Personal Teaching Assistant'}
            </h2>
            <p className="text-[#6B7280] mb-2">
              {language === 'hi' ? 'कभी भी, कहीं भी, किसी भी' : 'Anytime, anywhere, any'}
            </p>
            <p className="text-[#6B7280]">
              {language === 'hi' ? 'समस्या का समाधान' : 'problem solved'}
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="text-center">
            <div className="space-y-12 mb-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-4">
                  <Mic className="w-8 h-8 text-[#10B981]" />
                </div>
                <h3 className="font-bold text-[#111827] mb-1">
                  {language === 'hi' ? '1. अपनी समस्या बोलें' : '1. Speak your problem'}
                </h3>
                <p className="text-sm text-[#6B7280]">
                  {language === 'hi' ? 'Speak your problem' : 'Voice or text input'}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#2563EB]/10 flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-[#2563EB]" />
                </div>
                <h3 className="font-bold text-[#111827] mb-1">
                  {language === 'hi' ? '2. तुरंत समाधान पाएं' : '2. Get instant solutions'}
                </h3>
                <p className="text-sm text-[#6B7280]">
                  {language === 'hi' ? 'Get instant solutions' : 'AI-powered guidance'}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#F59E0B]/10 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-[#F59E0B]" />
                </div>
                <h3 className="font-bold text-[#111827] mb-1">
                  {language === 'hi' ? '3. कक्षा में लागू करें' : '3. Apply in classroom'}
                </h3>
                <p className="text-sm text-[#6B7280]">
                  {language === 'hi' ? 'Apply in classroom' : 'Practical strategies'}
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full max-w-sm">
            <h2 className="text-xl font-bold text-[#111827] mb-6 text-center">
              {language === 'hi' ? 'आप कौन सी कक्षा पढ़ाते हैं?' : 'Which grade do you teach?'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#6B7280] mb-2">
                  {language === 'hi' ? 'कक्षा' : 'Grade'}
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full h-[52px] px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#111827]"
                >
                  <option value="">Select grade</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={`Class ${i + 1}`}>Class {i + 1}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-2">
                  {language === 'hi' ? 'मुख्य विषय?' : 'Primary subject?'}
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full h-[52px] px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#111827]"
                >
                  <option value="">Select subject</option>
                  <option value="Math">गणित / Math</option>
                  <option value="Science">विज्ञान / Science</option>
                  <option value="EVS">पर्यावरण / EVS</option>
                  <option value="Hindi">हिंदी / Hindi</option>
                  <option value="English">अंग्रेज़ी / English</option>
                  <option value="Social Studies">सामाजिक विज्ञान / Social Studies</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-2">
                  {language === 'hi' ? 'भाषा चुनें' : 'Choose language'}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, language: 'hi' })}
                    className={`flex-1 h-[52px] rounded-lg border-2 transition-colors ${
                      formData.language === 'hi'
                        ? 'border-[#2563EB] bg-[#DBEAFE] text-[#2563EB]'
                        : 'border-[#E5E7EB] bg-white text-[#111827]'
                    }`}
                  >
                    हिंदी
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, language: 'en' })}
                    className={`flex-1 h-[52px] rounded-lg border-2 transition-colors ${
                      formData.language === 'en'
                        ? 'border-[#2563EB] bg-[#DBEAFE] text-[#2563EB]'
                        : 'border-[#E5E7EB] bg-white text-[#111827]'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-2 py-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? 'bg-[#2563EB]' : 'bg-[#E5E7EB]'
            }`}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="p-4 space-y-2">
        {step < 2 ? (
          <>
            <button
              onClick={handleNext}
              className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {language === 'hi' ? 'आगे बढ़ें' : 'Next'}
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleSkip}
              className="w-full h-12 text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              {language === 'hi' ? 'छोड़ें' : 'Skip'}
            </button>
          </>
        ) : (
          <button
            onClick={handleStart}
            disabled={!formData.grade || !formData.subject}
            className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {language === 'hi' ? 'शुरू करें' : 'Start'}
          </button>
        )}
      </div>
    </div>
  );
};
