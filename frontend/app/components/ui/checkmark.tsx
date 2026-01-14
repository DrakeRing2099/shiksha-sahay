'use client';

import { Check } from 'lucide-react';

type CheckmarkProps = {
  checked?: boolean;
};

export function Checkmark({ checked = false }: CheckmarkProps) {
  return (
    <span
      aria-hidden
      className={[
        'flex h-6 w-6 items-center justify-center rounded-full border transition',
        checked
          ? 'border-[#2563EB] bg-[#2563EB]'
          : 'border-[#D1D5DB] bg-white',
      ].join(' ')}
    >
      {checked && <Check className="h-4 w-4 text-white" />}
    </span>
  );
}
