"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { SpeedGauge } from "@/components/dashboard/speed-gauge";
import { LiveGraph } from "@/components/dashboard/live-graph";
import { JitterBars } from "@/components/dashboard/jitter-bars";
import { LatencyPulse } from "@/components/dashboard/latency-pulse";
import { PacketLoss } from "@/components/dashboard/packet-loss";
import { Progress } from "@/components/ui/progress";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { useSpeedTest } from "@/hooks/use-speed-test";
import { getISPById, getPlanById } from "@/lib/data/isps";

export default function TestPage() {
  const router = useRouter();
  const params = useSearchParams();
  const ispId = params.get("isp") ?? "";
  const planId = params.get("plan") ?? "";
  const savedRef = useRef(false);
  const startedRef = useRef(false);

  const {
    phase,
    phaseLabel,
    progress,
    downloadSpeed,
    uploadSpeed,
    latency,
    jitter,
    packetLoss,
    graphData,
    result,
    error,
    runTest,
  } = useSpeedTest();

  const isp = getISPById(ispId);
  const plan = planId ? getPlanById(ispId, planId) : undefined;

  useEffect(() => {
    if (!ispId || !planId) return;
    if (startedRef.current) return;
    startedRef.current = true;
    runTest({ ispId, planId });
  }, [ispId, planId, runTest]);

  useEffect(() => {
    if (!result || phase !== "completed" || savedRef.current) return;
    savedRef.current = true;
    const save = async () => {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      const data = (await response.json()) as { id: string };
      router.push(`/results/${data.id}`);
    };
    save();
  }, [phase, result, router]);

  return (
    <div className="min-h-screen pb-16">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]">
            Live Audit
          </p>
          <h1 className="text-3xl font-semibold md:text-5xl">
            {isp?.name ?? "Selecting ISP"} — {plan?.name ?? "Choose a plan"}
          </h1>
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)]">
            Phase: {phaseLabel}
          </p>
          <Progress value={progress} />
          {error && (
            <p className="text-sm text-[var(--neon-red)]">{error}</p>
          )}
        </motion.div>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <Card className="flex flex-col items-center justify-center gap-6">
            <SpeedGauge value={downloadSpeed} />
            <div className="grid w-full gap-6 md:grid-cols-3">
              <div>
                <CardTitle>Upload</CardTitle>
                <CardValue>{uploadSpeed.toFixed(1)} Mbps</CardValue>
              </div>
              <div>
                <CardTitle>Latency</CardTitle>
                <CardValue>{latency} ms</CardValue>
              </div>
              <div>
                <CardTitle>Jitter</CardTitle>
                <CardValue>{jitter} ms</CardValue>
              </div>
            </div>
          </Card>
          <Card className="space-y-6">
            <CardTitle>Live throughput</CardTitle>
            <LiveGraph data={graphData} />
            <div className="grid gap-6 md:grid-cols-2">
              <LatencyPulse value={latency} />
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
                  Jitter
                </p>
                <JitterBars value={jitter} />
              </div>
              <PacketLoss value={packetLoss} />
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
