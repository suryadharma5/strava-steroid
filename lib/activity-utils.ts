import type { Activity, Lap } from "@prisma/client";

export const ACTIVITIES_PER_PAGE = 10;

type ActivityLike = Pick<
  Activity,
  | "distance"
  | "movingTime"
  | "totalElevationGain"
  | "kilojoules"
  | "averageWatts"
  | "sportType"
>;

type LapLike = Pick<Lap, "movingTime" | "averageHeartrate" | "averageSpeed">;

export function formatDistance(distanceInMeters: number) {
  return `${(distanceInMeters / 1000).toFixed(1)} km`;
}

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours}h ${minutes}m`;
}

export function formatDurationCompact(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

export function formatElevation(elevationInMeters: number) {
  return `${Math.round(elevationInMeters).toLocaleString()} m`;
}

export function formatCalories(calories: number) {
  return `${Math.round(calories).toLocaleString()} kcal`;
}

export function formatPaceFromSpeed(speedMetersPerSecond: number | null) {
  if (!speedMetersPerSecond || speedMetersPerSecond <= 0) {
    return "N/A";
  }

  const totalSeconds = Math.round(1000 / speedMetersPerSecond);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
}

export function formatRunPaceFromSpeed(speedMetersPerSecond: number | null) {
  if (!speedMetersPerSecond || speedMetersPerSecond <= 0) {
    return "N/A";
  }

  const totalSeconds = Math.round(1000 / speedMetersPerSecond);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}'${seconds.toString().padStart(2, "0")}" /km`;
}

export function formatSpeed(speedMetersPerSecond: number | null) {
  if (!speedMetersPerSecond || speedMetersPerSecond <= 0) {
    return "N/A";
  }

  return `${(speedMetersPerSecond * 3.6).toFixed(1)} km/h`;
}

/**
 * Format a duration (in seconds) as a race finish time: H:MM:SS or MM:SS
 */
export function formatFinishTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export const RACE_CATEGORIES = [
  { key: "5k", label: "5K", distanceMeters: 5_000 },
  { key: "10k", label: "10K", distanceMeters: 10_000 },
  { key: "hm", label: "Half Marathon", distanceMeters: 21_097.5 },
  { key: "fm", label: "Full Marathon", distanceMeters: 42_195 },
] as const;

export type RaceCategory = (typeof RACE_CATEGORIES)[number]["key"];

export type RaceBestEffort = {
  category: RaceCategory;
  label: string;
  finishTime: string;
  pace: string;
  activityName: string;
  activityId: string;
  date: Date;
} | null;

type RaceActivity = Pick<
  Activity,
  "id" | "name" | "distance" | "averageSpeed" | "startDate"
>;

/**
 * For each race category, find the activity with the best (fastest) average speed
 * whose distance is at least the target distance, then compute the projected
 * finish time for that exact distance.
 */
export function getRaceBestEfforts(
  runActivities: RaceActivity[],
): RaceBestEffort[] {
  return RACE_CATEGORIES.map(({ key, label, distanceMeters }) => {
    const candidates = runActivities.filter(
      (a) =>
        a.distance >= distanceMeters && a.averageSpeed && a.averageSpeed > 0,
    );

    if (candidates.length === 0) return null;

    const best = candidates.reduce((prev, curr) =>
      (curr.averageSpeed ?? 0) > (prev.averageSpeed ?? 0) ? curr : prev,
    );

    const speed = best.averageSpeed!;
    const finishSeconds = distanceMeters / speed;
    const paceSecondsPerKm = 1000 / speed;
    const paceMin = Math.floor(paceSecondsPerKm / 60);
    const paceSec = Math.round(paceSecondsPerKm % 60);

    return {
      category: key,
      label,
      finishTime: formatFinishTime(finishSeconds),
      pace: `${paceMin}'${paceSec.toString().padStart(2, "0")}" /km`,
      activityName: best.name,
      activityId: best.id,
      date: best.startDate,
    } satisfies NonNullable<RaceBestEffort>;
  });
}

export function estimateCalories(activity: ActivityLike) {
  if (activity.kilojoules && activity.kilojoules > 0) {
    return activity.kilojoules;
  }

  if (activity.averageWatts && activity.averageWatts > 0) {
    return (activity.averageWatts * activity.movingTime) / 1000;
  }

  const distanceKm = activity.distance / 1000;
  const multiplier =
    activity.sportType.toLowerCase().includes("run") ||
    activity.sportType.toLowerCase().includes("walk")
      ? 62
      : 32;

  return distanceKm * multiplier;
}

export function getRollingWeekSummary(activities: ActivityLike[]) {
  return activities.reduce(
    (summary, activity) => {
      summary.distance += activity.distance;
      summary.movingTime += activity.movingTime;
      summary.totalElevationGain += activity.totalElevationGain;
      summary.calories += estimateCalories(activity);
      return summary;
    },
    {
      distance: 0,
      movingTime: 0,
      totalElevationGain: 0,
      calories: 0,
    },
  );
}

export function getWeeklyVolumeChartData(
  activities: Pick<Activity, "startDate" | "distance">[],
) {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const currentWeekStart = new Date(now);
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setDate(currentWeekStart.getDate() - diffToMonday);

  const weeks = Array.from({ length: 8 }, (_, index) => {
    const start = new Date(currentWeekStart);
    start.setDate(start.getDate() - (7 - index - 1) * 7);
    const key = start.toISOString().slice(0, 10);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    return {
      key,
      label: `${start.toLocaleDateString("en-US", { month: "short" })} ${start.getDate()}`,
      start,
      end,
      distance: 0,
    };
  });

  for (const activity of activities) {
    const activityDate = new Date(activity.startDate);
    const activityDay = activityDate.getDay();
    const activityDiffToMonday = activityDay === 0 ? 6 : activityDay - 1;
    const bucketStart = new Date(activityDate);
    bucketStart.setHours(0, 0, 0, 0);
    bucketStart.setDate(bucketStart.getDate() - activityDiffToMonday);
    const key = bucketStart.toISOString().slice(0, 10);

    const bucket = weeks.find((week) => week.key === key);
    if (bucket) {
      bucket.distance += activity.distance / 1000;
    }
  }

  return weeks
    .filter((week) => week.start <= currentWeekStart)
    .map((week) => ({
      label: week.label,
      distance: Number(week.distance.toFixed(1)),
      dateRange: `${week.start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${week.end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`,
    }));
}

function buildZoneBuckets(
  laps: LapLike[],
  getValue: (lap: LapLike) => number | null,
  thresholds: number[],
  labels: string[],
) {
  const totals = labels.map((label) => ({
    label,
    seconds: 0,
  }));

  for (const lap of laps) {
    const value = getValue(lap);

    if (!value || lap.movingTime <= 0) {
      continue;
    }

    const zoneIndex = thresholds.findIndex((threshold) => value <= threshold);
    const resolvedIndex = zoneIndex === -1 ? totals.length - 1 : zoneIndex;
    totals[resolvedIndex].seconds += lap.movingTime;
  }

  const totalSeconds = totals.reduce((sum, zone) => sum + zone.seconds, 0);

  return totals.map((zone) => ({
    ...zone,
    percentage:
      totalSeconds === 0 ? 0 : Math.round((zone.seconds / totalSeconds) * 100),
  }));
}

export function getHeartRateZoneData(
  laps: LapLike[],
  maxHeartRate: number | null,
) {
  if (!maxHeartRate || maxHeartRate <= 0) {
    return [];
  }

  return buildZoneBuckets(
    laps,
    (lap) => lap.averageHeartrate ?? null,
    [
      maxHeartRate * 0.7,
      maxHeartRate * 0.8,
      maxHeartRate * 0.87,
      maxHeartRate * 0.93,
    ],
    ["Z1 Recovery", "Z2 Endurance", "Z3 Tempo", "Z4 Threshold", "Z5 Peak"],
  );
}

export function getPaceZoneData(laps: LapLike[]) {
  const validSpeeds = laps
    .map((lap) => lap.averageSpeed)
    .filter((speed): speed is number => Boolean(speed && speed > 0));

  if (validSpeeds.length === 0) {
    return [];
  }

  const maxSpeed = Math.max(...validSpeeds);

  return buildZoneBuckets(
    laps,
    (lap) => lap.averageSpeed ?? null,
    [maxSpeed * 0.55, maxSpeed * 0.7, maxSpeed * 0.82, maxSpeed * 0.92],
    ["Easy", "Steady", "Tempo", "Threshold", "Fast"],
  );
}
export function formatDurationTrainingLog(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

export function getTrainingLogData(activities: Activity[]) {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const currentWeekStart = new Date(now);
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setDate(currentWeekStart.getDate() - diffToMonday);

  const weeks = Array.from({ length: 12 }, (_, index) => {
    const start = new Date(currentWeekStart);
    start.setDate(start.getDate() - index * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return {
      start,
      end,
      totalMovingTime: 0,
      days: Array.from({ length: 7 }, () => ({
        activities: [] as Activity[],
      })),
    };
  });

  for (const activity of activities) {
    const activityDate = new Date(activity.startDate);
    const weekIndex = weeks.findIndex(
      (w) => activityDate >= w.start && activityDate <= w.end,
    );

    if (weekIndex !== -1) {
      const week = weeks[weekIndex];
      week.totalMovingTime += activity.movingTime;
      const dayOfWeek = activityDate.getDay();
      const mondayIndexing = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      week.days[mondayIndexing].activities.push(activity);
    }
  }

  return weeks;
}
