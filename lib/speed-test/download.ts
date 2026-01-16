interface DownloadTestOptions {
  durationMs?: number;
  parallel?: number;
  chunkSize?: number;
  onProgress?: (speedMbps: number) => void;
}

export async function runDownloadTest({
  durationMs = 5000,
  parallel = 4,
  chunkSize = 1024 * 1024,
  onProgress,
}: DownloadTestOptions) {
  const start = performance.now();
  let totalBytes = 0;

  const timer = window.setInterval(() => {
    const elapsed = performance.now() - start;
    const mbps = elapsed > 0 ? (totalBytes * 8) / (elapsed / 1000) / 1e6 : 0;
    onProgress?.(mbps);
  }, 100);

  const worker = async () => {
    while (performance.now() - start < durationMs) {
      try {
        const response = await fetch(
          `/api/speed-test/download?size=${chunkSize}`,
          { cache: "no-store" }
        );
        if (!response.ok) {
          throw new Error(`Download endpoint returned ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        totalBytes += buffer.byteLength;
      } catch (error) {
        console.error("Download chunk failed:", error);
        // Continue trying other chunks
      }
    }
  };

  await Promise.all(Array.from({ length: parallel }, () => worker()));
  window.clearInterval(timer);

  const duration = performance.now() - start;
  const speedMbps = duration > 0 ? (totalBytes * 8) / (duration / 1000) / 1e6 : 0;

  if (totalBytes === 0) {
    throw new Error("Download test failed - no data received. Check API endpoints.");
  }

  return { speedMbps: Number(speedMbps.toFixed(2)), bytes: totalBytes, duration };
}
