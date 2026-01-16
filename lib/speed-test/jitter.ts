export function calculateJitter(samples: number[]) {
  if (samples.length === 0) return 0;
  const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
  const variance =
    samples.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    samples.length;
  return Math.round(Math.sqrt(variance));
}
