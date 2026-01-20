"use client";

type Props = {
  data: {
    name: string;
    phone: string;
    email: string;
  };
  loading: boolean;
  onChange: (data: any) => void;
  onSubmit: () => void;
};

export const AuthInputForm = ({
  data,
  loading,
  onChange,
  onSubmit,
}: Props) => {
  return (
    <>
      <input
        placeholder="Name (only for signup)"
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        className="w-full h-12 border rounded-lg px-4"
      />

      <input
        placeholder="Phone"
        value={data.phone}
        onChange={(e) => onChange({ ...data, phone: e.target.value })}
        className="w-full h-12 border rounded-lg px-4"
      />

      <input
        placeholder="Email (signup only)"
        value={data.email}
        onChange={(e) => onChange({ ...data, email: e.target.value })}
        className="w-full h-12 border rounded-lg px-4"
      />

      <button
        onClick={onSubmit}
        disabled={loading || !data.phone}
        className="w-full h-12 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Sending OTP..." : "Continue"}
      </button>
    </>
  );
};
