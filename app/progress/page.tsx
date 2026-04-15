import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LocalDateTime } from "@/app/_components/local-date-time";
import { MobileShell } from "@/app/_components/mobile-shell";
import { ActivityDisplayName } from "@/app/progress/_components/activity-display-name";
import { PerformanceTrendChart } from "@/app/progress/_components/performance-trend-chart";
import {
  ACTIVITIES_PER_PAGE,
  formatDistance,
  formatDuration,
  formatDurationCompact,
  formatRunPaceFromSpeed,
  formatSpeed,
  getRaceBestEfforts,
} from "@/lib/activity-utils";
import { prisma } from "@/lib/prisma";

type ProgressPageProps = {
  searchParams: Promise<{
    page?: string;
    sport?: string;
  }>;
};

const SPORT_FILTERS = [
  { label: "ALL", value: "all" },
  { label: "RUN", value: "run" },
  { label: "WALK", value: "walk" },
  { label: "Weight Training", value: "weighttraining" },
  { label: "BADMINTON", value: "badminton" },
  { label: "BIKE", value: "bike" },
] as const;

type SportFilterValue = (typeof SPORT_FILTERS)[number]["value"];

type HrZone = {
  label: string;
  seconds: number;
  percent: number;
};

// function getHeartRateDistribution(
//   laps: Array<{ averageHeartrate: number | null; movingTime: number }>,
//   thresholdBase: number,
// ): HrZone[] {
//   const buckets = [
//     { label: "Z1", upper: thresholdBase * 0.7, seconds: 0 },
//     { label: "Z2", upper: thresholdBase * 0.8, seconds: 0 },
//     { label: "Z3", upper: thresholdBase * 0.87, seconds: 0 },
//     { label: "Z4", upper: thresholdBase * 0.93, seconds: 0 },
//     { label: "Z5", upper: Number.POSITIVE_INFINITY, seconds: 0 },
//   ];

//   for (const lap of laps) {
//     if (!lap.averageHeartrate || lap.movingTime <= 0) {
//       continue;
//     }

//     const bucket = buckets.find((item) => lap.averageHeartrate <= item.upper);
//     if (bucket) {
//       bucket.seconds += lap.movingTime;
//     }
//   }

//   const totalSeconds = buckets.reduce((sum, bucket) => sum + bucket.seconds, 0);

//   return buckets.map((bucket) => ({
//     label: bucket.label,
//     seconds: bucket.seconds,
//     percent:
//       totalSeconds === 0
//         ? 0
//         : Math.round((bucket.seconds / totalSeconds) * 100),
//   }));
// }

export default async function ProgressPage({
  searchParams,
}: ProgressPageProps) {
  const session = await auth();

  if (!session?.user?.athleteId) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const parsedPage = Number.parseInt(resolvedSearchParams.page ?? "1", 10);
  const currentPage =
    Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const selectedSport = SPORT_FILTERS.some(
    (option) => option.value === resolvedSearchParams.sport,
  )
    ? (resolvedSearchParams.sport as SportFilterValue)
    : "all";

  const now = new Date();
  const sixWeeksAgo = new Date(now);
  sixWeeksAgo.setDate(now.getDate() - 42);
  sixWeeksAgo.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const threeWeeksAgo = new Date(now);
  threeWeeksAgo.setDate(now.getDate() - 21);
  threeWeeksAgo.setHours(0, 0, 0, 0);

  const activityTypeFilter =
    selectedSport === "all"
      ? {}
      : selectedSport === "run"
        ? {
            sportType: {
              contains: "run",
              mode: "insensitive" as const,
            },
          }
        : selectedSport === "walk"
          ? {
              sportType: {
                contains: "walk",
                mode: "insensitive" as const,
              },
            }
          : selectedSport === "bike"
            ? {
                OR: [
                  {
                    sportType: {
                      contains: "ride",
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    sportType: {
                      contains: "bike",
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    sportType: {
                      contains: "cycl",
                      mode: "insensitive" as const,
                    },
                  },
                ],
              }
            : selectedSport === "weighttraining"
              ? {
                  sportType: {
                    contains: "weighttraining",
                    mode: "insensitive" as const,
                  },
                }
              : {
                  sportType: {
                    contains: "badminton",
                    mode: "insensitive" as const,
                  },
                };

  const buildProgressHref = (page: number, sport: SportFilterValue) => {
    const params = new URLSearchParams();
    if (sport !== "all") {
      params.set("sport", sport);
    }
    if (page > 1) {
      params.set("page", String(page));
    }
    const query = params.toString();
    return query ? `/progress?${query}` : "/progress";
  };

  const totalActivityCount = await prisma.activity.count({
    where: {
      athleteId: session.user.athleteId,
      ...activityTypeFilter,
    },
  });
  const totalPages = Math.max(
    1,
    Math.ceil(totalActivityCount / ACTIVITIES_PER_PAGE),
  );
  const safeCurrentPage = currentPage > totalPages ? totalPages : currentPage;

  if (safeCurrentPage !== currentPage) {
    redirect(buildProgressHref(safeCurrentPage, selectedSport));
  }

  const skip = (safeCurrentPage - 1) * ACTIVITIES_PER_PAGE;

  const [activities, recentLaps, paginatedActivities, allRunActivities] =
    await Promise.all([
      prisma.activity.findMany({
        where: {
          athleteId: session.user.athleteId,
          startDate: {
            gte: sixWeeksAgo,
          },
        },
        orderBy: {
          startDate: "asc",
        },
        select: {
          id: true,
          name: true,
          startDate: true,
          distance: true,
          movingTime: true,
          averageSpeed: true,
          maxHeartrate: true,
          sportType: true,
        },
      }),
      prisma.lap.findMany({
        where: {
          activity: {
            athleteId: session.user.athleteId,
            startDate: {
              gte: sixWeeksAgo,
            },
          },
        },
        orderBy: {
          startDate: "desc",
        },
        take: 500,
        select: {
          averageHeartrate: true,
          movingTime: true,
        },
      }),
      prisma.activity.findMany({
        where: {
          athleteId: session.user.athleteId,
          ...activityTypeFilter,
        },
        orderBy: {
          startDate: "desc",
        },
        skip,
        take: ACTIVITIES_PER_PAGE,
        select: {
          id: true,
          name: true,
          sportType: true,
          startDate: true,
          distance: true,
          movingTime: true,
          averageSpeed: true,
          averageHeartrate: true,
        },
      }),
      // All-time run activities for race best effort calculation
      prisma.activity.findMany({
        where: {
          athleteId: session.user.athleteId,
          sportType: {
            contains: "run",
            mode: "insensitive",
          },
          averageSpeed: {
            gt: 0,
          },
        },
        orderBy: {
          startDate: "desc",
        },
        select: {
          id: true,
          name: true,
          distance: true,
          averageSpeed: true,
          startDate: true,
        },
      }),
    ]);

  const raceBestEfforts = getRaceBestEfforts(allRunActivities);

  const weeklyBuckets = Array.from({ length: 6 }, (_, index) => {
    const bucketStart = new Date(now);
    bucketStart.setHours(0, 0, 0, 0);
    bucketStart.setDate(bucketStart.getDate() - (5 - index) * 7);

    return {
      key: bucketStart.toISOString().slice(0, 10),
      label: `W${index + 1}`,
      load: 0,
    };
  });

  let recentDistanceMeters = 0;
  let baselineDistanceMeters = 0;

  for (const activity of activities) {
    if (activity.startDate >= sevenDaysAgo) {
      recentDistanceMeters += activity.distance;
    }
    if (activity.startDate >= threeWeeksAgo) {
      baselineDistanceMeters += activity.distance;
    }

    const weekStart = new Date(activity.startDate);
    const weekday = weekStart.getDay();
    const mondayOffset = weekday === 0 ? 6 : weekday - 1;
    weekStart.setDate(weekStart.getDate() - mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const key = weekStart.toISOString().slice(0, 10);

    const bucket = weeklyBuckets.find((item) => item.key === key);
    if (bucket) {
      bucket.load += activity.distance / 1000;
    }
  }

  const fitness = baselineDistanceMeters / 1000 / 3;
  const fatigue = recentDistanceMeters / 1000;
  const freshness = fitness - fatigue;
  const maxHrEstimate =
    activities.reduce(
      (max, activity) => Math.max(max, activity.maxHeartrate ?? 0),
      0,
    ) || 190;

  // const hrZones = getHeartRateDistribution(recentLaps, maxHrEstimate);

  const longestDistance = activities.reduce(
    (best, activity) => (activity.distance > best.distance ? activity : best),
    activities[0] ?? null,
  );
  const fastestSpeed = activities.reduce(
    (best, activity) =>
      (activity.averageSpeed ?? 0) > (best?.averageSpeed ?? 0)
        ? activity
        : best,
    activities[0] ?? null,
  );
  const longestDuration = activities.reduce(
    (best, activity) =>
      activity.movingTime > best.movingTime ? activity : best,
    activities[0] ?? null,
  );

  return (
    <MobileShell title="Progress" subtitle="Performance analytics">
      <section className="bg-[#131313] p-4">
        <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[#a9a9a9]">
          Current condition
        </p>
        <h2 className="mt-1 font-['Space_Grotesk'] text-5xl font-bold uppercase text-[#ff906d]">
          Elite focus
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="bg-[#1a1a1a] p-3">
            <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
              Fitness
            </p>
            <p className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold">
              {fitness.toFixed(1)}
            </p>
          </div>
          <div className="bg-[#1a1a1a] p-3">
            <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
              Fatigue
            </p>
            <p className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold">
              {fatigue.toFixed(1)}
            </p>
          </div>
          <div className="bg-[#1a1a1a] p-3">
            <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
              Freshness
            </p>
            <p
              className={`mt-1 font-['Space_Grotesk'] text-2xl font-semibold ${
                freshness >= 0 ? "text-[#eda3ff]" : "text-[#ff716c]"
              }`}
            >
              {freshness.toFixed(1)}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#131313] p-4">
        <div className="flex items-end justify-between">
          <h3 className="font-['Space_Grotesk'] text-xl font-semibold uppercase">
            Load progression
          </h3>
          <p className="text-[0.62rem] uppercase tracking-widest text-[#9d9d9d]">
            14-day view
          </p>
        </div>
        <div className="mt-3">
          <PerformanceTrendChart
            data={weeklyBuckets.map((bucket) => ({
              label: bucket.label,
              load: Number(bucket.load.toFixed(1)),
            }))}
          />
        </div>
      </section>

      {/* <section className="bg-[#131313] p-4">
        <h3 className="font-['Space_Grotesk'] text-xl font-semibold uppercase">Heart rate zones</h3>
        <div className="mt-3 space-y-3">
          {hrZones.map((zone) => (
            <div key={zone.label}>
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.1em]">
                <span className="text-[#bdbdbd]">{zone.label}</span>
                <span className="text-[#9e9e9e]">
                  {zone.percent}% · {formatDuration(zone.seconds)}
                </span>
              </div>
              <div className="mt-1 h-1.5 bg-[#1d1d1d]">
                <div
                  className="h-1.5 bg-gradient-to-r from-[#ff906d] to-[#ff5d26]"
                  style={{ width: `${zone.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section> */}

      <section className="space-y-3 bg-[#131313] p-4">
        <h3 className="font-['Space_Grotesk'] text-xl font-semibold uppercase">
          Best efforts
        </h3>
        <div className="grid gap-3">
          <article className="bg-[#1a1a1a] p-3">
            <p className="text-[0.6rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
              Longest distance
            </p>
            <p className="mt-1 text-lg font-semibold">
              {longestDistance
                ? formatDistance(longestDistance.distance)
                : "N/A"}
            </p>
            <p className="text-xs text-[#9e9e9e]">
              {longestDistance?.name ?? "No activity data"}
            </p>
          </article>
          <article className="bg-[#1a1a1a] p-3">
            <p className="text-[0.6rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
              Fastest average speed
            </p>
            <p className="mt-1 text-lg font-semibold">
              {fastestSpeed ? formatSpeed(fastestSpeed.averageSpeed) : "N/A"}
            </p>
            <p className="text-xs text-[#9e9e9e]">
              {fastestSpeed?.name ?? "No activity data"}
            </p>
          </article>
          <article className="bg-[#1a1a1a] p-3">
            <p className="text-[0.6rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
              Longest duration
            </p>
            <p className="mt-1 text-lg font-semibold">
              {longestDuration
                ? formatDuration(longestDuration.movingTime)
                : "N/A"}
            </p>
            <p className="text-xs text-[#9e9e9e]">
              {longestDuration?.name ?? "No activity data"}
            </p>
          </article>
        </div>
      </section>

      {/* Race Best Times */}
      <section className="space-y-3 bg-[#131313] p-4">
        <div className="flex items-end justify-between">
          <h3 className="font-['Space_Grotesk'] text-xl font-semibold uppercase">
            Personal Records
          </h3>
          <p className="text-xs uppercase tracking-widest text-[#9d9d9d]">
            All-time · Runs only
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {raceBestEfforts.map((effort, i) => {
            const category =
              ["5K", "10K", "Half Marathon", "Full Marathon"][i] ?? "";
            if (!effort) {
              return (
                <article
                  key={category}
                  className="flex flex-col bg-[#1a1a1a] p-4"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#ff906d]">
                    {category}
                  </p>
                  <p className="mt-3 font-['Space_Grotesk'] text-2xl font-bold text-[#3d3d3d]">
                    --:--
                  </p>
                  <p className="mt-1 text-[0.6rem] uppercase tracking-widest text-[#4a4a4a]">
                    No qualifying run
                  </p>
                </article>
              );
            }
            return (
              <Link
                key={effort.category}
                href={`/progress/${effort.activityId}`}
                className="flex flex-col bg-[#1a1a1a] p-4 transition-colors hover:bg-[#212121]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#ff906d]">
                  {effort.label}
                </p>
                <p className="mt-3 font-['Space_Grotesk'] text-2xl font-bold leading-none">
                  {effort.finishTime}
                </p>
                <p className="mt-1.5 text-xs uppercase tracking-widest text-[#8f8f8f]">
                  {effort.pace}
                </p>
                <p className="mt-3 line-clamp-1 text-[0.65rem] text-[#6e6e6e]">
                  <LocalDateTime value={effort.date.toISOString()} />
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-3 bg-[#131313] p-4">
        <div className="flex items-end justify-between">
          <h3 className="font-['Space_Grotesk'] text-xl font-semibold uppercase">
            All activities
          </h3>
          <p className="text-sm uppercase tracking-widest text-white">
            {totalActivityCount} total
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {SPORT_FILTERS.map((filter) => {
            const isActive = selectedSport === filter.value;
            return (
              <Link
                key={filter.value}
                href={buildProgressHref(1, filter.value)}
                className={`rounded-full px-6 py-3 text-2xl font-semibold uppercase leading-none transition-colors sm:text-base ${
                  isActive
                    ? "bg-[#ff906d] text-[#40200f]"
                    : "bg-[#202124] text-[#8b8b8b]"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        {paginatedActivities.length === 0 ? (
          <div className="bg-[#1a1a1a] p-4 text-sm text-[#bcbcbc]">
            No activities found.
          </div>
        ) : (
          <div className="space-y-2">
            {paginatedActivities.map((activity) => (
              <Link
                key={activity.id}
                href={`/progress/${activity.id}`}
                className="block bg-[#1a1a1a] p-3 transition-colors hover:bg-[#212121]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.12em] text-[#ff906d] p-2 w-fit rounded-lg mb-2 border-2">
                      {activity.sportType}
                    </p>
                    <h4 className="mt-1 font-['Space_Grotesk'] text-lg font-semibold leading-tight">
                      <ActivityDisplayName
                        name={activity.name}
                        sportType={activity.sportType}
                        startDateIso={activity.startDate.toString()}
                      />
                    </h4>
                    <LocalDateTime
                      value={activity.startDate.toISOString()}
                      className="mt-1 block text-[0.7rem] uppercase tracking-widest text-[#9f9f9f]"
                    />
                  </div>
                  <span className="text-sm text-[#ff906d]">View</span>
                </div>
                <div className={`mt-3 grid gap-2 grid-cols-3`}>
                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
                      Distance
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatDistance(activity.distance)}
                    </p>
                  </div>
                  {activity.sportType.toLowerCase().includes("run") ? (
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
                        Avg pace
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {formatRunPaceFromSpeed(activity.averageSpeed)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
                        Total time
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {formatDurationCompact(activity.movingTime)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
                      Avg heart rate
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {activity.averageHeartrate
                        ? `${Math.round(activity.averageHeartrate)} bpm`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#252525] pt-3">
          {safeCurrentPage > 1 ? (
            <Link
              href={buildProgressHref(safeCurrentPage - 1, selectedSport)}
              className="text-sm font-semibold uppercase tracking-widest text-[#ff906d]"
            >
              Previous
            </Link>
          ) : (
            <span className="text-sm uppercase tracking-widest text-[#606060]">
              Previous
            </span>
          )}

          <p className="text-xs uppercase tracking-widest text-[#9d9d9d]">
            Page {safeCurrentPage} / {totalPages}
          </p>

          {safeCurrentPage < totalPages ? (
            <Link
              href={buildProgressHref(safeCurrentPage + 1, selectedSport)}
              className="text-sm font-semibold uppercase tracking-widest text-[#ff906d]"
            >
              Next
            </Link>
          ) : (
            <span className="text-sm uppercase tracking-widest text-[#606060]">
              Next
            </span>
          )}
        </div>
      </section>
    </MobileShell>
  );
}
