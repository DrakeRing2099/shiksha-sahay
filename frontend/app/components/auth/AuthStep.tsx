"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { OtpVerifyForm } from "./OtpVerifyForm";

type SignupOtpResponse = {
  ok: true;
  dev_otp?: string;
  teacher_id?: string;
};

export const AuthStep = ({
  schoolId,
  onAuthSuccess,
}: {
  schoolId: string;
  onAuthSuccess: () => void;
}) => {
  const { signupRequestOtp, signupVerifyOtp } = useAuth();

  const [step, setStep] = useState<"input" | "otp">("input");
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    otp: "",
  });

  const handleRequestOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = (await signupRequestOtp({
        name: form.name.trim(),
        phone: form.phone.trim(), // 👈 important
        email: form.email.trim(),
        school_id: schoolId,
      })) as SignupOtpResponse;

      if (res?.dev_otp) {
        setDevOtp(res.dev_otp);
      }

      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      await signupVerifyOtp({
        phone: form.phone.trim(),
        otp: form.otp.trim(),
      });

      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {step === "input" ? "Create your account" : "Verify OTP"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === "input" ? (
          <>
            <Input
              placeholder="Full name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <Input
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <Input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            {error && (
              <p className="text-sm text-red-600 text-center">
                {error}
              </p>
            )}

            <Button
              className="w-full"
              onClick={handleRequestOtp}
              disabled={
                loading ||
                !form.name ||
                !form.phone ||
                !form.email
              }
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </>
        ) : (
          <>
            <OtpVerifyForm
              otp={form.otp}
              loading={loading}
              devOtp={devOtp}
              onChange={(otp) =>
                setForm({ ...form, otp })
              }
              onSubmit={handleVerifyOtp}
            />

            {error && (
              <p className="text-sm text-red-600 text-center">
                {error}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
