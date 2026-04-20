"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import { format, isBefore, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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
  try {
    return `${format(new Date(from), "MMM dd, yyyy")} - ${format(new Date(to), "MMM dd, yyyy")}`;
  } catch {
    return `${from} - ${to}`;
  }
}

interface DatePickerProps {
  label: string;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  disabledDates?: { before?: Date; after?: Date };
  disabled?: boolean;
}

function DatePicker({
  label,
  date,
  setDate,
  isOpen,
  setIsOpen,
  disabledDates,
  disabled,
}: DatePickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  return (
    <div className="relative flex flex-col gap-1.5 flex-1" ref={ref}>
      <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#555] ml-1">
        {label}
      </span>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-lg bg-[#1a1a1a] px-4 text-sm font-medium transition-all border border-transparent hover:border-[#2a2a2a]",
          isOpen && "border-[#ff906d] ring-1 ring-[#ff906d]/20",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-4 w-4 text-[#ff906d]" />
          <span className={cn("text-white", !date && "text-[#555]")}>
            {date ? format(date, "MMM dd, yyyy") : "Pick a date"}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[#555] transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 rounded-xl border border-[#2a2a2a] bg-[#131313] p-0 shadow-2xl animate-in fade-in zoom-in-95 duration-200 origin-top">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setIsOpen(false);
            }}
            disabled={(d) => {
              if (!disabledDates) return false;
              if (disabledDates.before && isBefore(d, disabledDates.before))
                return true;
              if (disabledDates.after && isBefore(disabledDates.after, d))
                return true;
              return false;
            }}
            initialFocus
            className="rounded-xl border-0 text-black"
          />
        </div>
      )}
    </div>
  );
}

export function DateRangeSyncCard({
  defaultFrom,
  defaultTo,
  latestJob,
}: DateRangeSyncCardProps) {
  const router = useRouter();
  const [from, setFrom] = useState<Date | undefined>(new Date(defaultFrom));
  const [to, setTo] = useState<Date | undefined>(new Date(defaultTo));
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeJob, setActiveJob] = useState<SyncJobSnapshot | null>(latestJob);

  const today = useMemo(() => startOfDay(new Date()), []);

  useEffect(() => {
    if (!activeJob || !["queued", "running"].includes(activeJob.status)) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      const response = await fetch(`/api/strava/sync/${activeJob.id}`);
      if (!response.ok) return;

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

  const handleSync = async () => {
    if (!from || !to) {
      toast.error("Please select both start and end dates.");
      return;
    }

    if (isBefore(to, from)) {
      toast.error("End date cannot be earlier than start date.");
      return;
    }

    setIsSubmitting(true);
    const fromStr = format(from, "yyyy-MM-dd");
    const toStr = format(to, "yyyy-MM-dd");

    try {
      const response = await fetch("/api/strava/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromStr, to: toStr }),
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
      toast.success(`Sync started for ${formatDateRange(fromStr, toStr)}.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to start sync.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 bg-[#131313] p-4 rounded-xl border border-[#1a1a1a]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-['Space_Grotesk'] text-xl font-bold uppercase tracking-tight text-white">
            Sync Center
          </h3>
          <p className="text-[0.65rem] uppercase tracking-[0.15em] text-[#8f8f8f] font-medium">
            Manage Data History
          </p>
        </div>
        <RefreshCw
          className={cn(
            "h-4 w-4 text-[#ff906d]",
            isSubmitting && "animate-spin",
          )}
        />
      </div>

      <div className="grid gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <DatePicker
            label="Start Date"
            date={from}
            setDate={setFrom}
            isOpen={isFromOpen}
            setIsOpen={setIsFromOpen}
            disabledDates={{ after: today }}
            disabled={isSubmitting}
          />
          <DatePicker
            label="End Date"
            date={to}
            setDate={setTo}
            isOpen={isToOpen}
            setIsOpen={setIsToOpen}
            disabledDates={{ after: today, before: from }}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex pt-2">
          <Button
            onClick={handleSync}
            disabled={isSubmitting || !from || !to}
            className="w-full h-12 bg-[#FC4C02] text-white text-[0.7rem] uppercase font-bold tracking-[0.15em] hover:bg-[#FC4C02]/90 transition-all cursor-pointer"
          >
            {isSubmitting ? "Processing..." : "Sync Range"}
          </Button>
        </div>
      </div>

      <article className="rounded-lg bg-[#1a1a1a] p-4 border border-[#2a2a2a]/10">
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#555]">
          Current Status
        </p>
        {activeJob ? (
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full animate-pulse",
                  activeJob.status === "completed"
                    ? "bg-green-500"
                    : activeJob.status === "failed"
                      ? "bg-red-500"
                      : "bg-[#ff906d]",
                )}
              />
              <p className="font-bold uppercase tracking-tight text-white text-sm">
                {activeJob.status}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[#8f8f8f] font-medium">
                Window:{" "}
                {formatDateRange(
                  activeJob.requestedFrom,
                  activeJob.requestedTo,
                )}
              </p>
              <div className="flex items-center gap-3">
                <p className="text-[#ff906d] font-bold">
                  {activeJob.fetchedCount}{" "}
                  <span className="text-[0.6rem] font-normal uppercase opacity-70">
                    Fetched
                  </span>
                </p>
                <div className="h-3 w-px bg-[#333]" />
                <p className="text-[#ff906d] font-bold">
                  {activeJob.upsertedCount}{" "}
                  <span className="text-[0.6rem] font-normal uppercase opacity-70">
                    Stored
                  </span>
                </p>
              </div>
            </div>
            {activeJob.errorMessage ? (
              <p className="mt-2 text-red-400 bg-red-400/10 p-2 rounded text-[0.65rem] border border-red-400/20">
                {activeJob.errorMessage}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-xs text-[#555] italic">
            No active or recent sync history found.
          </p>
        )}
      </article>
    </section>
  );
}
