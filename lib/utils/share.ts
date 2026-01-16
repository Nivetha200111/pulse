import type { SpeedTestResult } from "@/types/speed-test";

export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

export function buildInvoiceOgUrl(result: SpeedTestResult) {
  const url = new URL("/api/og/invoice", getBaseUrl());
  url.searchParams.set("isp", result.isp);
  url.searchParams.set("plan", result.planName);
  url.searchParams.set("promised", result.promisedSpeed.toString());
  url.searchParams.set("actual", result.downloadSpeed.toString());
  url.searchParams.set("score", result.serviceScore.toString());
  url.searchParams.set("grade", result.grade);
  url.searchParams.set("owed", result.moneyOwed.toString());
  return url.toString();
}

export function buildShareText(result: SpeedTestResult) {
  return `My ${result.isp} scored ${result.serviceScore}/100 on Pulse ⚡\n\nPromised: ${result.promisedSpeed} Mbps\nDelivered: ${result.downloadSpeed} Mbps\nMoney Owed: ₹${result.moneyOwed}\n\nThey promised. @pulse_app measured.`;
}
