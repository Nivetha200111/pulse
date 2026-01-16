export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = Math.min(
    2 * 1024 * 1024,
    Math.max(1024, Number(searchParams.get("size") ?? 1024 * 1024))
  );

  // Generate random data in smaller chunks to avoid edge runtime limitations
  const chunkSize = 65536; // 64KB chunks
  const chunks: Uint8Array[] = [];
  let remaining = size;

  while (remaining > 0) {
    const currentChunkSize = Math.min(chunkSize, remaining);
    const chunk = new Uint8Array(currentChunkSize);
    crypto.getRandomValues(chunk);
    chunks.push(chunk);
    remaining -= currentChunkSize;
  }

  // Combine chunks
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Content-Length": String(size),
    },
  });
}
