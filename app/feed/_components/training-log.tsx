import Link from "next/link";
import {
  formatDuration,
  formatDurationTrainingLog,
  getTrainingLogData,
} from "@/lib/activity-utils";
import { cn } from "@/lib/utils";

type Activity = {
    id: string;
    sportType: string;
    movingTime: number;
    startDate: Date;
};

function ActivityBadge({ activities }: { activities: any[] }) {
  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-10 w-10">
        <div className="h-1 w-1 rounded-full bg-[#3a3a3a]" />
      </div>
    );
  }

  const primary = activities[0];
  const count = activities.length;

  const colorMap: Record<string, string> = {
    run: "bg-[#00D084]",
    walk: "bg-[#00AAAA]",
    weighttraining: "bg-[#FF6B35]",
  };

  const bgColor = colorMap[primary.sportType.toLowerCase()] || "bg-[#9F9F9F]";

  return (
    <Link
      href={`/progress/${primary.id}`}
      className="relative flex items-center justify-center h-10 w-10"
    >
      <div
        className={cn(
          "flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-full text-[0.6rem] font-bold text-black",
          bgColor
        )}
      >
        {formatDurationTrainingLog(primary.movingTime)}
      </div>
      {count > 1 && (
        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[0.5rem] font-bold text-black border-2 border-[#131313]">
          {count}
        </div>
      )}
    </Link>
  );
}

export function TrainingLog({ activities }: { activities: any[] }) {
  const weeks = getTrainingLogData(activities);
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="bg-[#131313] border border-[#2a2a2a] overflow-hidden">
      <div className="p-3 border-b border-[#2a2a2a] flex items-center justify-between">
        <h3 className="font-['Space_Grotesk'] text-sm font-bold uppercase tracking-widest text-[#ff906d]">
            Training Log
        </h3>
        <span className="text-[0.6rem] text-[#8f8f8f] uppercase tracking-widest">Last 12 Weeks</span>
      </div>
      
      {/* Day Labels Row */}
      <div className="grid grid-cols-7 bg-[#1a1a1a] border-b border-[#2a2a2a] py-1 px-1">
        {dayLabels.map((label, i) => (
          <div
            key={i}
            className="text-center text-[0.6rem] font-bold text-[#666]"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Weekly Rows */}
      <div className="max-h-[400px] overflow-y-auto">
        {weeks.map((week, idx) => {
          const dateRange = `${week.start.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} – ${week.end.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`;

          return (
            <div key={idx} className="border-b border-[#1a1a1a] last:border-0 p-1 pb-2">
              <div className="flex justify-between items-center px-2 py-1 text-[0.55rem] text-[#8f8f8f] font-medium tracking-wide">
                <span className="uppercase">{dateRange}</span>
                <span>{formatDuration(week.totalMovingTime)}</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {week.days.map((day, dayIdx) => (
                  <div key={dayIdx} className="flex justify-center items-center">
                    <ActivityBadge activities={day.activities} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
