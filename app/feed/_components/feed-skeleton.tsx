import { ActivityCardSkeleton, StatGridSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {/* Training Log teaser skeleton */}
      <div className="bg-[#131313] p-4 border-b border-[#2a2a2a] flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 bg-[#1a1a1a]" />
          <Skeleton className="h-6 w-32 bg-[#1a1a1a]" />
        </div>
        <Skeleton className="size-8 rounded-full bg-[#1a1a1a]" />
      </div>

      {/* Heatmap skeleton */}
      <div className="p-4 bg-[#131313]">
        <Skeleton className="h-[120px] w-full bg-[#1a1a1a] rounded-lg" />
      </div>

      {/* Recent activity skeleton */}
      <div className="p-4 space-y-4">
        <Skeleton className="h-6 w-40 bg-[#1a1a1a]" />
        <ActivityCardSkeleton />
      </div>

      {/* Weekly summary skeleton */}
      <StatGridSkeleton cols={2} />
    </div>
  );
}
