"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type PerformanceTrendChartProps = {
  data: Array<{
    label: string;
    load: number;
  }>;
};

export function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid vertical={false} stroke="rgba(158, 158, 158, 0.1)" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#8f8f8f", fontSize: 10 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8f8f8f", fontSize: 10 }} />
          <Tooltip
            cursor={{ stroke: "#ff906d", strokeOpacity: 0.3 }}
            contentStyle={{ border: "none", borderRadius: 4, background: "#1a1a1a", color: "#f5f5f5" }}
          />
          <Line type="monotone" dataKey="load" stroke="#ff906d" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
