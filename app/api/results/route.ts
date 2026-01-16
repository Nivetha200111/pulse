import { saveResult } from "@/lib/db/kv";
import type { SpeedTestResult } from "@/types/speed-test";

export async function POST(request: Request) {
  const payload = (await request.json()) as SpeedTestResult;

  if (!payload || !payload.id) {
    return Response.json({ error: "Invalid result payload" }, { status: 400 });
  }

  const saved = await saveResult(payload);

  return Response.json({
    id: saved.id,
    shareUrl: `/results/${saved.id}`,
    serviceScore: saved.serviceScore,
    grade: saved.grade,
    moneyOwed: saved.moneyOwed,
  });
}
