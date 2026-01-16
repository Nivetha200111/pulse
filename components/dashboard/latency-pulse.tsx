interface LatencyPulseProps {
  value: number;
}

export function LatencyPulse({ value }: LatencyPulseProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10">
        <span className="absolute inset-0 rounded-full bg-[rgba(0,240,255,0.3)] animate-ping" />
        <span className="absolute inset-2 rounded-full bg-[var(--neon-cyan)] shadow-[0_0_16px_rgba(0,240,255,0.8)]" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
          Latency
        </p>
        <p className="text-lg font-semibold tabular-nums">{value} ms</p>
      </div>
    </div>
  );
}
