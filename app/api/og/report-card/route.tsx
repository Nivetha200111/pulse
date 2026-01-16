import { ImageResponse } from "@vercel/og";
import { sanitizeString } from "@/lib/security/validation";

export const runtime = "edge";

function clampNumber(
  value: string | null,
  fallback: number,
  min: number,
  max: number
) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isp = sanitizeString(searchParams.get("isp") ?? "ISP", 40);
  const score = clampNumber(searchParams.get("score"), 70, 0, 100);
  const gradeRaw = sanitizeString(searchParams.get("grade") ?? "B", 2);
  const grade = ["A+", "A", "B", "C", "D", "F"].includes(gradeRaw)
    ? gradeRaw
    : "B";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a0a0f, #12121a)",
          color: "white",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 20, color: "#a0a0b0", letterSpacing: 6 }}>
          PULSE REPORT CARD
        </div>
        <div style={{ marginTop: 24, fontSize: 48, fontWeight: 700 }}>
          {isp}
        </div>
        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 24,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 96, color: "#00f0ff" }}>{score}</span>
          <span style={{ fontSize: 48, color: "#ff00aa" }}>{grade}</span>
        </div>
        <div style={{ marginTop: 20, fontSize: 18, color: "#a0a0b0" }}>
          They promised. We measured.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
