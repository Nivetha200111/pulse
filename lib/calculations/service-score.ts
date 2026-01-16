interface ServiceScoreInput {
  actualSpeed: number;
  promisedSpeed: number;
  jitter: number;
  packetLoss: number;
  latency: number;
}

export function calculateServiceScore({
  actualSpeed,
  promisedSpeed,
  jitter,
  packetLoss,
  latency,
}: ServiceScoreInput) {
  const ratio = promisedSpeed > 0 ? actualSpeed / promisedSpeed : 0;
  const speedScore = ratio * 100;
  const jitterPenalty = Math.min(15, jitter * 0.5);
  const lossPenalty = Math.min(20, packetLoss * 3);
  const latencyPenalty = Math.min(10, Math.max(0, latency - 20) * 0.2);
  const score = speedScore - jitterPenalty - lossPenalty - latencyPenalty;
  return Math.max(0, Math.min(100, Math.round(score)));
}
