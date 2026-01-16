export const runtime = "edge";

const MAX_DOWNLOAD_SIZE = 2 * 1024 * 1024; // 2MB max
const MIN_DOWNLOAD_SIZE = 1024; // 1KB min

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Validate and sanitize size parameter
  const sizeParam = searchParams.get("size");
  const requestedSize = sizeParam ? Number(sizeParam) : 1024 * 1024;

  // Reject invalid or malicious values
  if (!Number.isFinite(requestedSize) || requestedSize < 0) {
    return Response.json(
      { error: "Invalid size parameter" },
      { status: 400 }
    );
  }

  const size = Math.min(
    MAX_DOWNLOAD_SIZE,
    Math.max(MIN_DOWNLOAD_SIZE, requestedSize)
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
