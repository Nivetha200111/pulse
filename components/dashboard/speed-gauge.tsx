"use client";

import { motion } from "framer-motion";

interface SpeedGaugeProps {
  value: number;
  max?: number;
  label?: string;
}

export function SpeedGauge({ value, max = 1000, label }: SpeedGaugeProps) {
  const ratio = Math.min(1, value / max);
  const rotation = ratio * 180 - 90;

  return (
    <div className="relative flex h-64 w-64 flex-col items-center justify-end">
      <div className="absolute inset-0 rounded-full border border-[rgba(255,255,255,0.15)] bg-[var(--bg-secondary)] shadow-[inset_0_0_40px_rgba(0,0,0,0.4)]" />
      <div className="absolute inset-3 rounded-full border border-[rgba(0,240,255,0.25)]" />
      <div className="absolute inset-6 rounded-full border border-[rgba(255,0,170,0.2)]" />
      <motion.div
        className="absolute bottom-12 h-24 w-1 origin-bottom rounded-full bg-[var(--neon-cyan)] shadow-[0_0_20px_rgba(0,240,255,0.7)]"
        animate={{ rotate: rotation }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
      />
      <div className="absolute bottom-6 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-[var(--text-muted)]">
          {label ?? "Download"}
        </p>
        <p className="mt-2 text-3xl font-semibold tabular-nums">
          {value.toFixed(1)}
        </p>
        <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-secondary)]">
          Mbps
        </p>
      </div>
    </div>
  );
}
