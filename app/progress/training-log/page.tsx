import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { auth } from "@/auth";
import { MobileShell } from "@/app/_components/mobile-shell";
import { prisma } from "@/lib/prisma";
import {
  formatDuration,
  formatDurationTrainingLog,
  getTrainingLogData,
} from "@/lib/activity-utils";
import { cn } from "@/lib/utils";

type Activity = Awaited<ReturnType<typeof prisma.activity.findMany>>[number];

function ActivityBadge({ activities }: { activities: Activity[] }) {
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
    "strength training": "bg-[#FF6B35]",
  };

  const bgColor = colorMap[primary.sportType.toLowerCase()] || "bg-[#9F9F9F]";

  return (
    <Link
      href={`/progress/${primary.id}`}
      className="relative flex items-center justify-center h-10 w-10"
    >
      <div
        className={cn(
          "flex items-center justify-center h-10 w-10 rounded-full text-[0.6rem] font-bold text-black",
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

export default async function TrainingLogPage() {
  const session = await auth();

  if (!session?.user?.athleteId) {
    redirect("/login");
  }

  const activities = await prisma.activity.findMany({
    where: {
      athleteId: session.user.athleteId,
      startDate: {
        gte: new Date(new Date().setDate(new Date().getDate() - 13 * 7)), // 12 weeks + buffer
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });

  const weeks = getTrainingLogData(activities);
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <MobileShell title="Training Log" subtitle="Last 12 weeks">
      <div className="flex flex-col h-full bg-[#131313]">
        {/* Header with Back Button */}
        <div className="p-4 flex items-center gap-2 border-b border-[#1a1a1a]">
          <Link
            href="/progress"
            className="flex items-center gap-1 text-sm font-medium text-[#ff906d]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        {/* Day Labels Row - Sticky */}
        <div className="sticky top-0 z-10 grid grid-cols-7 bg-[#131313] border-b border-[#1a1a1a] py-2 px-1">
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="text-center text-[0.65rem] font-bold text-[#8f8f8f]"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Weekly Rows */}
        <div className="flex-1 overflow-y-auto">
          {weeks.map((week, idx) => {
            const dateRange = `${week.start.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })} – ${week.end.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}`;

            return (
              <div key={idx} className="border-b border-[#1a1a1a] p-1 pb-4">
                <div className="flex justify-between items-center px-3 py-2 text-[0.65rem] text-[#8f8f8f] font-medium tracking-wide">
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
    </MobileShell>
  );
}
