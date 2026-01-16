interface PacketLossProps {
  value: number;
}

export function PacketLoss({ value }: PacketLossProps) {
  const severity =
    value >= 20 ? "var(--neon-red)" : value >= 10 ? "var(--neon-yellow)" : "var(--neon-green)";
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
        Packet Loss
      </p>
      <div className="h-2 w-full rounded-full bg-[var(--bg-tertiary)]">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${Math.min(100, value)}%`,
            backgroundColor: severity,
            boxShadow: `0 0 12px ${severity}`,
          }}
        />
      </div>
      <p className="text-sm tabular-nums">{value}%</p>
    </div>
  );
}
