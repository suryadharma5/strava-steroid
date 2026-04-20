import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LocalDateTime } from "@/app/_components/local-date-time";
import { ActivityDisplayName } from "./activity-display-name";
import { WeeklyRunVolumeChart } from "./weekly-run-volume-chart";
import {
  ACTIVITIES_PER_PAGE,
  formatDistance,
  formatDurationCompact,
  formatRunPaceFromSpeed,
  getWeeklyVolumeChartData,
} from "@/lib/activity-utils";

const SPORT_FILTERS = [
  { label: "ALL", value: "all" },
  { label: "RUN", value: "run" },
  { label: "WALK", value: "walk" },
  { label: "Weight Training", value: "weighttraining" },
  { label: "BADMINTON", value: "badminton" },
  { label: "BIKE", value: "bike" },
] as const;

type SportFilterValue = (typeof SPORT_FILTERS)[number]["value"];

type ProgressContentProps = {
  athleteId: string;
  currentPage: number;
  selectedSport: SportFilterValue;
};

export async function ProgressContent({ 
  athleteId, 
  currentPage, 
  selectedSport 
}: ProgressContentProps) {
  const now = new Date();
  const sixWeeksAgo = new Date(now);
  sixWeeksAgo.setDate(now.getDate() - 42);
  sixWeeksAgo.setHours(0, 0, 0, 0);

  const activityTypeFilter =
    selectedSport === "all"
      ? {}
      : selectedSport === "run"
        ? { sportType: { contains: "run", mode: "insensitive" as const } }
        : selectedSport === "walk"
          ? { sportType: { contains: "walk", mode: "insensitive" as const } }
          : selectedSport === "bike"
            ? {
                OR: [
                  { sportType: { contains: "ride", mode: "insensitive" as const } },
                  { sportType: { contains: "bike", mode: "insensitive" as const } },
                  { sportType: { contains: "cycl", mode: "insensitive" as const } },
                ],
              }
            : { sportType: { contains: selectedSport, mode: "insensitive" as const } };

  const totalActivityCount = await prisma.activity.count({
    where: { athleteId, ...activityTypeFilter },
  });

  const totalPages = Math.max(1, Math.ceil(totalActivityCount / ACTIVITIES_PER_PAGE));
  const skip = (currentPage - 1) * ACTIVITIES_PER_PAGE;

  const [activities, paginatedActivities, runChartActivities] = await Promise.all([
    prisma.activity.findMany({
      where: { athleteId, startDate: { gte: sixWeeksAgo } },
      orderBy: { startDate: "asc" },
      select: { id: true, name: true, startDate: true, distance: true, movingTime: true, averageSpeed: true, sportType: true },
    }),
    prisma.activity.findMany({
      where: { athleteId, ...activityTypeFilter },
      orderBy: { startDate: "desc" },
      skip,
      take: ACTIVITIES_PER_PAGE,
      select: { id: true, name: true, sportType: true, startDate: true, distance: true, movingTime: true, averageSpeed: true, averageHeartrate: true },
    }),
    prisma.activity.findMany({
      where: {
        athleteId,
        sportType: { contains: "run", mode: "insensitive" },
        startDate: { gte: new Date(new Date().setDate(new Date().getDate() - 56)) },
      },
      orderBy: { startDate: "asc" },
      select: { startDate: true, distance: true },
    }),
  ]);

  const runChartData = getWeeklyVolumeChartData(runChartActivities);
  const diffToMonday = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const currentWeekStart = new Date(now);
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setDate(now.getDate() - diffToMonday);

  const weeklyRunActivities = activities.filter(
    (a) => a.startDate >= currentWeekStart && a.sportType.toLowerCase().includes("run")
  );

  const totalWeeklyDistance = weeklyRunActivities.reduce((sum, a) => sum + a.distance, 0);
  const totalWeeklyTime = weeklyRunActivities.reduce((sum, a) => sum + a.movingTime, 0);
  const avgWeeklySpeed = totalWeeklyTime > 0 ? totalWeeklyDistance / totalWeeklyTime : 0;

  const buildProgressHref = (page: number, sport: SportFilterValue) => {
    const params = new URLSearchParams();
    if (sport !== "all") params.set("sport", sport);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/progress?${query}` : "/progress";
  };

  return (
    <>
      <section className="bg-[#131313] p-4">
        <h2 className="mt-1 font-['Space_Grotesk'] text-5xl font-bold uppercase text-[#ff906d]">
          Athlete Progress
        </h2>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="bg-[#1a1a1a] p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[#8f8f8f]">
              Total run distance
              <span className="ml-2 text-[0.58rem]">(this week)</span>
            </p>
            <p className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold">
              {weeklyRunActivities.length > 0 ? formatDistance(totalWeeklyDistance) : "—"}
            </p>
          </div>
          <div className="bg-[#1a1a1a] p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[#8f8f8f]">
              Total time
              <span className="ml-2 text-[0.58rem]">(this week)</span>
            </p>
            <p className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold">
              {weeklyRunActivities.length > 0 ? formatDurationCompact(totalWeeklyTime) : "—"}
            </p>
          </div>
          <div className="bg-[#1a1a1a] p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[#8f8f8f]">
              Average pace
              <span className="ml-2 text-[0.58rem]">(this week)</span>
            </p>
            <p className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold">
              {weeklyRunActivities.length > 0 ? formatRunPaceFromSpeed(avgWeeklySpeed) : "—"}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#131313] p-4">
        <div className="flex items-end justify-between">
          <h3 className="font-['Space_Grotesk'] text-xl font-semibold uppercase">
            Weekly run volume
          </h3>
          <p className="text-[0.62rem] uppercase tracking-widest text-[#9d9d9d]">
            8-week · Runs only
          </p>
        </div>
        <div className="mt-3">
          <WeeklyRunVolumeChart data={runChartData} />
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
        <div className="flex flex-wrap gap-2">
          {SPORT_FILTERS.map((filter) => {
            const isActive = selectedSport === filter.value;
            return (
              <Link
                key={filter.value}
                href={buildProgressHref(1, filter.value)}
                className={`rounded-full px-3 py-1 md:px-6 md:py-3 text-xs md:text-sm font-semibold uppercase leading-none transition-colors whitespace-nowrap ${
                  isActive ? "bg-[#FC4C02] text-white" : "bg-[#202124] text-[#8b8b8b]"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        {paginatedActivities.length === 0 ? (
          <div className="bg-[#1a1a1a] p-4 text-sm text-[#bcbcbc]">No activities found.</div>
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
                    <p className="text-[0.6rem] uppercase tracking-[0.12em] text-[#ff906d] w-fit">
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
                    <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">Distance</p>
                    <p className="mt-1 text-sm font-semibold">{formatDistance(activity.distance)}</p>
                  </div>
                  {activity.sportType.toLowerCase().includes("run") ? (
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">Avg pace</p>
                      <p className="mt-1 text-sm font-semibold">{formatRunPaceFromSpeed(activity.averageSpeed)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">Total time</p>
                      <p className="mt-1 text-sm font-semibold">{formatDurationCompact(activity.movingTime)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">Avg heart rate</p>
                    <p className="mt-1 text-sm font-semibold">
                      {activity.averageHeartrate ? `${Math.round(activity.averageHeartrate)} bpm` : "N/A"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#252525] pt-3">
          {currentPage > 1 ? (
            <Link
              href={buildProgressHref(currentPage - 1, selectedSport)}
              className="text-sm font-semibold uppercase tracking-widest text-[#ff906d]"
            >
              Previous
            </Link>
          ) : (
            <span className="text-sm uppercase tracking-widest text-[#606060]">Previous</span>
          )}

          <p className="text-xs uppercase tracking-widest text-[#9d9d9d]">
            Page {currentPage} / {totalPages}
          </p>

          {currentPage < totalPages ? (
            <Link
              href={buildProgressHref(currentPage + 1, selectedSport)}
              className="text-sm font-semibold uppercase tracking-widest text-[#ff906d]"
            >
              Next
            </Link>
          ) : (
            <span className="text-sm uppercase tracking-widest text-[#606060]">Next</span>
          )}
        </div>
      </section>
    </>
  );
}
