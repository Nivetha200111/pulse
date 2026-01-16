import { useCallback, useMemo, useState } from "react";
import { calculateMoneyOwed } from "@/lib/calculations/money-owed";
import { gradeFromScore } from "@/lib/calculations/grade";
import { calculateServiceScore } from "@/lib/calculations/service-score";
import { getISPById, getPlanById } from "@/lib/data/isps";
import { runDownloadTest } from "@/lib/speed-test/download";
import { runLatencyTest } from "@/lib/speed-test/latency";
import { runUploadTest } from "@/lib/speed-test/upload";
import type { SpeedTestResult } from "@/types/speed-test";

export type TestPhase =
  | "idle"
  | "latency"
  | "download"
  | "upload"
  | "calculating"
  | "completed"
  | "error";

interface GraphPoint {
  time: number;
  speed: number;
}

interface RunOptions {
  ispId: string;
  planId: string;
  city?: string;
}

export function useSpeedTest() {
  const [phase, setPhase] = useState<TestPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [latency, setLatency] = useState(0);
  const [jitter, setJitter] = useState(0);
  const [packetLoss, setPacketLoss] = useState(0);
  const [graphData, setGraphData] = useState<GraphPoint[]>([]);
  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhase("idle");
    setProgress(0);
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setLatency(0);
    setJitter(0);
    setPacketLoss(0);
    setGraphData([]);
    setResult(null);
    setError(null);
  }, []);

  const runTest = useCallback(
    async ({ ispId, planId, city }: RunOptions) => {
      const isp = getISPById(ispId);
      const plan = getPlanById(ispId, planId);
      if (!isp || !plan) {
        setError("Missing ISP or plan selection.");
        setPhase("error");
        return null;
      }

      setError(null);
      setProgress(0);
      setPhase("latency");

      try {
        const latencyResults = await runLatencyTest({});
        setLatency(latencyResults.latency);
        setJitter(latencyResults.jitter);
        setPacketLoss(latencyResults.packetLoss);
        setProgress(25);

        setPhase("download");
        const downloadResults = await runDownloadTest({
          onProgress: (speedMbps) => {
            setDownloadSpeed(speedMbps);
            setGraphData((prev) => [
              ...prev.slice(-60),
              { time: Date.now(), speed: speedMbps },
            ]);
          },
        });
        setDownloadSpeed(downloadResults.speedMbps);
        setProgress(60);

        setPhase("upload");
        const uploadResults = await runUploadTest({
          onProgress: (speedMbps) => setUploadSpeed(speedMbps),
        });
        setUploadSpeed(uploadResults.speedMbps);
        setProgress(85);

        setPhase("calculating");
        const serviceScore = calculateServiceScore({
          actualSpeed: downloadResults.speedMbps,
          promisedSpeed: plan.speed,
          jitter: latencyResults.jitter,
          packetLoss: latencyResults.packetLoss,
          latency: latencyResults.latency,
        });
        const grade = gradeFromScore(serviceScore);
        const moneyOwed = calculateMoneyOwed({
          actualSpeed: downloadResults.speedMbps,
          promisedSpeed: plan.speed,
          monthlyPrice: plan.price,
        });
        const deliveryRatio = Math.min(
          1,
          downloadResults.speedMbps / plan.speed
        );

        const draftResult: SpeedTestResult = {
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          timestamp: new Date().toISOString(),
          isp: isp.name,
          planName: plan.name,
          promisedSpeed: plan.speed,
          monthlyPrice: plan.price,
          downloadSpeed: downloadResults.speedMbps,
          uploadSpeed: uploadResults.speedMbps,
          latency: latencyResults.latency,
          jitter: latencyResults.jitter,
          packetLoss: latencyResults.packetLoss,
          serviceScore,
          grade,
          moneyOwed,
          deliveryRatio,
          city,
        };

        setResult(draftResult);
        setProgress(100);
        setPhase("completed");
        return draftResult;
      } catch (err) {
        console.error("Speed test error:", err);
        setError(
          err instanceof Error
            ? `Test failed: ${err.message}`
            : "Test failed. Please retry."
        );
        setPhase("error");
        return null;
      }
    },
    []
  );

  const phaseLabel = useMemo(() => {
    switch (phase) {
      case "latency":
        return "Latency Sweep";
      case "download":
        return "Download Burst";
      case "upload":
        return "Upload Burst";
      case "calculating":
        return "Compiling Invoice";
      case "completed":
        return "Audit Complete";
      case "error":
        return "Audit Failed";
      default:
        return "Ready";
    }
  }, [phase]);

  return {
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
    reset,
  };
}
