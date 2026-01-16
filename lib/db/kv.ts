import { kv } from "@vercel/kv";
import type { SpeedTestResult } from "@/types/speed-test";
import type { LeaderboardEntry } from "@/types/leaderboard";
import { getRandomCity } from "@/lib/data/cities";
import { sanitizeRedisKey } from "@/lib/security/validation";

const memoryStore = new Map<
  string,
  { value: unknown; expiresAt?: number }
>();

function hasKV() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function getMemoryValue<T>(key: string): T | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value as T;
}

async function kvGet<T>(key: string): Promise<T | null> {
  if (hasKV()) {
    return (await kv.get<T>(key)) ?? null;
  }
  return getMemoryValue<T>(key);
}

async function kvSet(
  key: string,
  value: unknown,
  { ex }: { ex?: number } = {}
) {
  if (hasKV()) {
    if (ex) {
      await kv.set(key, value, { ex });
    } else {
      await kv.set(key, value);
    }
    return;
  }
  const expiresAt = ex ? Date.now() + ex * 1000 : undefined;
  memoryStore.set(key, { value, expiresAt });
}

async function kvIncr(key: string) {
  if (hasKV()) {
    return kv.incr(key);
  }
  const current = (getMemoryValue<number>(key) ?? 0) + 1;
  await kvSet(key, current);
  return current;
}

export async function saveResult(result: SpeedTestResult) {
  const enriched: SpeedTestResult = {
    ...result,
    city: result.city ?? getRandomCity(),
  };
  await kvSet(`result:${enriched.id}`, enriched, { ex: 60 * 60 * 24 * 30 });
  await kvIncr("stats:total_tests");
  await updateLeaderboard(enriched.city ?? "Unknown", enriched.isp, enriched.serviceScore);
  return enriched;
}

export async function getResult(id: string) {
  return kvGet<SpeedTestResult>(`result:${id}`);
}

export async function updateLeaderboard(
  city: string,
  isp: string,
  score: number
) {
  // Sanitize inputs to prevent Redis key injection
  const sanitizedCity = sanitizeRedisKey(city);
  const sanitizedIsp = sanitizeRedisKey(isp);
  const key = `leaderboard:${sanitizedCity}:${sanitizedIsp}`;

  const existing =
    (await kvGet<{ totalScore: number; count: number }>(key)) ?? {
      totalScore: 0,
      count: 0,
    };
  const next = {
    totalScore: existing.totalScore + score,
    count: existing.count + 1,
  };
  await kvSet(key, next);
  return next;
}

export async function getLeaderboard() {
  let keys: string[] = [];
  if (hasKV()) {
    keys = await kv.keys("leaderboard:*");
  } else {
    keys = Array.from(memoryStore.keys()).filter((key) =>
      key.startsWith("leaderboard:")
    );
  }
  const entries: LeaderboardEntry[] = [];
  for (const key of keys) {
    const data = await kvGet<{ totalScore: number; count: number }>(key);
    if (!data) continue;
    const [, city, isp] = key.split(":");
    entries.push({
      city,
      isp,
      averageScore: Math.round(data.totalScore / data.count),
      totalTests: data.count,
    });
  }
  return entries.sort((a, b) => b.averageScore - a.averageScore);
}

export async function getTotalTests() {
  return (await kvGet<number>("stats:total_tests")) ?? 0;
}
