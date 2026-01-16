export function formatMbps(value: number) {
  return `${value.toFixed(1)} Mbps`;
}

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value: number) {
  return `${Math.round(value)}%`;
}
