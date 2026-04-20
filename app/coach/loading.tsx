import { MobileShell } from "@/app/_components/mobile-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";

export default function CoachLoading() {
  return (
    <MobileShell title="Coach" subtitle="AI Performance Analytics">
      <div className="space-y-4 px-1 pb-10">
        {/* Status Card Skeleton */}
        <section className="bg-[#131313] p-4 border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-2 rounded-full bg-[#ff906d]" />
              <Skeleton className="h-3 w-32 bg-[#1a1a1a]" />
            </div>
            <Skeleton className="h-4 w-16 bg-[#1a1a1a]" />
          </div>
          <Skeleton className="h-6 w-3/4 bg-[#1a1a1a]" />
          <Skeleton className="mt-2 h-4 w-5/6 bg-[#1a1a1a]" />
        </section>

        {/* Info Tip Skeleton */}
        <div className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-md border border-[#2a2a2a]">
          <Info className="h-4 w-4 text-[#ff906d] shrink-0 opacity-50" />
          <Skeleton className="h-3 w-full bg-[#2a2a2a]" />
        </div>

        {/* Chat Interface Skeleton */}
        <div className="h-[500px] bg-[#131313] border border-[#2a2a2a] p-4 space-y-4">
          <div className="flex gap-3">
            <Skeleton className="size-8 rounded-full bg-[#1a1a1a]" />
            <Skeleton className="h-10 w-2/3 bg-[#1a1a1a] rounded-xl" />
          </div>
          <div className="flex gap-3 justify-end">
            <Skeleton className="h-10 w-1/2 bg-[#2a2a2a] rounded-xl" />
            <Skeleton className="size-8 rounded-full bg-[#1a1a1a]" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="size-8 rounded-full bg-[#1a1a1a]" />
            <Skeleton className="h-20 w-3/4 bg-[#1a1a1a] rounded-xl" />
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
