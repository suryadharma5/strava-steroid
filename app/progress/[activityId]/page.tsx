import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { MobileShell } from "@/app/_components/mobile-shell";
import { prisma } from "@/lib/prisma";
import {
  fetchAndStoreActivityDetail,
  fetchAndStoreActivityStreams,
} from "@/lib/strava/sync";
import ActivityVisuals from "../_components/activity-visuals";
import { ActivityHeartRateZones } from "../_components/activity-hr-zones";
import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatPaceFromSpeed,
  formatSpeed,
  getHeartRateZoneData,
} from "@/lib/activity-utils";

type ActivityDetailPageProps = {
  params: Promise<{
    activityId: string;
  }>;
};

export default async function ActivityDetailPage({
  params,
}: ActivityDetailPageProps) {
  const session = await auth();

  if (!session?.user?.athleteId) {
    redirect("/login");
  }

  const { activityId } = await params;
  const athleteId = session.user.athleteId;

  let activity = await prisma.activity.findFirst({
    where: {
      id: activityId,
      athleteId: athleteId,
    },
    include: {
      laps: { orderBy: { lapIndex: "asc" } },
      splits: { orderBy: { split: "asc" } },
      streams: { select: { type: true, data: true } },
      athlete: true,
    },
  });

  if (!activity) {
    notFound();
  }

  const FETCHABLE_TYPES = ["Run", "Walk"];

  // if (FETCHABLE_TYPES.includes(activity.sportType)) {

  // }

  if (!activity.detailFetched) {
    try {
      await fetchAndStoreActivityDetail(
        BigInt(activity.stravaActivityId.toString()),
        athleteId,
      );
      // Re-fetch with fresh detail
      activity = await prisma.activity.findFirst({
        where: { id: activityId },
        include: {
          laps: { orderBy: { lapIndex: "asc" } },
          splits: { orderBy: { split: "asc" } },
          streams: { select: { type: true, data: true } },
          athlete: true,
        },
      });
    } catch (error) {
      console.error("Failed to fetch activity detail lazily:", error);
    }
  }

  if (activity && !activity.streamsFetched) {
    try {
      await fetchAndStoreActivityStreams(
        BigInt(activity.stravaActivityId.toString()),
        activity.id,
        athleteId,
      );
      // Re-fetch with fresh streams
      activity = await prisma.activity.findFirst({
        where: { id: activityId },
        include: {
          laps: { orderBy: { lapIndex: "asc" } },
          splits: { orderBy: { split: "asc" } },
          streams: { select: { type: true, data: true } },
          athlete: true,
        },
      });
    } catch (error) {
      console.error("Failed to fetch activity streams lazily:", error);
    }
  }

  if (!activity) {
    notFound();
  }

  const hrStream = (activity.streams.find((s) => s.type === "heartrate")
    ?.data as number[]) || [];
  const hrZones =
    hrStream.length > 0
      ? getHeartRateZoneData(hrStream, activity.athlete)
      : [];

  return (
    <MobileShell title="Activity" subtitle="Workout details">
      <section className="bg-[#131313] p-4">
        <p className="text-[0.62rem] uppercase tracking-[0.12em] text-[#ff906d]">
          {activity.sportType}
        </p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h2 className="font-['Space_Grotesk'] text-3xl font-bold leading-tight">
            {activity.name}
          </h2>
          <Link
            href="/progress"
            className="shrink-0 text-xs font-semibold uppercase tracking-widest text-[#ff906d] border-2 border-[#ff906d] p-2"
          >
            Back
          </Link>
        </div>
        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#9f9f9f]">
          {activity.startDate.toLocaleString()}
        </p>
        {activity.description ? (
          <p className="mt-3 text-sm text-[#d0d0d0]">{activity.description}</p>
        ) : null}
      </section>

      {FETCHABLE_TYPES.includes(activity.sportType) && (
        <section className="bg-[#131313] p-4 pt-0">
          <ActivityVisuals streams={activity.streams} />
        </section>
      )}

      {hrZones.length > 0 && (
        <section className="bg-[#131313] p-4 pt-0">
          <ActivityHeartRateZones 
            zones={hrZones} 
            isConfigured={activity.athlete.hrZones !== null} 
          />
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 bg-[#131313] p-4">
        <div className="bg-[#1a1a1a] p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
            Distance
          </p>
          <p className="mt-1 text-lg font-semibold">
            {formatDistance(activity.distance)}
          </p>
        </div>
        <div className="bg-[#1a1a1a] p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
            Moving time
          </p>
          <p className="mt-1 text-lg font-semibold">
            {formatDuration(activity.movingTime)}
          </p>
        </div>
        <div className="bg-[#1a1a1a] p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
            Elapsed time
          </p>
          <p className="mt-1 text-lg font-semibold">
            {formatDuration(activity.elapsedTime)}
          </p>
        </div>
        <div className="bg-[#1a1a1a] p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
            Elevation gain
          </p>
          <p className="mt-1 text-lg font-semibold">
            {formatElevation(activity.totalElevationGain)}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 bg-[#131313] p-4">
        <div className="bg-[#1a1a1a] p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
            Avg speed
          </p>
          <p className="mt-1 text-lg font-semibold">
            {formatSpeed(activity.averageSpeed)}
          </p>
        </div>
        <div className="bg-[#1a1a1a] p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
            Max speed
          </p>
          <p className="mt-1 text-lg font-semibold">
            {formatSpeed(activity.maxSpeed)}
          </p>
        </div>
        <div className="bg-[#1a1a1a] p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
            Pace
          </p>
          <p className="mt-1 text-lg font-semibold">
            {formatPaceFromSpeed(activity.averageSpeed)}
          </p>
        </div>
        <div className="bg-[#1a1a1a] p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
            Avg HR
          </p>
          <p className="mt-1 text-lg font-semibold">
            {activity.averageHeartrate
              ? `${Math.round(activity.averageHeartrate)} bpm`
              : "N/A"}
          </p>
        </div>
        <div className="bg-[#1a1a1a] p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
            Max HR
          </p>
          <p className="mt-1 text-lg font-semibold">
            {activity.maxHeartrate
              ? `${Math.round(activity.maxHeartrate)} bpm`
              : "N/A"}
          </p>
        </div>
        <div className="bg-[#1a1a1a] p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
            Cadence
          </p>
          <p className="mt-1 text-lg font-semibold">
            {activity.averageCadence
              ? Math.round(activity.averageCadence)
              : "N/A"}
          </p>
        </div>
        <div className="bg-[#1a1a1a] p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
            Power
          </p>
          <p className="mt-1 text-lg font-semibold">
            {activity.averageWatts
              ? `${Math.round(activity.averageWatts)} W`
              : "N/A"}
          </p>
        </div>
        <div className="bg-[#1a1a1a] p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
            Energy
          </p>
          <p className="mt-1 text-lg font-semibold">
            {activity.kilojoules
              ? `${Math.round(activity.kilojoules)} kJ`
              : "N/A"}
          </p>
        </div>
        <div className="bg-[#1a1a1a] p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
            Calories
          </p>
          <p className="mt-1 text-lg font-semibold">
            {activity.calories
              ? `${Math.round(activity.calories)} kcal`
              : "N/A"}
          </p>
        </div>
      </section>

      <section className="bg-[#131313] p-4 pt-0">
        <div className="border-t border-[#1a1a1a] pt-4">
          <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#ff906d]">
            Advanced Analytics
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="bg-[#1a1a1a] p-3">
              <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
                Weighted Power
              </p>
              <p className="mt-1 text-base font-semibold">
                {activity.weightedAverageWatts
                  ? `${activity.weightedAverageWatts} W`
                  : "—"}
              </p>
            </div>
            <div className="bg-[#1a1a1a] p-3">
              <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
                Max Power
              </p>
              <p className="mt-1 text-base font-semibold">
                {activity.maxWatts ? `${activity.maxWatts} W` : "—"}
              </p>
            </div>
            <div className="bg-[#1a1a1a] p-3">
              <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
                Elev High
              </p>
              <p className="mt-1 text-base font-semibold text-[#ff906d]">
                {activity.elevHigh ? formatElevation(activity.elevHigh) : "—"}
              </p>
            </div>
            <div className="bg-[#1a1a1a] p-3">
              <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
                Avg Temp
              </p>
              <p className="mt-1 text-base font-semibold">
                {activity.averageTemp ? `${activity.averageTemp}°C` : "—"}
              </p>
            </div>
          </div>
          {activity.deviceName && (
            <p className="mt-3 text-[0.62rem] text-[#6d6d6d]">
              Recorded on {activity.deviceName}
            </p>
          )}
        </div>
      </section>

      {/* Splits Table */}
      {activity.splits.length > 0 && (
        <section className="bg-[#131313] p-4 pt-0">
          <div className="border-t border-[#1a1a1a] pt-4">
            <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#ff906d]">
              Splits (km)
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-[0.65rem] uppercase tracking-[0.1em]">
                <thead>
                  <tr className="border-b border-[#2a2a2a] text-[#8f8f8f]">
                    <th className="py-2 pr-2 font-medium">Split</th>
                    <th className="py-2 pr-2 font-medium">Dist</th>
                    <th className="py-2 pr-2 font-medium">Pace</th>
                    <th className="py-2 pr-2 font-medium">Elev</th>
                    <th className="py-2 text-right font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a] text-[#d0d0d0]">
                  {activity.splits.map((split) => (
                    <tr key={split.id}>
                      <td className="py-2.5 pr-2 font-semibold">
                        {split.split}
                      </td>
                      <td className="py-2.5 pr-2">
                        {formatDistance(split.distance)}
                      </td>
                      <td className="py-2.5 pr-2 text-[#ff906d]">
                        {formatPaceFromSpeed(split.averageSpeed)}
                      </td>
                      <td className="py-2.5 pr-2">
                        {split.elevationDifference
                          ? `${split.elevationDifference > 0 ? "+" : ""}${Math.round(
                              split.elevationDifference,
                            )}m`
                          : "—"}
                      </td>
                      <td className="py-2.5 text-right font-mono">
                        {formatDuration(split.movingTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Laps Table */}
      {activity.laps.length > 0 && (
        <section className="bg-[#131313] p-4 pt-0">
          <div className="border-t border-[#1a1a1a] pt-4">
            <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#ff906d]">
              Laps
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-[0.65rem] uppercase tracking-[0.1em]">
                <thead>
                  <tr className="border-b border-[#2a2a2a] text-[#8f8f8f]">
                    <th className="py-2 pr-2 font-medium">Lap</th>
                    <th className="py-2 pr-2 font-medium">Dist</th>
                    <th className="py-2 pr-2 font-medium">Pace</th>
                    <th className="py-2 pr-2 font-medium">HR</th>
                    <th className="py-2 text-right font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a] text-[#d0d0d0]">
                  {activity.laps.map((lap) => (
                    <tr key={lap.id}>
                      <td className="py-2.5 pr-2 font-semibold text-[#ff906d]">
                        {lap.lapIndex}
                      </td>
                      <td className="py-2.5 pr-2">
                        {formatDistance(lap.distance)}
                      </td>
                      <td className="py-2.5 pr-2">
                        {formatPaceFromSpeed(lap.averageSpeed)}
                      </td>
                      <td className="py-2.5 pr-2">
                        {lap.averageHeartrate
                          ? `${Math.round(lap.averageHeartrate)}`
                          : "—"}
                      </td>
                      <td className="py-2.5 text-right font-mono">
                        {formatDuration(lap.movingTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#131313] p-4">
        <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
          Engagement
        </p>
        <p className="mt-2 text-sm text-[#c8c8c8]">
          Kudos {activity.kudosCount} · Comments {activity.commentCount}
        </p>
      </section>
    </MobileShell>
  );
}
