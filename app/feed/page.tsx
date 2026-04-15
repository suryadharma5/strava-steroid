import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { MobileShell } from "@/app/_components/mobile-shell";
import { ActivityFilterSelect } from "@/app/feed/_components/activity-filter-select";
import { WeeklyVolumeChart } from "@/app/feed/_components/weekly-volume-chart";
import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatPaceFromSpeed,
  getRollingWeekSummary,
  getWeeklyVolumeChartData,
} from "@/lib/activity-utils";
import { prisma } from "@/lib/prisma";

type FeedPageProps = {
  searchParams: Promise<{
    sport?: string;
  }>;
};

function getCurrentActivityStreak(dates: Date[]) {
  if (dates.length === 0) {
    return 0;
  }

  const activeDays = new Set(
    dates.map((date) => {
      const localDay = new Date(date);
      localDay.setHours(0, 0, 0, 0);
      return localDay.toISOString().slice(0, 10);
    }),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayKey = today.toISOString().slice(0, 10);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (!activeDays.has(todayKey) && !activeDays.has(yesterdayKey)) {
    return 0;
  }

  const cursor = activeDays.has(todayKey) ? today : yesterday;
  let streak = 0;

  while (activeDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const session = await auth();

  if (!session?.user?.athleteId) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const selectedSport =
    resolvedSearchParams.sport && resolvedSearchParams.sport !== "all"
      ? resolvedSearchParams.sport
      : null;

  const chartWindowStart = new Date();
  chartWindowStart.setDate(chartWindowStart.getDate() - 56);
  chartWindowStart.setHours(0, 0, 0, 0);

  const rollingWeekStart = new Date();
  rollingWeekStart.setDate(rollingWeekStart.getDate() - 7);
  rollingWeekStart.setHours(0, 0, 0, 0);

  const activityFilter = {
    athleteId: session.user.athleteId,
    ...(selectedSport ? { sportType: selectedSport } : {}),
  };

  const [
    chartActivities,
    rollingWeekActivities,
    feedActivities,
    filteredActivityCount,
    activityDates,
  ] = await Promise.all([
    prisma.activity.findMany({
      where: {
        athleteId: session.user.athleteId,
        startDate: {
          gte: chartWindowStart,
        },
      },
      select: {
        startDate: true,
        distance: true,
      },
      orderBy: {
        startDate: "asc",
      },
    }),
    prisma.activity.findMany({
      where: {
        athleteId: session.user.athleteId,
        startDate: {
          gte: rollingWeekStart,
        },
      },
      select: {
        distance: true,
        movingTime: true,
        totalElevationGain: true,
        kilojoules: true,
        averageWatts: true,
        sportType: true,
      },
    }),
    prisma.activity.findMany({
      where: activityFilter,
      orderBy: {
        startDate: "desc",
      },
      take: 3,
      select: {
        id: true,
        name: true,
        sportType: true,
        startDateLocal: true,
        distance: true,
        movingTime: true,
        totalElevationGain: true,
        averageSpeed: true,
        averageHeartrate: true,
      },
    }),
    prisma.activity.count({
      where: activityFilter,
    }),
    prisma.activity.findMany({
      where: {
        athleteId: session.user.athleteId,
      },
      orderBy: {
        startDate: "desc",
      },
      take: 365,
      select: {
        startDate: true,
      },
    }),
  ]);

  const weeklySummary = getRollingWeekSummary(rollingWeekActivities);
  const chartData = getWeeklyVolumeChartData(chartActivities);
  const feedEnd = Math.min(3, filteredActivityCount);
  const currentStreak = getCurrentActivityStreak(
    activityDates.map((activity) => activity.startDate),
  );

  return (
    <MobileShell title="Feed" subtitle="Activity dashboard">
      <section className="bg-[#131313] p-4">
        <div className="border-l-2 border-[#ff5d26] pl-3">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[#a9a9a9]">
            Weekly volume
          </p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <p className="font-['Space_Grotesk'] text-4xl font-bold text-[#ff906d]">
              {(weeklySummary.distance / 1000).toFixed(1)}
              <span className="ml-1 text-sm font-medium uppercase tracking-[0.08em] text-[#b8b8b8]">
                km
              </span>
            </p>
            <p className="text-[0.62rem] uppercase tracking-[0.12em] text-[#9f9f9f]">
              8-week trend
            </p>
          </div>
        </div>
        <div className="mt-3">
          <WeeklyVolumeChart data={chartData} />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        <div className="bg-[#131313] p-4">
          <ActivityFilterSelect value={selectedSport ?? "all"} />
        </div>
        <div className="bg-[#131313] p-4">
          <p className="text-[0.64rem] uppercase tracking-[0.15em] text-[#9c9c9c]">
            Current range
          </p>
          <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-[#ff906d]">
            {selectedSport ?? "All sports"}
          </p>
          <p className="mt-1 text-xs text-[#b6b6b6]">
            Latest {feedEnd} of {filteredActivityCount}
          </p>
        </div>
      </section>

      <section className="bg-[#131313] p-4">
        {currentStreak > 0 ? (
          <>
            <p className="text-[0.64rem] uppercase tracking-[0.12em] text-[#9c9c9c]">
              Current streak
            </p>
            <p className="mt-2 font-['Space_Grotesk'] text-3xl font-bold text-[#ff906d]">
              🔥 {currentStreak} day streak
            </p>
          </>
        ) : (
          <>
            <p className="text-[0.64rem] uppercase tracking-[0.12em] text-[#9c9c9c]">
              Current streak
            </p>
            <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-[#eda3ff]">
              Start your streak today
            </p>
          </>
        )}
      </section>

      <section className="space-y-3 bg-[#131313] p-4">
        <h2 className="font-['Space_Grotesk'] text-xl font-semibold uppercase tracking-tight">
          Recent activity
        </h2>
        {feedActivities.length === 0 ? (
          <div className="bg-[#1a1a1a] p-4 text-sm text-[#bcbcbc]">
            No activities found for this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {feedActivities.map((activity) => (
              <article key={activity.id} className="bg-[#101010]">
                <div className="bg-[radial-gradient(circle_at_16%_14%,rgba(255,144,109,0.2),transparent_45%),linear-gradient(145deg,#202020,#0f0f0f)] p-4">
                  <p className="inline-flex bg-[#131313]/85 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#ff906d]">
                    {activity.sportType}
                  </p>
                  <h3 className="mt-8 font-['Space_Grotesk'] text-2xl font-semibold leading-none">
                    {activity.name}
                  </h3>
                  <p className="mt-1 text-[0.62rem] uppercase tracking-[0.11em] text-[#b8b8b8]">
                    {activity.startDateLocal.toLocaleString()}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 p-3">
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-widest text-[#8f8f8f]">
                      Distance
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {formatDistance(activity.distance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-widest text-[#8f8f8f]">
                      Time
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {formatDuration(activity.movingTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-widest text-[#8f8f8f]">
                      Gain
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {formatElevation(activity.totalElevationGain)}
                    </p>
                  </div>
                </div>
                <div className="px-3 pb-3 text-sm text-[#c8c8c8]">
                  Pace {formatPaceFromSpeed(activity.averageSpeed)} · HR{" "}
                  {activity.averageHeartrate
                    ? `${Math.round(activity.averageHeartrate)} bpm`
                    : "N/A"}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="bg-[#131313] p-3">
          <p className="text-[0.6rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
            Time this week
          </p>
          <p className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold">
            {formatDuration(weeklySummary.movingTime)}
          </p>
        </div>
        <div className="bg-[#131313] p-3">
          <p className="text-[0.6rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
            Elevation week
          </p>
          <p className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold">
            {formatElevation(weeklySummary.totalElevationGain)}
          </p>
        </div>
      </section>

      <section className="bg-[#131313] p-3">
        <Link
          href="/progress"
          className="inline-flex text-sm font-semibold uppercase tracking-widest text-[#ff906d]"
        >
          See all activities
        </Link>
      </section>
    </MobileShell>
  );
}
