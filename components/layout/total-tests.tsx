"use client";

import { useEffect, useState } from "react";

export function TotalTests() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/leaderboard?stats=1", {
          cache: "no-store",
        });
        const data = (await response.json()) as { totalTests?: number };
        setTotal(data.totalTests ?? null);
      } catch {
        setTotal(null);
      }
    };
    load();
  }, []);

  return (
    <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
      {total !== null ? `${total.toLocaleString()} tests run` : "Loading test count"}
    </p>
  );
}
