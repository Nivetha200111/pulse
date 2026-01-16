import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "good" | "warn" | "bad" | "neutral";
}

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  good: "border-[rgba(0,255,136,0.6)] text-[var(--neon-green)]",
  warn: "border-[rgba(255,204,0,0.6)] text-[var(--neon-yellow)]",
  bad: "border-[rgba(255,51,102,0.6)] text-[var(--neon-red)]",
  neutral: "border-[rgba(255,255,255,0.25)] text-white",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-[0.25em]",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
