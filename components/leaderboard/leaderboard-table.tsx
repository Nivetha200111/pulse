"use client";

import { useMemo, useState } from "react";
import type { LeaderboardEntry } from "@/types/leaderboard";
import { Select } from "@/components/ui/select";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const [filter, setFilter] = useState("all");
  const isps = useMemo(() => {
    return Array.from(new Set(entries.map((entry) => entry.isp))).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    if (filter === "all") return entries;
    return entries.filter((entry) => entry.isp === filter);
  }, [entries, filter]);

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        <Select value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">All ISPs</option>
          {isps.map((isp) => (
            <option key={isp} value={isp}>
              {isp}
            </option>
          ))}
        </Select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--bg-secondary)] text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
            <tr>
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">City</th>
              <th className="px-6 py-4">Best ISP</th>
              <th className="px-6 py-4">Avg Score</th>
              <th className="px-6 py-4">Total Tests</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, index) => (
              <tr
                key={`${entry.city}-${entry.isp}`}
                className="border-t border-[rgba(255,255,255,0.06)]"
              >
                <td className="px-6 py-4 tabular-nums">{index + 1}</td>
                <td className="px-6 py-4">{entry.city}</td>
                <td className="px-6 py-4">{entry.isp}</td>
                <td className="px-6 py-4 tabular-nums">
                  {entry.averageScore}/100
                </td>
                <td className="px-6 py-4 tabular-nums">
                  {entry.totalTests}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
