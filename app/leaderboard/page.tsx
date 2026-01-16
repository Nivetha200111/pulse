import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { getLeaderboard } from "@/lib/db/kv";

export default async function LeaderboardPage() {
  const entries = await getLeaderboard();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-20 pt-6 md:px-12">
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]">
            City Rankings
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">
            Who delivers the speeds they promised?
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Aggregated results from anonymous tests across Indian cities.
          </p>
        </section>

        <Card>
          <LeaderboardTable entries={entries} />
        </Card>

        <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.08)] pt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
            Think your city deserves better?
          </p>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.3em] text-[var(--neon-cyan)]"
          >
            Test your connection
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
