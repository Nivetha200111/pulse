import { getClientIdentifier, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "edge";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB max

export async function POST(request: Request) {
  const identifier = `${getClientIdentifier(request)}:upload`;
  const limit = await rateLimit(identifier, { interval: 60, maxRequests: 120 });
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

  // Validate content length
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (isNaN(size) || size > MAX_UPLOAD_SIZE) {
      return Response.json(
        { error: "Upload too large" },
        { status: 413 }
      );
    }
  }

  const start = Date.now();

  let buffer: ArrayBuffer;
  try {
    buffer = await request.arrayBuffer();

    // Double-check actual size
    if (buffer.byteLength > MAX_UPLOAD_SIZE) {
      return Response.json(
        { error: "Upload too large" },
        { status: 413 }
      );
    }
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const duration = Date.now() - start;

  return Response.json(
    { received: buffer.byteLength, duration },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    }
  );
}
