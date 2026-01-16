export interface SpeedTestResult {
  id: string;
  timestamp: string;
  isp: string;
  planName: string;
  promisedSpeed: number;
  monthlyPrice: number;
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  jitter: number;
  packetLoss: number;
  serviceScore: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  moneyOwed: number;
  deliveryRatio: number;
  city?: string;
}
