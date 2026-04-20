"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatElevation, formatDistance } from "@/lib/activity-utils";

interface ActivityChartsProps {
  data: {
    distance: number;
    value: number;
    index: number;
  }[];
  dataKey: string;
  stroke: string;
  fill: string;
  label: string;
  unit?: string;
  onCursorMove: (index: number | null) => void;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-sm border border-[#2a2a2a] bg-[#131313]/90 p-2 shadow-xl backdrop-blur-sm">
        <p className="text-[0.6rem] uppercase tracking-wider text-[#8f8f8f]">
          Distance: {formatDistance(data.distance)}
        </p>
        <p className="mt-0.5 text-xs font-bold" style={{ color: payload[0].stroke }}>
          {label}: {payload[0].value}{unit}
        </p>
      </div>
    );
  }
  return null;
};

export default function ActivityCharts({
  data,
  dataKey,
  stroke,
  fill,
  label,
  unit,
  onCursorMove,
}: ActivityChartsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-32 w-full items-center justify-center bg-[#1a1a1a] text-xs text-[#6d6d6d]">
        No {label.toLowerCase()} data available
      </div>
    );
  }

  return (
    <div className="h-40 w-full bg-[#131313] p-2 sm:h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          onMouseMove={(e) => {
            if (typeof e.activeTooltipIndex === "number" && data[e.activeTooltipIndex]) {
              onCursorMove(data[e.activeTooltipIndex].index);
            }
          }}
          onMouseLeave={() => onCursorMove(null)}
        >
          <defs>
            <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fill} stopOpacity={0.4} />
              <stop offset="95%" stopColor={fill} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
          <XAxis dataKey="distance" hide domain={["dataMin", "dataMax"]} type="number" />
          <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
          <Tooltip content={<CustomTooltip label={label} unit={unit} />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#color-${dataKey})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
