import { HRZoneDistribution, formatDuration } from "@/lib/activity-utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ActivityHeartRateZonesProps {
  zones: HRZoneDistribution[];
  isConfigured?: boolean;
}

export function ActivityHeartRateZones({
  zones,
  isConfigured = true,
}: ActivityHeartRateZonesProps) {
  const totalSeconds = zones.reduce((sum, z) => sum + z.seconds, 0);

  if (totalSeconds === 0) return null;

  if (!isConfigured) {
    return (
      <section className="bg-[#131313] p-4 rounded-xl border border-[#1a1a1a] overflow-hidden relative group">
        <div className="flex flex-col items-center text-center space-y-4 py-6">
          <div className="size-12 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-[#2a2a2a] group-hover:border-[#ff906d]/30 transition-colors">
            <div className="size-2 rounded-full bg-[#ff906d] animate-pulse" />
          </div>

          <div className="max-w-60 space-y-1">
            <h3 className="font-['Space_Grotesk'] text-lg font-bold uppercase tracking-tight text-white">
              HR Zones Not Configured
            </h3>
            <p className="text-[0.65rem] uppercase tracking-[0.12em] text-[#8f8f8f] leading-relaxed">
              Define your manual heart rate zones in your profile to see
              intensity distribution for this activity.
            </p>
          </div>

          <Link
            href="/profile"
            className="flex items-center gap-2 bg-[#ff906d] text-black text-[0.6rem] uppercase font-bold tracking-[0.15em] px-6 py-3 rounded-full hover:bg-[#ff7a4d] transition-all shadow-[0_4px_20px_-5px_rgba(255,144,109,0.3)]"
          >
            Configure Zones
            <ArrowRight className="size-3" />
          </Link>
        </div>

        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff906d]/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />
      </section>
    );
  }

  return (
    <section className="space-y-4 bg-[#131313] p-4 rounded-xl border border-[#1a1a1a]">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="font-['Space_Grotesk'] text-xl font-bold uppercase tracking-tight text-white">
            Intensity Distribution
          </h3>
          <p className="text-[0.65rem] uppercase tracking-[0.15em] text-[#8f8f8f] font-medium">
            Heart rate analytics
          </p>
        </div>
        <p className="text-[0.6rem] uppercase tracking-widest text-[#555]">
          {formatDuration(totalSeconds)} total
        </p>
      </div>

      <div className="flex h-5 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
        {zones.map((z, i) => (
          <div
            key={i}
            style={{ width: `${z.percentage}%`, backgroundColor: z.color }}
            className="h-full border-r border-[#131313]/20 last:border-0 transition-all hover:opacity-80 cursor-default"
            title={`${z.label}: ${z.percentage}%`}
          />
        ))}
      </div>

      <div className="space-y-2">
        {zones.map((z, i) => (
          <div key={i} className="group flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="size-2 rounded-full"
                style={{ backgroundColor: z.color }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold uppercase tracking-widest text-[#c7c7c7] group-hover:text-white transition-colors">
                  {z.label}
                </span>
                <span className="text-xs text-[#555] uppercase tracking-tighter">
                  {z.rule} BPM
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 text-right">
              <span className="text-sm font-bold text-white">
                {formatDuration(z.seconds)}
              </span>
              <span className="text-xs font-medium text-[#ff906d] w-8">
                {z.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
