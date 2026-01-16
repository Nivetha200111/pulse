"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface GraphPoint {
  time: number;
  speed: number;
}

interface LiveGraphProps {
  data: GraphPoint[];
}

export function LiveGraph({ data }: LiveGraphProps) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis hide domain={[0, "dataMax + 50"]} />
          <Tooltip
            contentStyle={{
              background: "rgba(10,10,15,0.85)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
            }}
            labelFormatter={() => ""}
            formatter={(value) => [`${Number(value).toFixed(1)} Mbps`, ""]}
          />
          <Line
            type="monotone"
            dataKey="speed"
            stroke="var(--neon-cyan)"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
