interface UploadTestOptions {
  durationMs?: number;
  chunkSize?: number;
  onProgress?: (speedMbps: number) => void;
}

function makePayload(size: number) {
  const buffer = new Uint8Array(size);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(buffer);
  } else {
    for (let i = 0; i < buffer.length; i += 1) {
      buffer[i] = Math.floor(Math.random() * 255);
    }
  }
  return buffer;
}

export async function runUploadTest({
  durationMs = 3000,
  chunkSize = 512 * 1024,
  onProgress,
}: UploadTestOptions) {
  const payload = makePayload(chunkSize);
  const start = performance.now();
  let totalBytes = 0;

  const timer = window.setInterval(() => {
    const elapsed = performance.now() - start;
    const mbps = elapsed > 0 ? (totalBytes * 8) / (elapsed / 1000) / 1e6 : 0;
    onProgress?.(mbps);
  }, 100);

  while (performance.now() - start < durationMs) {
    try {
      const response = await fetch("/api/speed-test/upload", {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: payload,
      });
      const data = (await response.json()) as { received: number };
      totalBytes += data.received ?? payload.byteLength;
    } catch {
      // Ignore failed uploads to keep the loop going.
    }
  }

  window.clearInterval(timer);

  const duration = performance.now() - start;
  const speedMbps = duration > 0 ? (totalBytes * 8) / (duration / 1000) / 1e6 : 0;

  return { speedMbps: Number(speedMbps.toFixed(2)), bytes: totalBytes, duration };
}
