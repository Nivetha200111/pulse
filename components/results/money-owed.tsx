import { formatINR } from "@/lib/utils/format";

interface MoneyOwedProps {
  ispName: string;
  amount: number;
}

export function MoneyOwed({ ispName, amount }: MoneyOwedProps) {
  return (
    <div className="space-y-3 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]">
        Your {ispName} owes you
      </p>
      <p className="text-5xl font-semibold text-glow-pink tabular-nums">
        {formatINR(amount)}
      </p>
      <p className="text-sm text-[var(--text-secondary)]">
        This month alone.
      </p>
    </div>
  );
}
