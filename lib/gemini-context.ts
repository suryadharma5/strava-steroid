import { prisma } from "./prisma";
import { formatRunPaceFromSpeed, formatDistance, formatDuration } from "./activity-utils";

export async function buildGlobalCoachContext(athleteId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    select: { firstName: true, lastName: true, hrZones: true },
  });

  const activities = await prisma.activity.findMany({
    where: {
      athleteId,
      sportType: { contains: "run", mode: "insensitive" },
      startDate: { gte: thirtyDaysAgo },
    },
    orderBy: { startDate: "desc" },
  });

  // Group by week
  const weeklySummaries: Record<string, {
    count: number;
    distance: number;
    time: number;
    totalHr: number;
    hrCount: number;
    elevation: number;
    totalSpeed: number;
    speedCount: number;
    start: Date;
    end: Date;
  }> = {};

  activities.forEach((activity) => {
    const d = new Date(activity.startDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    const key = monday.toISOString().split("T")[0];

    if (!weeklySummaries[key]) {
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      weeklySummaries[key] = {
        count: 0,
        distance: 0,
        time: 0,
        totalHr: 0,
        hrCount: 0,
        elevation: 0,
        totalSpeed: 0,
        speedCount: 0,
        start: monday,
        end: sunday,
      };
    }

    const week = weeklySummaries[key];
    week.count++;
    week.distance += activity.distance;
    week.time += activity.movingTime;
    week.elevation += activity.totalElevationGain;
    if (activity.averageHeartrate) {
      week.totalHr += activity.averageHeartrate;
      week.hrCount++;
    }
    if (activity.averageSpeed) {
      week.totalSpeed += activity.averageSpeed;
      week.speedCount++;
    }
  });

  const summaryLines = Object.values(weeklySummaries).map((week) => {
    const avgPace = week.speedCount > 0 ? formatRunPaceFromSpeed(week.totalSpeed / week.speedCount) : "N/A";
    const avgHr = week.hrCount > 0 ? `${Math.round(week.totalHr / week.hrCount)}bpm` : "N/A";
    const dateRange = `${week.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${week.end.getDate()}`;
    return `Week ${dateRange}: ${week.count} runs, ${formatDistance(week.distance)}, avg pace ${avgPace}, avg HR ${avgHr}, elev ${Math.round(week.elevation)}m`;
  });

  const hrZonesStr = athlete?.hrZones 
    ? `\nAthlete Heart Rate Zones:\n${(athlete.hrZones as any[]).map((z: any) => `${z.label}: ${z.rule}`).join("\n")}\n`
    : "";

  return `Athlete: ${athlete?.firstName} ${athlete?.lastName}
${hrZonesStr}
Last 30 days running summary:
${summaryLines.join("\n")}
`;
}

export async function buildActivityCoachContext(activityId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      laps: { orderBy: { lapIndex: "asc" } },
      streams: { where: { type: "heartrate" } },
      athlete: { select: { hrZones: true } },
    },
  });

  if (!activity || !activity.sportType.toLowerCase().includes("run")) {
    return "";
  }

  const lapSplits = activity.laps.map(lap => 
    `Lap ${lap.lapIndex + 1}: ${formatDistance(lap.distance)} @ ${formatRunPaceFromSpeed(lap.averageSpeed)}`
  ).join("\n");

  const cadence = activity.averageCadence ? `\nCadence: ${Math.round(activity.averageCadence)} spm` : "";

  const hrZonesStr = activity.athlete?.hrZones 
    ? `\nAthlete Heart Rate Zones:\n${(activity.athlete.hrZones as any[]).map(z => `${z.label}: ${z.rule}`).join("\n")}\n`
    : "";

  return `Activity: ${activity.sportType} on ${activity.startDate.toLocaleDateString()}
${hrZonesStr}
Distance: ${formatDistance(activity.distance)}
Moving time: ${formatDuration(activity.movingTime)}
Avg pace: ${formatRunPaceFromSpeed(activity.averageSpeed)}
Avg HR: ${activity.averageHeartrate ? Math.round(activity.averageHeartrate) : "N/A"} bpm | Max HR: ${activity.maxHeartrate ? Math.round(activity.maxHeartrate) : "N/A"} bpm
Elevation gain: ${Math.round(activity.totalElevationGain)} m${cadence}

Lap splits:
${lapSplits}
`;
}
