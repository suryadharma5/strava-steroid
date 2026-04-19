"use client";

import { DEFAULT_HR_ZONES, validateHrZones } from "@/lib/activity-utils";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateAthleteHrSettings } from "../actions";
import { Button } from "@/components/ui/button";

interface HeartRateSettingsProps {
  athlete: {
    hrZones: any;
  };
}

export function HeartRateSettings({ athlete }: HeartRateSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [zones, setZones] = useState<
    Array<{ label: string; rule: string; color: string }>
  >(() => {
    if (Array.isArray(athlete.hrZones) && athlete.hrZones.length === 5) {
      return athlete.hrZones;
    }
    return DEFAULT_HR_ZONES;
  });

  const updateZone = (
    index: number,
    field: "label" | "rule",
    value: string,
  ) => {
    const next = [...zones];
    next[index] = { ...next[index], [field]: value };
    setZones(next);
  };

  const handleSave = () => {
    // Client-side validation before sending to server
    const validation = validateHrZones(zones);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    startTransition(async () => {
      try {
        await updateAthleteHrSettings({ hrZones: zones });
        toast.success("Manual heart rate zones updated");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update zones",
        );
      }
    });
  };

  return (
    <section className="space-y-6 bg-[#131313] p-4 rounded-xl border border-[#1a1a1a]">
      <div>
        <h3 className="font-['Space_Grotesk'] text-xl font-bold uppercase tracking-tight text-white">
          Manual Heart Rate Zones
        </h3>
        <p className="text-[0.65rem] uppercase tracking-[0.15em] text-[#8f8f8f] font-medium">
          Define your own 5-zone intensity model
        </p>
      </div>

      <div className="space-y-4">
        {zones.map((z, i) => (
          <div
            key={i}
            className="group relative space-y-2 rounded-lg border border-transparent bg-[#1a1a1a] p-3 transition-all hover:border-[#2a2a2a]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-widest text-[#555]">
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: z.color }}
                />
                Zone {i + 1}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <input
                  value={z.label}
                  placeholder="Label (e.g. Recovery)"
                  onChange={(e) => updateZone(i, "label", e.target.value)}
                  className="h-10 w-full rounded-md bg-[#131313] px-3 text-[0.7rem] uppercase font-bold tracking-tight text-white outline-none border border-[#2a2a2a] focus:border-[#ff906d]"
                />
              </div>
              <div className="space-y-1">
                <input
                  value={z.rule}
                  placeholder="Rule (e.g. >180, 120-140)"
                  onChange={(e) => updateZone(i, "rule", e.target.value)}
                  className="h-10 w-full rounded-md bg-[#131313] px-3 text-[0.7rem] font-medium text-white outline-none border border-[#2a2a2a] focus:border-[#ff906d]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-[#1a1a1a]/50 p-3 border border-[#2a2a2a]/20">
        <p className="text-[0.6rem] font-bold uppercase tracking-widest text-[#555] mb-2">
          Rule Syntax Examples
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[0.6rem] uppercase tracking-tighter text-[#8f8f8f]">
          <p>
            <span className="text-white font-mono">120-140</span> : Range
          </p>
          <p>
            <span className="text-white font-mono">&gt;= 150</span> : Greater
            than equal
          </p>
          <p>
            <span className="text-white font-mono">&lt; 100</span> : Less than
          </p>
          <p>
            <span className="text-white font-mono">&gt; 180</span> : Greater
            than
          </p>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={isPending}
        className="h-12 w-full bg-[#ff906d] text-black text-[0.7rem] uppercase font-bold tracking-[0.15em] cursor-pointer hover:bg-[#ff7a4d] transition-all shadow-[0_4px_20px_-5px_rgba(255,144,109,0.3)]"
      >
        {isPending ? "Validating & Saving..." : "Save Custom Zones"}
      </Button>
    </section>
  );
}
