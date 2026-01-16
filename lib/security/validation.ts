import type { SpeedTestResult } from "@/types/speed-test";

/**
 * Sanitize strings to prevent injection attacks
 */
export function sanitizeString(input: string, maxLength: number = 100): string {
  // Remove control characters and limit length
  return input
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .replace(/[<>]/g, "") // Remove angle brackets (XSS prevention)
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize Redis key components to prevent key injection
 */
export function sanitizeRedisKey(input: string): string {
  // Remove colons and other special characters that could break key structure
  return input
    .replace(/[:*?[\]]/g, "_") // Replace special Redis chars with underscore
    .replace(/\s+/g, "_") // Replace whitespace with underscore
    .slice(0, 50); // Limit length
}

/**
 * Validate speed test result payload
 */
export function validateSpeedTestResult(
  payload: unknown
): { valid: boolean; result?: SpeedTestResult; error?: string } {
  if (!payload || typeof payload !== "object") {
    return { valid: false, error: "Invalid payload type" };
  }

  const data = payload as Record<string, unknown>;

  // Required fields
  if (!data.id || typeof data.id !== "string" || data.id.length > 100) {
    return { valid: false, error: "Invalid or missing id" };
  }

  if (!data.timestamp || typeof data.timestamp !== "string") {
    return { valid: false, error: "Invalid or missing timestamp" };
  }

  if (!data.isp || typeof data.isp !== "string" || data.isp.length > 100) {
    return { valid: false, error: "Invalid or missing isp" };
  }

  if (!data.planName || typeof data.planName !== "string" || data.planName.length > 200) {
    return { valid: false, error: "Invalid or missing planName" };
  }

  if (
    !data.grade ||
    typeof data.grade !== "string" ||
    !["A+", "A", "B", "C", "D", "F"].includes(data.grade)
  ) {
    return { valid: false, error: "Invalid or missing grade" };
  }

  // Numeric validations
  const numericFields = [
    "promisedSpeed",
    "monthlyPrice",
    "downloadSpeed",
    "uploadSpeed",
    "latency",
    "jitter",
    "packetLoss",
    "serviceScore",
    "moneyOwed",
    "deliveryRatio",
  ];

  for (const field of numericFields) {
    const value = data[field];
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      return { valid: false, error: `Invalid ${field}` };
    }

    // Sanity checks on values
    if (field === "serviceScore" && (value < 0 || value > 100)) {
      return { valid: false, error: "Service score must be 0-100" };
    }
    if (field === "packetLoss" && (value < 0 || value > 100)) {
      return { valid: false, error: "Packet loss must be 0-100" };
    }
    if (field === "deliveryRatio" && (value < 0 || value > 1)) {
      return { valid: false, error: "Delivery ratio out of range" };
    }
    if ((field === "downloadSpeed" || field === "uploadSpeed" || field === "promisedSpeed") && value > 100000) {
      return { valid: false, error: "Speed value unrealistic" };
    }
    if (field === "latency" && value > 10000) {
      return { valid: false, error: "Latency value unrealistic" };
    }
  }

  // Optional city field
  const city = data.city ? sanitizeString(String(data.city), 100) : undefined;

  // Construct validated result
  const result: SpeedTestResult = {
    id: sanitizeString(data.id as string, 100),
    timestamp: data.timestamp as string,
    isp: sanitizeString(data.isp as string, 100),
    planName: sanitizeString(data.planName as string, 200),
    promisedSpeed: data.promisedSpeed as number,
    monthlyPrice: data.monthlyPrice as number,
    downloadSpeed: data.downloadSpeed as number,
    uploadSpeed: data.uploadSpeed as number,
    latency: data.latency as number,
    jitter: data.jitter as number,
    packetLoss: data.packetLoss as number,
    serviceScore: data.serviceScore as number,
    grade: data.grade as "A+" | "A" | "B" | "C" | "D" | "F",
    moneyOwed: data.moneyOwed as number,
    deliveryRatio: data.deliveryRatio as number,
    city,
  };

  return { valid: true, result };
}

/**
 * Validate request size
 */
export function validateRequestSize(
  contentLength: string | null,
  maxSize: number = 10 * 1024 * 1024 // 10MB default
): boolean {
  if (!contentLength) return true; // No content-length header
  const size = parseInt(contentLength, 10);
  return !isNaN(size) && size <= maxSize;
}
