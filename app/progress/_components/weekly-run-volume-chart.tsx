"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type WeeklyRunVolumeChartProps = {
  data: Array<{
    label: string;
    distance: number;
    dateRange: string;
  }>;
};

export function WeeklyRunVolumeChart({ data }: WeeklyRunVolumeChartProps) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="runVolumeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff906d" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#0e0e0e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(158, 158, 158, 0.1)" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8f8f8f", fontSize: 10 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8f8f8f", fontSize: 10 }}
            tickFormatter={(value) => `${value}k`}
            width={28}
          />
          <Tooltip
            cursor={{ fill: "rgba(255, 144, 109, 0.08)" }}
            contentStyle={{
              borderRadius: 4,
              border: "none",
              background: "#1a1a1a",
              color: "#f5f5f5",
            }}
            labelFormatter={(_value, payload) =>
              payload?.[0]?.payload?.dateRange ?? ""
            }
            formatter={(value) => [
              `${typeof value === "number" ? value.toFixed(1) : (value ?? 0)} km`,
              "Run distance",
            ]}
          />
          <Area
            dataKey="distance"
            type="monotone"
            fill="url(#runVolumeFill)"
            stroke="none"
          />
          <Line
            dataKey="distance"
            type="monotone"
            stroke="#ff906d"
            strokeWidth={2}
            dot={{ r: 0 }}
            activeDot={{ r: 4, strokeWidth: 0, fill: "#ff5d26" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
