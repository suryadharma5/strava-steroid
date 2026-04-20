import { MobileShell } from "@/app/_components/mobile-shell";
import { ProfileHeaderSkeleton, StatGridSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <MobileShell title="Profile" subtitle="Athlete profile">
      <div className="space-y-4">
        {/* Profile Header Skeleton */}
        <ProfileHeaderSkeleton />

        {/* Quick Stats Skeleton */}
        <StatGridSkeleton cols={3} />

        {/* Sync Card Skeleton */}
        <div className="p-4 bg-[#131313] rounded-lg space-y-4">
          <Skeleton className="h-6 w-32 bg-[#1a1a1a]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 bg-[#1a1a1a]" />
            <Skeleton className="h-10 flex-1 bg-[#1a1a1a]" />
          </div>
          <Skeleton className="h-10 w-full bg-[#1a1a1a]" />
        </div>

        {/* Best Efforts Skeleton */}
        <div className="p-4 bg-[#131313] rounded-lg space-y-4">
          <Skeleton className="h-6 w-40 bg-[#1a1a1a]" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#1a1a1a] p-3 space-y-2">
                <Skeleton className="h-3 w-24 bg-[#2a2a2a]" />
                <Skeleton className="h-6 w-32 bg-[#2a2a2a]" />
                <Skeleton className="h-3 w-full max-w-[200px] bg-[#2a2a2a]" />
              </div>
            ))}
          </div>
        </div>

        {/* PRs Skeleton */}
        <div className="p-4 bg-[#131313] rounded-lg space-y-4">
          <Skeleton className="h-6 w-40 bg-[#1a1a1a]" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 bg-[#1a1a1a]" />
            ))}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
