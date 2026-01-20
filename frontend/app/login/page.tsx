"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { requestOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<"input" | "otp">("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const [form, setForm] = useState({
    phone: "",
    otp: "",
  });

  /* -----------------------
     Request OTP
  ----------------------- */
  const handleRequestOtp = async () => {
    setLoading(true);
    setError(null);
    setDevOtp(null);

    try {
      const res = await requestOtp({
        channel: "phone",
        destination: form.phone.trim(),
      });

      // ✅ DEV MODE OTP
      if (res?.dev_otp) {
        setDevOtp(res.dev_otp);
      }

      setStep("otp");
    } catch (e: any) {
      setError(e.message || "User not found");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------
     Verify OTP
  ----------------------- */
  const handleVerifyOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      await verifyOtp({
        channel: "phone",
        destination: form.phone.trim(),
        otp: form.otp.trim(),
      });

      router.replace("/home");
    } catch {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            {step === "input" ? "Welcome back" : "Verify OTP"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === "input" ? (
            <>
              <Input
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button
                className="w-full"
                disabled={!form.phone || loading}
                onClick={handleRequestOtp}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <Input
                placeholder="Enter 6-digit OTP"
                value={form.otp}
                onChange={(e) =>
                  setForm({ ...form, otp: e.target.value })
                }
              />

              {/* ✅ DEV OTP DISPLAY */}
              {devOtp && (
                <p className="text-sm text-green-600 text-center">
                  Dev OTP: <strong>{devOtp}</strong>
                </p>
              )}

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button
                className="w-full"
                disabled={!form.otp || loading}
                onClick={handleVerifyOtp}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>
            </>
          )}

          {/* Divider */}
          <div className="flex items-center gap-2 py-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Signup */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/onboarding")}
          >
            Create new account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
