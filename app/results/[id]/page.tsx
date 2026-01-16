import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreDisplay } from "@/components/results/score-display";
import { MoneyOwed } from "@/components/results/money-owed";
import { ShareButtons } from "@/components/results/share-buttons";
import { getResult } from "@/lib/db/kv";
import { formatINR, formatMbps } from "@/lib/utils/format";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;
  const result = await getResult(id);

  if (!result) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const shareUrl = `${baseUrl}/results/${result.id}`;
  const rankSeed = Array.from(result.id).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  );
  const cityRank = (rankSeed % 30) + 1;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-20 pt-6 md:px-12">
        <section className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
          <ScoreDisplay score={result.serviceScore} grade={result.grade} />
          <MoneyOwed ispName={result.isp} amount={result.moneyOwed} />
        </section>

        <section className="grid gap-6 md:grid-cols-4">
          <Card>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
              Promised
            </p>
            <p className="mt-3 text-2xl tabular-nums">
              {formatMbps(result.promisedSpeed)}
            </p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
              Delivered
            </p>
            <p className="mt-3 text-2xl tabular-nums">
              {formatMbps(result.downloadSpeed)}
            </p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
              Latency
            </p>
            <p className="mt-3 text-2xl tabular-nums">{result.latency} ms</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
              Jitter / Loss
            </p>
            <p className="mt-3 text-2xl tabular-nums">
              {result.jitter} ms / {result.packetLoss}%
            </p>
          </Card>
        </section>

        <section className="flex justify-center">
          <Card className="flex w-full max-w-xl flex-col justify-between gap-6 text-center">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                Invoice total
              </p>
              <p className="text-4xl font-semibold text-glow-pink tabular-nums">
                {formatINR(result.moneyOwed + 750)}
              </p>
              <Badge tone="warn">Includes damages + hold time</Badge>
            </div>
            <ShareButtons result={result} shareUrl={shareUrl} />
          </Card>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.08)] pt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
            Your city ranks #{cityRank}
          </p>
          <Link
            href="/leaderboard"
            className="text-xs uppercase tracking-[0.3em] text-[var(--neon-cyan)]"
          >
            View leaderboard
          </Link>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]"
          >
            Run another test
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
