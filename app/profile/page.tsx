import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { MobileShell } from "@/app/_components/mobile-shell";
import { DateRangeSyncCard } from "@/app/profile/_components/date-range-sync-card";
import { formatDistance } from "@/lib/activity-utils";
import { prisma } from "@/lib/prisma";
import { getLatestSyncJob } from "@/lib/strava/sync";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.athleteId) {
    redirect("/login");
  }

  const [athlete, latestActivity, latestJob] = await Promise.all([
    prisma.athlete.findUnique({
      where: { id: session.user.athleteId },
      select: {
        id: true,
        fullName: true,
        city: true,
        state: true,
        country: true,
        profile: true,
        profileMedium: true,
        bio: true,
        lastSyncRangeStart: true,
        lastSyncRangeEnd: true,
        lastSyncActivityCount: true,
        _count: {
          select: {
            activities: true,
          },
        },
      },
    }),
    prisma.activity.findFirst({
      where: {
        athleteId: session.user.athleteId,
      },
      orderBy: {
        startDate: "desc",
      },
      select: {
        name: true,
        distance: true,
        movingTime: true,
        averageSpeed: true,
      },
    }),
    getLatestSyncJob(session.user.athleteId),
  ]);

  if (!athlete) {
    redirect("/login");
  }

  const defaultTo = athlete.lastSyncRangeEnd ?? new Date();
  const defaultFrom =
    athlete.lastSyncRangeStart ??
    new Date(new Date(defaultTo).setDate(defaultTo.getDate() - 30));

  return (
    <MobileShell title="Profile" subtitle="Athlete profile">
      <section className="bg-[#131313] p-4">
        <div className="flex items-start gap-3">
          <div className="size-16 overflow-hidden bg-[#1a1a1a]">
            {athlete.profileMedium ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={athlete.profileMedium}
                alt={athlete.fullName}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center font-['Space_Grotesk'] text-2xl font-bold text-[#ff906d]">
                {athlete.fullName.slice(0, 1)}
              </div>
            )}
          </div>
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.12em] text-[#8f8f8f]">Elite class</p>
            <h2 className="mt-1 font-['Space_Grotesk'] text-4xl font-bold uppercase leading-none">
              {athlete.fullName}
            </h2>
            <p className="mt-2 text-xs uppercase tracking-[0.1em] text-[#a9a9a9]">
              {(athlete.city || athlete.state || athlete.country)
                ? [athlete.city, athlete.state, athlete.country].filter(Boolean).join(", ")
                : "Location not set"}
            </p>
          </div>
        </div>
        {athlete.bio ? <p className="mt-4 text-sm text-[#c3c3c3]">{athlete.bio}</p> : null}
      </section>

      <section className="grid grid-cols-3 gap-2">
        <article className="bg-[#131313] p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.1em] text-[#8f8f8f]">Activities</p>
          <p className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold text-[#ff906d]">
            {athlete._count.activities}
          </p>
        </article>
        <article className="bg-[#131313] p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.1em] text-[#8f8f8f]">Latest dist</p>
          <p className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold text-[#ff906d]">
            {latestActivity ? formatDistance(latestActivity.distance) : "N/A"}
          </p>
        </article>
        <article className="bg-[#131313] p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.1em] text-[#8f8f8f]">Last sync</p>
          <p className="mt-1 font-['Space_Grotesk'] text-xl font-semibold text-[#eda3ff]">
            {athlete.lastSyncActivityCount ?? 0}
          </p>
        </article>
      </section>

      <section className="bg-[#131313] p-4">
        <h3 className="font-['Space_Grotesk'] text-xl font-semibold uppercase">Current gear</h3>
        <div className="mt-3 space-y-2">
          <article className="bg-[#1a1a1a] p-3">
            <p className="text-[0.6rem] uppercase tracking-[0.1em] text-[#8f8f8f]">Primary shoe</p>
            <p className="mt-1 text-lg font-semibold">AeroVelocity 400</p>
            <p className="text-sm text-[#b4b4b4]">248.5 / 400 mi</p>
          </article>
          <article className="bg-[#1a1a1a] p-3">
            <p className="text-[0.6rem] uppercase tracking-[0.1em] text-[#8f8f8f]">Primary bike</p>
            <p className="mt-1 text-lg font-semibold">S-Works Tarmac SL8</p>
            <p className="text-sm text-[#b4b4b4]">4,280 mi · 2 books ago</p>
          </article>
        </div>
      </section>

      <DateRangeSyncCard
        defaultFrom={toDateInputValue(defaultFrom)}
        defaultTo={toDateInputValue(defaultTo)}
        latestJob={
          latestJob
            ? {
                id: latestJob.id,
                status: latestJob.status,
                requestedFrom: latestJob.requestedFrom.toISOString(),
                requestedTo: latestJob.requestedTo.toISOString(),
                fetchedCount: latestJob.fetchedCount,
                upsertedCount: latestJob.upsertedCount,
                currentPage: latestJob.currentPage,
                errorMessage: latestJob.errorMessage ?? null,
              }
            : null
        }
      />
    </MobileShell>
  );
}
