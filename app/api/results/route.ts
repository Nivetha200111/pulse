import { saveResult } from "@/lib/db/kv";
import { rateLimit, getClientIdentifier } from "@/lib/security/rate-limit";
import { validateSpeedTestResult, validateRequestSize } from "@/lib/security/validation";

export async function POST(request: Request) {
  // Rate limiting: 5 results per minute per IP
  const identifier = getClientIdentifier(request);
  const rateLimitResult = await rateLimit(identifier, {
    interval: 60,
    maxRequests: 5,
  });

  if (!rateLimitResult.success) {
    return Response.json(
      { error: "Too many requests. Please wait before submitting another result." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Validate request size (max 1MB for result payload)
  const contentLength = request.headers.get("content-length");
  if (!validateRequestSize(contentLength, 1024 * 1024)) {
    return Response.json({ error: "Request too large" }, { status: 413 });
  }

  // Parse and validate payload
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = validateSpeedTestResult(payload);
  if (!validation.valid || !validation.result) {
    return Response.json(
      { error: validation.error ?? "Invalid result payload" },
      { status: 400 }
    );
  }

  // Save validated result
  try {
    const saved = await saveResult(validation.result);

    return Response.json(
      {
        id: saved.id,
        shareUrl: `/results/${saved.id}`,
        serviceScore: saved.serviceScore,
        grade: saved.grade,
        moneyOwed: saved.moneyOwed,
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
      }
    );
  } catch (error) {
    console.error("Error saving result:", error);
    return Response.json(
      { error: "Failed to save result" },
      { status: 500 }
    );
  }
}
