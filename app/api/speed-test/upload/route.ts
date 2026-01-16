export const runtime = "edge";

export async function POST(request: Request) {
  const start = Date.now();
  const buffer = await request.arrayBuffer();
  const duration = Date.now() - start;

  return Response.json(
    { received: buffer.byteLength, duration },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}
