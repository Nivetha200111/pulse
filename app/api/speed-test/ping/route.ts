import { getClientIdentifier, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "edge";

export async function GET(request: Request) {
  const identifier = `${getClientIdentifier(request)}:ping`;
  const limit = await rateLimit(identifier, { interval: 60, maxRequests: 180 });
  if (!limit.success) {
    return Response.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return Response.json(
    { pong: true, serverTime: new Date().toISOString() },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    }
  );
}
