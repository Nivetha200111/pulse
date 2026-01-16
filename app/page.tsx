import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TotalTests } from "@/components/layout/total-tests";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { IspPlanForm } from "@/components/forms/isp-plan-form";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-20 pt-6 md:px-12">
        <section className="grid gap-12 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]">
              Pulse ISP Audit System
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              Calculate what your ISP owes you.
            </h1>
            <p className="text-lg text-[var(--text-secondary)] md:text-xl">
              Launch a 20-second real-time audit, expose underdelivered speeds,
              and generate a shareable invoice that puts ISPs on blast.
            </p>
            <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
              <span className="rounded-full border border-[rgba(0,240,255,0.4)] px-4 py-2 text-[var(--neon-cyan)]">
                Live Speed Test
              </span>
              <span className="rounded-full border border-[rgba(255,0,170,0.4)] px-4 py-2 text-[var(--neon-pink)]">
                Viral Invoice
              </span>
              <span className="rounded-full border border-[rgba(0,255,136,0.4)] px-4 py-2 text-[var(--neon-green)]">
                City Rankings
              </span>
            </div>
          </div>
          <Card className="space-y-6">
            <CardTitle>Start audit</CardTitle>
            <IspPlanForm />
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardTitle>Rage bait</CardTitle>
            <CardValue>“Jio owes me ₹847”</CardValue>
          </Card>
          <Card>
            <CardTitle>Shareable proof</CardTitle>
            <CardValue>Instant invoice PNG</CardValue>
          </Card>
          <Card>
            <CardTitle>City wars</CardTitle>
            <CardValue>#1 Bengaluru ACT 72/100</CardValue>
          </Card>
        </section>

        <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.08)] pt-8">
          <TotalTests />
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
            Built for viral sharing
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
