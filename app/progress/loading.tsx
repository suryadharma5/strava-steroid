import { MobileShell } from "@/app/_components/mobile-shell";
import { ChartSkeleton, StatGridSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProgressLoading() {
  return (
    <MobileShell title="Progress" subtitle="Performance analytics">
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="p-4 bg-[#131313] space-y-4">
          <Skeleton className="h-10 w-2/3 bg-[#1a1a1a]" />
          <StatGridSkeleton cols={3} />
        </div>

        {/* Chart skeleton */}
        <ChartSkeleton />

        {/* Activity list skeleton */}
        <div className="p-4 space-y-4 bg-[#131313]">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32 bg-[#1a1a1a]" />
            <Skeleton className="h-4 w-16 bg-[#1a1a1a]" />
          </div>
          {/* Filter pills skeleton */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-8 w-16 rounded-full bg-[#1a1a1a]" />
            ))}
          </div>
          {/* List items skeleton */}
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#1a1a1a] p-4 space-y-2">
              <Skeleton className="h-3 w-20 bg-[#2a2a2a]" />
              <Skeleton className="h-6 w-3/4 bg-[#2a2a2a]" />
              <Skeleton className="h-3 w-32 bg-[#2a2a2a]" />
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
