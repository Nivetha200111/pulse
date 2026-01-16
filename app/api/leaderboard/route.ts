import { getLeaderboard, getTotalTests } from "@/lib/db/kv";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statsOnly = searchParams.get("stats") === "1";
  const totalTests = await getTotalTests();

  if (statsOnly) {
    return Response.json({ totalTests });
  }

  const entries = await getLeaderboard();
  return Response.json({ entries, totalTests });
}
