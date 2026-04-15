"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type SyncJobSnapshot = {
  id: string;
  status: string;
  requestedFrom: string;
  requestedTo: string;
  fetchedCount: number;
  upsertedCount: number;
  currentPage: number;
  errorMessage: string | null;
};

type DateRangeSyncCardProps = {
  defaultFrom: string;
  defaultTo: string;
  latestJob: SyncJobSnapshot | null;
};

function formatDateRange(from: string, to: string) {
  return `${new Date(from).toLocaleDateString()} - ${new Date(to).toLocaleDateString()}`;
}

export function DateRangeSyncCard({
  defaultFrom,
  defaultTo,
  latestJob,
}: DateRangeSyncCardProps) {
  const router = useRouter();
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeJob, setActiveJob] = useState<SyncJobSnapshot | null>(latestJob);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (!activeJob || !["queued", "running"].includes(activeJob.status)) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      const response = await fetch(`/api/strava/sync/${activeJob.id}`);
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { job: SyncJobSnapshot };
      setActiveJob(payload.job);

      if (payload.job.status === "completed") {
        toast.success(
          `Sync finished for ${formatDateRange(payload.job.requestedFrom, payload.job.requestedTo)}.`,
        );
        router.refresh();
      }

      if (payload.job.status === "failed") {
        toast.error(payload.job.errorMessage ?? "Sync failed.");
      }
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, [activeJob, router]);

  return (
    <section className="space-y-4 bg-[#131313] p-4">
      <div>
        <h3 className="font-['Space_Grotesk'] text-xl font-semibold uppercase">
          Sync settings
        </h3>
        <p className="mt-1 text-sm text-[#b5b5b5]">
          Customize sync window and refresh activity data.
        </p>
      </div>

      <form
        className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);

          try {
            const response = await fetch("/api/strava/sync", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ from, to }),
            });

            const payload = (await response.json()) as {
              job?: SyncJobSnapshot;
              error?: string;
              issues?: Array<{ message: string }>;
            };

            if (!response.ok || !payload.job) {
              throw new Error(
                payload.issues?.[0]?.message ??
                  payload.error ??
                  "Unable to start sync.",
              );
            }

            setActiveJob(payload.job);
            toast.success(`Sync started for ${formatDateRange(from, to)}.`);
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Unable to start sync.",
            );
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <label className="flex flex-col gap-1">
          <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-[#919191]">
            From
          </span>
          <input
            type="date"
            value={from}
            max={today}
            onChange={(event) => setFrom(event.target.value)}
            className="h-11 bg-[#1a1a1a] px-3 text-sm text-white outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-[#919191]">
            To
          </span>
          <input
            type="date"
            value={to}
            max={today}
            onChange={(event) => setTo(event.target.value)}
            className="h-11 bg-[#1a1a1a] px-3 text-sm text-white outline-none"
          />
        </label>

        <div className="flex items-end gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:w-auto"
          >
            {isSubmitting ? "..." : "Sync Range"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="flex-1 sm:w-auto border-[#ff906d] text-[#ff906d] hover:bg-[#ff906d] hover:text-[#131313]"
            onClick={async () => {
              setIsSubmitting(true);
              try {
                const response = await fetch("/api/strava/sync", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ latest: true }),
                });

                const payload = (await response.json()) as {
                  job?: SyncJobSnapshot;
                  error?: string;
                };

                if (!response.ok || !payload.job) {
                  throw new Error(payload.error ?? "Unable to start sync.");
                }

                setActiveJob(payload.job);
                toast.success("Sync started for last 200 activities.");
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Unable to start sync.",
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {isSubmitting ? "..." : "Sync Last 200"}
          </Button>
        </div>
      </form>

      <article className="bg-[#1a1a1a] p-3">
        <p className="text-[0.62rem] uppercase tracking-widest text-[#8f8f8f]">
          Latest sync job
        </p>
        {activeJob ? (
          <div className="mt-2 space-y-1 text-sm text-[#c7c7c7]">
            <p className="font-semibold uppercase text-[#ff906d]">
              {activeJob.status}
            </p>
            <p>
              {formatDateRange(activeJob.requestedFrom, activeJob.requestedTo)}
            </p>
            <p>
              Fetched {activeJob.fetchedCount} · Upserted{" "}
              {activeJob.upsertedCount} · Page{" "}
              {Math.max(activeJob.currentPage, 1)}
            </p>
            {activeJob.errorMessage ? (
              <p className="text-[#ff716c]">{activeJob.errorMessage}</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[#bcbcbc]">
            No sync job started yet.
          </p>
        )}
      </article>
    </section>
  );
}
