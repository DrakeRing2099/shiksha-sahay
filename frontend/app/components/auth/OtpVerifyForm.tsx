"use client";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

type Props = {
  otp: string;
  loading: boolean;
  devOtp?: string | null;
  onChange: (otp: string) => void;
  onSubmit: () => void;
};

export const OtpVerifyForm = ({
  otp,
  loading,
  devOtp,
  onChange,
  onSubmit,
}: Props) => {
  return (
    <div className="space-y-4">
      <Input
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChange={(e) => onChange(e.target.value)}
        className="text-center tracking-widest"
      />

      {devOtp && (
        <p className="text-sm text-center text-gray-500">
          Dev OTP: <span className="font-mono">{devOtp}</span>
        </p>
      )}

      <Button
        className="w-full"
        onClick={onSubmit}
        disabled={loading || !otp}
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </Button>
    </div>
  );
};
