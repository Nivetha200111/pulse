export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = Math.min(
    2 * 1024 * 1024,
    Math.max(1024, Number(searchParams.get("size") ?? 1024 * 1024))
  );
  const buffer = new Uint8Array(size);
  crypto.getRandomValues(buffer);
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
