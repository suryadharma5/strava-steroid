import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { MobileShell } from "@/app/_components/mobile-shell";
import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatPaceFromSpeed,
  formatSpeed,
} from "@/lib/activity-utils";
import { prisma } from "@/lib/prisma";

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

  const activity = await prisma.activity.findFirst({
    where: {
      id: activityId,
      athleteId: session.user.athleteId,
    },
    select: {
      id: true,
      name: true,
      sportType: true,
      description: true,
      startDate: true,
      distance: true,
      movingTime: true,
      elapsedTime: true,
      totalElevationGain: true,
      averageSpeed: true,
      maxSpeed: true,
      averageHeartrate: true,
      maxHeartrate: true,
      averageCadence: true,
      averageWatts: true,
      kilojoules: true,
      kudosCount: true,
      commentCount: true,
    },
  });

  if (!activity) {
    notFound();
  }

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
      </section>

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
