import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { MobileShell } from "@/app/_components/mobile-shell";
import { CoachChat } from "@/app/coach/_components/coach-chat";
import { formatDistance, formatDuration } from "@/lib/activity-utils";
import { prisma } from "@/lib/prisma";

export default async function CoachPage() {
  const session = await auth();

  if (!session?.user?.athleteId) {
    redirect("/login");
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const activities = await prisma.activity.findMany({
    where: {
      athleteId: session.user.athleteId,
      startDate: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      startDate: "desc",
    },
    take: 30,
    select: {
      id: true,
      name: true,
      distance: true,
      movingTime: true,
      averageHeartrate: true,
      averageSpeed: true,
      sportType: true,
      startDateLocal: true,
      startDate: true,
    },
  });

  const totalDistance = activities.reduce(
    (sum, activity) => sum + activity.distance,
    0,
  );
  const totalTime = activities.reduce(
    (sum, activity) => sum + activity.movingTime,
    0,
  );
  const averageHeartRate =
    activities
      .filter((activity) => activity.averageHeartrate)
      .reduce((sum, activity) => {
        return sum + (activity.averageHeartrate ?? 0);
      }, 0) /
    Math.max(
      activities.filter((activity) => activity.averageHeartrate).length,
      1,
    );

  const openingInsight =
    activities.length > 0
      ? `I reviewed your last 30 days: ${formatDistance(totalDistance)} across ${formatDuration(
          totalTime,
        )}. Your average tracked heart rate is ${Math.round(
          averageHeartRate,
        )} bpm. Most recent session: ${activities[0].name}.`
      : "No activity history found for the last 30 days. Start with a sync to unlock coaching insights.";

  return (
    <MobileShell title="Coach Gemini" subtitle="Live analytics engine">
      <section className="bg-[#131313] p-4">
        <p className="text-sm text-[#d5d5d5]">
          Coach has active access to your last 30 days of performance, recovery,
          and biometric telemetry.
        </p>
      </section>

      <CoachChat openingInsight={openingInsight} />

      <section className="space-y-3 bg-[#131313] p-4">
        <h2 className="font-['Space_Grotesk'] text-xl font-semibold uppercase">
          Recent sessions
        </h2>
        {activities.length === 0 ? (
          <p className="bg-[#1a1a1a] p-3 text-sm text-[#b8b8b8]">
            No synced activities yet.
          </p>
        ) : (
          activities.slice(0, 4).map((activity) => (
            <article key={activity.id} className="bg-[#1a1a1a] p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.1em] text-[#8f8f8f]">
                    {activity.sportType}
                  </p>
                  <p className="mt-1 font-semibold text-[#efefef]">
                    {activity.name}
                  </p>
                </div>
                <p className="text-xs text-[#9b9b9b]">
                  {activity.startDate.toLocaleDateString()}
                </p>
              </div>
              <p className="mt-2 text-sm text-[#c5c5c5]">
                {formatDistance(activity.distance)} ·{" "}
                {formatDuration(activity.movingTime)}
              </p>
            </article>
          ))
        )}
      </section>
    </MobileShell>
  );
}
