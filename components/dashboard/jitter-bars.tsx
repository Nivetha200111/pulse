interface JitterBarsProps {
  value: number;
}

export function JitterBars({ value }: JitterBarsProps) {
  const level = Math.min(5, Math.max(1, Math.ceil(value / 8)));
  return (
    <div className="flex items-end gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const active = index < level;
        return (
          <div
            key={`jitter-${index}`}
            className="w-2 rounded-full transition-all"
            style={{
              height: `${8 + index * 6}px`,
              backgroundColor: active
                ? "var(--neon-yellow)"
                : "rgba(255,255,255,0.12)",
              boxShadow: active
                ? "0 0 12px rgba(255,204,0,0.6)"
                : "none",
            }}
          />
        );
      })}
    </div>
  );
}
