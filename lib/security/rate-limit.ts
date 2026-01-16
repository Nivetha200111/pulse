import { kv } from "@vercel/kv";

interface RateLimitConfig {
  interval: number; // Time window in seconds
  maxRequests: number; // Max requests in the window
}

const memoryLimits = new Map<string, { count: number; resetAt: number }>();

function hasKV() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = { interval: 60, maxRequests: 10 }
): Promise<{ success: boolean; remaining: number }> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();

  if (hasKV()) {
    // Use Redis for rate limiting in production
    const count = await kv.incr(key);
    if (count === 1) {
      // First request, set expiration
      await kv.expire(key, config.interval);
    }

    const remaining = Math.max(0, config.maxRequests - count);
    return {
      success: count <= config.maxRequests,
      remaining,
    };
  } else {
    // Fallback to memory for local development
    const limit = memoryLimits.get(key);
    const resetAt = limit?.resetAt ?? now + config.interval * 1000;

    if (!limit || now > limit.resetAt) {
      memoryLimits.set(key, { count: 1, resetAt });
      return { success: true, remaining: config.maxRequests - 1 };
    }

    limit.count++;
    memoryLimits.set(key, limit);
    const remaining = Math.max(0, config.maxRequests - limit.count);

    return {
      success: limit.count <= config.maxRequests,
      remaining,
    };
  }
}

export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (Vercel provides these)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] ?? realIp ?? "unknown";

  // Use IP as identifier
  return ip;
}
