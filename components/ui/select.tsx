import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full appearance-none rounded-xl border border-[rgba(255,255,255,0.16)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-white shadow-[0_0_18px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-2 focus:ring-[var(--neon-cyan)]",
        className
      )}
      {...props}
    />
  );
}
