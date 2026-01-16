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
              Run a 20-second speed test and compare your actual speeds against
              what you are paying for.
            </p>
            <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
              <span className="rounded-full border border-[rgba(0,240,255,0.4)] px-4 py-2 text-[var(--neon-cyan)]">
                Speed Test
              </span>
              <span className="rounded-full border border-[rgba(255,0,170,0.4)] px-4 py-2 text-[var(--neon-pink)]">
                Invoice
              </span>
              <span className="rounded-full border border-[rgba(0,255,136,0.4)] px-4 py-2 text-[var(--neon-green)]">
                Rankings
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
            <CardTitle>Accountability</CardTitle>
            <CardValue>Track what you are owed</CardValue>
          </Card>
          <Card>
            <CardTitle>Share results</CardTitle>
            <CardValue>Generate invoice PNG</CardValue>
          </Card>
          <Card>
            <CardTitle>City rankings</CardTitle>
            <CardValue>Compare ISPs in your area</CardValue>
          </Card>
        </section>

        <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.08)] pt-8">
          <TotalTests />
        </div>
      </main>
      <Footer />
    </div>
  );
}
