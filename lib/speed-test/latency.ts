import { calculateJitter } from "@/lib/speed-test/jitter";

interface LatencyTestOptions {
  pings?: number;
  timeoutMs?: number;
}

export async function runLatencyTest({
  pings = 20,
  timeoutMs = 1500,
}: LatencyTestOptions) {
  const timings: number[] = [];
  let failures = 0;

  for (let i = 0; i < pings; i += 1) {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
      await fetch("/api/speed-test/ping", {
        cache: "no-store",
        signal: controller.signal,
      });
      window.clearTimeout(timeout);
      timings.push(performance.now() - start);
    } catch {
      failures += 1;
    }
  }

  const average =
    timings.length > 0
      ? timings.reduce((sum, value) => sum + value, 0) / timings.length
      : timeoutMs;
  const jitter = calculateJitter(timings);
  const packetLoss = Math.round((failures / pings) * 100);

  return {
    latency: Math.round(average),
    jitter,
    packetLoss,
  };
}
