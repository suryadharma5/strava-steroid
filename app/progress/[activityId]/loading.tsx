import { Skeleton } from "@/components/ui/skeleton";
import { MobileShell } from "@/app/_components/mobile-shell";

export default function ActivityDetailLoading() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton (Matches layout's section spacing) */}
      <section className="bg-[#131313] p-4 pt-0">
        <Skeleton className="h-3 w-16 bg-[#2a2a2a]" /> {/* sportType placeholder */}
        <div className="mt-2 space-y-2">
          <Skeleton className="h-9 w-3/4 bg-[#2a2a2a]" /> {/* Name placeholder */}
          <Skeleton className="h-3 w-1/2 bg-[#2a2a2a]" /> {/* Date placeholder */}
        </div>
      </section>

      {/* Map Area Skeleton */}
      <section className="bg-[#131313] p-4 pt-0">
        <Skeleton className="h-[300px] w-full rounded-lg bg-[#1a1a1a]" />
      </section>

      {/* 3 Stat Cards Skeleton (Distance, Time, Pace) */}
      <section className="bg-[#131313] p-4 pt-0">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1a1a1a] p-3">
              <Skeleton className="h-[0.58rem] w-12 bg-[#2a2a2a]" />
              <Skeleton className="mt-2 h-6 w-full max-w-[60px] bg-[#2a2a2a]" />
            </div>
          ))}
        </div>
      </section>

      {/* Elevation Chart Area Skeleton */}
      <section className="bg-[#131313] p-4 pt-0">
        <div className="overflow-hidden rounded-lg bg-[#1a1a1a]">
          <div className="border-b border-[#2a2a2a] px-4 py-2">
            <Skeleton className="h-3 w-24 bg-[#2a2a2a]" />
          </div>
          <div className="p-4">
            <Skeleton className="h-[120px] w-full bg-[#202020]" />
          </div>
        </div>
      </section>

      {/* Laps/Splits Table Skeleton */}
      <section className="bg-[#131313] p-4 pt-0">
        <div className="border-t border-[#1a1a1a] pt-4">
          <Skeleton className="h-3 w-20 bg-[#2a2a2a] mb-4" />
          <div className="space-y-4">
            {/* Table Header */}
            <div className="flex justify-between border-b border-[#2a2a2a] pb-2">
              <Skeleton className="h-3 w-8 bg-[#2a2a2a]" />
              <Skeleton className="h-3 w-12 bg-[#2a2a2a]" />
              <Skeleton className="h-3 w-12 bg-[#2a2a2a]" />
              <Skeleton className="h-3 w-12 bg-[#2a2a2a] text-right" />
            </div>
            {/* Table Rows */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between border-b border-[#1a1a1a] py-2">
                <Skeleton className="h-4 w-6 bg-[#1a1a1a]" />
                <Skeleton className="h-4 w-14 bg-[#1a1a1a]" />
                <Skeleton className="h-4 w-14 bg-[#1a1a1a]" />
                <Skeleton className="h-4 w-12 bg-[#1a1a1a]" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
