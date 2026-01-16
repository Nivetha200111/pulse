export const runtime = "edge";

export async function GET() {
  return Response.json(
    { pong: true, serverTime: new Date().toISOString() },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}
