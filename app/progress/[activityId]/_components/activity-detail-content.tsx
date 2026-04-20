import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  fetchAndStoreActivityDetail,
  fetchAndStoreActivityStreams,
} from "@/lib/strava/sync";
import { LocalDateTime } from "@/app/_components/local-date-time";
import { ActivityHeartRateZones } from "../../_components/activity-hr-zones";
import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatPaceFromSpeed,
  formatSpeed,
  getHeartRateZoneData,
} from "@/lib/activity-utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { CoachChat } from "@/components/coach-chat";
import { clearChatHistory } from "@/app/coach/actions";
import { ClearChatButton } from "@/app/coach/_components/clear-chat-button";
import ActivityVisuals from "../../_components/activity-visuals";

type ActivityDetailContentProps = {
  activityId: string;
  athleteId: string;
};

export async function ActivityDetailContent({
  activityId,
  athleteId,
}: ActivityDetailContentProps) {
  let [activity, chatData] = await Promise.all([
    prisma.activity.findFirst({
      where: { id: activityId, athleteId },
      include: {
        laps: { orderBy: { lapIndex: "asc" } },
        splits: { orderBy: { split: "asc" } },
        streams: { select: { type: true, data: true } },
        athlete: true,
      },
    }),
    prisma.coachChat.findUnique({ where: { activityId } }),
  ]);

  if (!activity) notFound();

  // Lazy detail fetch
  if (!activity.detailFetched) {
    try {
      await fetchAndStoreActivityDetail(
        BigInt(activity.stravaActivityId.toString()),
        athleteId,
      );
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
      console.error("Lazy detail fetch failed", error);
    }
  }

  // Lazy streams fetch
  if (activity && !activity.streamsFetched) {
    try {
      await fetchAndStoreActivityStreams(
        BigInt(activity.stravaActivityId.toString()),
        activity.id,
        athleteId,
      );
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
      console.error("Lazy streams fetch failed", error);
    }
  }

  if (!activity) notFound();

  const hrStream =
    (activity.streams.find((s) => s.type === "heartrate")?.data as number[]) ||
    [];
  const hrZones =
    hrStream.length > 0 ? getHeartRateZoneData(hrStream, activity.athlete) : [];
  const initialMessages = (chatData?.messages as any[]) || [];
  const FETCHABLE_TYPES = ["Run", "Walk"];

  return (
    <>
      <section className="bg-[#131313] p-4 pt-0">
        <p className="text-[0.62rem] uppercase tracking-[0.12em] text-[#ff906d]">
          {activity.sportType}
        </p>
        <h2 className="mt-1 font-['Space_Grotesk'] text-3xl font-bold leading-tight">
          {activity.name}
        </h2>
        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#9f9f9f]">
          <LocalDateTime
            value={activity.startDate.toISOString()}
            mode="datetime"
          />
        </p>

        {["Run", "TrailRun", "VirtualRun"].includes(activity.sportType) && (
          <div className="mt-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button className="w-full bg-[#1a1a1a] border cursor-pointer border-[#2a2a2a] text-[#ff906d] hover:bg-[#252525] flex items-center justify-center gap-2 h-12 uppercase tracking-widest text-xs font-bold transition-all">
                  <Bot className="h-4 w-4" /> Ask Axel
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[85vh] h-[85dvh] bg-[#0e0e0e] border-[#2a2a2a] p-0 flex flex-col"
              >
                <SheetHeader className="p-4 border-b border-[#2a2a2a] shrink-0">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="flex items-center gap-2 font-['Space_Grotesk'] text-[#ff906d] uppercase tracking-wider">
                      <Bot className="h-5 w-5" /> Ask Axel
                    </SheetTitle>
                    <ClearChatButton
                      onClear={async () => {
                        "use server";
                        await clearChatHistory(activityId);
                      }}
                    />
                  </div>
                </SheetHeader>
                <div className="flex-1 overflow-hidden min-h-0">
                  <CoachChat
                    key={initialMessages.length}
                    apiEndpoint="/api/coach/activity"
                    activityId={activity.id}
                    placeholder="Ask Axel about this run..."
                    userProfileUrl={activity.athlete.profileMedium || undefined}
                    initialMessages={initialMessages}
                    initialSuggestions={[
                      "Was my effort level appropriate?",
                      "How was my heart rate during this run?",
                      "What can I improve next time?",
                    ]}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}

        {activity.description && (
          <p className="mt-3 text-sm text-[#d0d0d0]">{activity.description}</p>
        )}
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
        <StatCard label="Distance" value={formatDistance(activity.distance)} />
        <StatCard
          label="Moving time"
          value={formatDuration(activity.movingTime)}
        />
        <StatCard
          label="Elapsed time"
          value={formatDuration(activity.elapsedTime)}
        />
        <StatCard
          label="Elevation gain"
          value={formatElevation(activity.totalElevationGain)}
        />
      </section>

      <section className="grid grid-cols-2 gap-3 bg-[#131313] p-4">
        <StatCard
          label="Avg speed"
          value={formatSpeed(activity.averageSpeed)}
        />
        <StatCard label="Max speed" value={formatSpeed(activity.maxSpeed)} />
        <StatCard
          label="Pace"
          value={formatPaceFromSpeed(activity.averageSpeed)}
        />
        <StatCard
          label="Avg HR"
          value={
            activity.averageHeartrate
              ? `${Math.round(activity.averageHeartrate)} bpm`
              : "N/A"
          }
        />
        <StatCard
          label="Max HR"
          value={
            activity.maxHeartrate
              ? `${Math.round(activity.maxHeartrate)} bpm`
              : "N/A"
          }
        />
        <StatCard
          label="Cadence"
          value={
            activity.averageCadence
              ? Math.round(activity.averageCadence).toString()
              : "N/A"
          }
        />
        <StatCard
          label="Power"
          value={
            activity.averageWatts
              ? `${Math.round(activity.averageWatts)} W`
              : "N/A"
          }
        />
        <StatCard
          label="Energy"
          value={
            activity.kilojoules
              ? `${Math.round(activity.kilojoules)} kJ`
              : "N/A"
          }
        />
        <StatCard
          label="Calories"
          value={
            activity.calories ? `${Math.round(activity.calories)} kcal` : "N/A"
          }
        />
      </section>

      <section className="bg-[#131313] p-4 pt-0">
        <div className="border-t border-[#1a1a1a] pt-4">
          <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#ff906d]">
            Advanced Analytics
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <StatCard
              label="Weighted Power"
              value={
                activity.weightedAverageWatts
                  ? `${activity.weightedAverageWatts} W`
                  : "—"
              }
              size="base"
            />
            <StatCard
              label="Max Power"
              value={activity.maxWatts ? `${activity.maxWatts} W` : "—"}
              size="base"
            />
            <StatCard
              label="Elev High"
              value={
                activity.elevHigh ? formatElevation(activity.elevHigh) : "—"
              }
              color="text-[#ff906d]"
              size="base"
            />
            <StatCard
              label="Avg Temp"
              value={activity.averageTemp ? `${activity.averageTemp}°C` : "—"}
              size="base"
            />
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
                          ? `${split.elevationDifference > 0 ? "+" : ""}${Math.round(split.elevationDifference)}m`
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
    </>
  );
}

function StatCard({
  label,
  value,
  color = "text-white",
  size = "lg",
}: {
  label: string;
  value: string;
  color?: string;
  size?: "base" | "lg";
}) {
  const sizeClass = size === "lg" ? "text-lg" : "text-base";
  return (
    <div className="bg-[#1a1a1a] p-3">
      <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[#8f8f8f] font-medium">
        {label}
      </p>
      <p className={`mt-1 font-semibold ${sizeClass} ${color}`}>{value}</p>
    </div>
  );
}
