"use client";

import { useMemo } from "react";

type ActivityHeatMapProps = {
  activities: { startDate: Date }[];
};

export function ActivityHeatMap({ activities }: ActivityHeatMapProps) {
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 52 weeks ago (364 days)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);
    
    // Align to Sunday
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    const counts: Record<string, number> = {};
    for (const activity of activities) {
      const date = new Date(activity.startDate);
      const key = date.toISOString().slice(0, 10);
      counts[key] = (counts[key] || 0) + 1;
    }

    const gridWeeks: { date: Date; key: string; count: number }[][] = [];
    const labels: { month: string; colIndex: number }[] = [];
    
    let lastMonth = -1;
    const current = new Date(startDate);

    // Generate 53 columns to ensure we cover 52 full weeks + today's column
    for (let w = 0; w < 53; w++) {
      const week: { date: Date; key: string; count: number }[] = [];
      const mondayOfMonth = new Date(current);
      // If month changes, prepare a label
      if (mondayOfMonth.getMonth() !== lastMonth) {
        labels.push({
          month: mondayOfMonth.toLocaleString("en-US", { month: "short" }),
          colIndex: w,
        });
        lastMonth = mondayOfMonth.getMonth();
      }

      for (let d = 0; d < 7; d++) {
        const key = current.toISOString().slice(0, 10);
        week.push({
          date: new Date(current),
          key,
          count: counts[key] || 0,
        });
        current.setDate(current.getDate() + 1);
      }
      gridWeeks.push(week);
      
      // Stop if we've passed today in the loop
      if (current > today && w >= 51) break;
    }

    return { weeks: gridWeeks, monthLabels: labels };
  }, [activities]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-[#1a1a1a]";
    return "bg-[#ff6b35]";
  };

  return (
    <div className="bg-[#131313] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-['Space_Grotesk'] text-sm font-semibold uppercase tracking-wider text-[#9c9c9c]">
          Activity Insights
        </h3>
        <p className="text-[0.62rem] uppercase tracking-widest text-[#666]">
          Last 52 weeks
        </p>
      </div>

      <div className="relative">
        <div className="flex overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Day Labels */}
          <div className="flex flex-col justify-between pr-2 text-[0.6rem] uppercase tracking-tighter text-[#444] pt-6 mb-1 select-none">
            <span className="h-2.5 flex items-center"></span>
            <span className="h-2.5 flex items-center">Mon</span>
            <span className="h-2.5 flex items-center"></span>
            <span className="h-2.5 flex items-center">Wed</span>
            <span className="h-2.5 flex items-center"></span>
            <span className="h-2.5 flex items-center">Fri</span>
            <span className="h-2.5 flex items-center"></span>
          </div>

          {/* Grid Container */}
          <div className="flex-1">
            {/* Month Labels */}
            <div className="relative h-6 w-full text-[0.65rem] uppercase tracking-widest text-[#888]">
              {monthLabels.map((label, i) => (
                <div
                  key={`${label.month}-${i}`}
                  className="absolute"
                  style={{ left: `${label.colIndex * 14}px` }}
                >
                  {label.month}
                </div>
              ))}
            </div>

            {/* Columns (Weeks) */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-[3px]">
                  {week.map((day) => (
                    <div
                      key={day.key}
                      className={`size-[11px] rounded-sm transition-colors group relative ${getColor(
                        day.count
                      )}`}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                        <div className="bg-[#222] text-white text-[0.6rem] px-2 py-1 rounded-md whitespace-nowrap shadow-xl border border-[#333]">
                          <span className="font-bold">
                            {day.date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {" · "}
                          {day.count} activity{day.count !== 1 ? "ies" : ""}
                        </div>
                        <div className="w-2 h-2 bg-[#222] rotate-45 border-r border-b border-[#333] absolute -bottom-1 left-1/2 -translate-x-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
