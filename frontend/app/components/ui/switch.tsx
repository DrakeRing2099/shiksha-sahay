"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

/**
 * Switch
 * - Tailwind CSS v4 compatible
 * - Uses CSS variables via rgb(var(--...))
 * - Accessible & keyboard friendly
 * - Matches modern mobile (iOS-like) design
 */
export function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        // layout
        "relative inline-flex h-6 w-11 items-center shrink-0 cursor-pointer",
        // shape & clipping
         "rounded-full overflow-hidden",
        // colors
        "border border-[rgb(var(--border))]",
        "data-[state=checked]:bg-[rgb(var(--primary))]",
        "data-[state=unchecked]:bg-[rgb(var(--switch-background))]",
        // animation
        "transition-colors duration-200 ease-in-out",
        // focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]/40",
        // disabled
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          // thumb
          "pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full",
          // style
          "bg-white shadow-md",
          // animation
          "transition-transform duration-200 ease-in-out",
          "data-[state=checked]:translate-x-5",
          "data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}
