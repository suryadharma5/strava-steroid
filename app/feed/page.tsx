import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { MobileShell } from "@/app/_components/mobile-shell";
import { ActivityFilterSelect } from "@/app/feed/_components/activity-filter-select";
import { ActivityHeatMap } from "@/app/feed/_components/activity-heat-map";
import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatPaceFromSpeed,
  getRollingWeekSummary,
  formatCalories,
  estimateCalories,
} from "@/lib/activity-utils";
import { prisma } from "@/lib/prisma";

type FeedPageProps = {
  searchParams: Promise<{
    sport?: string;
  }>;
};



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

  const rollingWeekStart = new Date();
  rollingWeekStart.setDate(rollingWeekStart.getDate() - 7);
  rollingWeekStart.setHours(0, 0, 0, 0);

  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 371);
  oneYearAgo.setHours(0, 0, 0, 0);

  const activityFilter = {
    athleteId: session.user.athleteId,
    ...(selectedSport ? { sportType: selectedSport } : {}),
  };

  const [
    rollingWeekActivities,
    feedActivities,
    filteredActivityCount,
    activityDates,
  ] = await Promise.all([
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
        kilojoules: true,
        averageWatts: true,
      },
    }),
    prisma.activity.count({
      where: activityFilter,
    }),
    prisma.activity.findMany({
      where: {
        athleteId: session.user.athleteId,
        startDate: {
          gte: oneYearAgo,
        },
      },
      select: {
        startDate: true,
      },
    }),
  ]);

  const weeklySummary = getRollingWeekSummary(rollingWeekActivities);
  const feedEnd = Math.min(3, filteredActivityCount);

  return (
    <MobileShell title="Feed" subtitle="Activity dashboard">
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

      <ActivityHeatMap activities={activityDates} />



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
              <Link key={activity.id} href={`/progress/${activity.id}`} className="block">
                <article className="bg-[#101010] transition-colors hover:bg-[#151515]">
                  <div className="bg-[radial-gradient(circle_at_16%_14%,rgba(255,144,109,0.2),transparent_45%),linear-gradient(145deg,#202020,#0f0f0f)] p-4">
                    <p className="inline-flex bg-[#131313]/85 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#ff906d]">
                      {activity.sportType}
                    </p>
                    <h3 className="mt-8 font-['Space_Grotesk'] text-2xl font-semibold leading-none text-white">
                      {activity.name}
                    </h3>
                    <p className="mt-1 text-[0.62rem] uppercase tracking-[0.11em] text-[#b8b8b8]">
                      {activity.startDateLocal.toLocaleString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-3">
                    {activity.sportType.toLowerCase().includes("run") ? (
                      <>
                        <div>
                          <p className="text-[0.6rem] uppercase tracking-widest text-[#8f8f8f]">
                            Distance
                          </p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {formatDistance(activity.distance)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[0.6rem] uppercase tracking-widest text-[#8f8f8f]">
                            Avg HR
                          </p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {activity.averageHeartrate
                              ? `${Math.round(activity.averageHeartrate)} bpm`
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[0.6rem] uppercase tracking-widest text-[#8f8f8f]">
                            Pace
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#ff906d]">
                            {formatPaceFromSpeed(activity.averageSpeed)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-[0.6rem] uppercase tracking-widest text-[#8f8f8f]">
                            Time
                          </p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {formatDuration(activity.movingTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[0.6rem] uppercase tracking-widest text-[#8f8f8f]">
                            Avg HR
                          </p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {activity.averageHeartrate
                              ? `${Math.round(activity.averageHeartrate)} bpm`
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[0.6rem] uppercase tracking-widest text-[#8f8f8f]">
                            Calories
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#eda3ff]">
                            {formatCalories(estimateCalories(activity))}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </article>
              </Link>
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
