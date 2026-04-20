import { Skeleton } from "@/components/ui/skeleton";

export function ActivityCardSkeleton() {
  return (
    <div className="bg-[#101010] p-4 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 bg-[#1a1a1a]" />
        <Skeleton className="h-8 w-3/4 bg-[#1a1a1a]" />
        <Skeleton className="h-3 w-1/2 bg-[#1a1a1a]" />
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4">
        <Skeleton className="h-10 w-full bg-[#1a1a1a]" />
        <Skeleton className="h-10 w-full bg-[#1a1a1a]" />
        <Skeleton className="h-10 w-full bg-[#1a1a1a]" />
      </div>
    </div>
  );
}

export function StatGridSkeleton({ cols = 3 }: { cols?: number }) {
  return (
    <div className={`grid grid-cols-${cols} gap-3 p-4`}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="bg-[#131313] p-3 space-y-2">
          <Skeleton className="h-3 w-16 bg-[#1a1a1a]" />
          <Skeleton className="h-8 w-full bg-[#1a1a1a]" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-[#131313] p-4 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-32 bg-[#1a1a1a]" />
        <Skeleton className="h-4 w-20 bg-[#1a1a1a]" />
      </div>
      <Skeleton className="h-48 w-full bg-[#1a1a1a] rounded-lg" />
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <section className="bg-[#131313] p-4 rounded-lg space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton className="size-16 bg-[#1a1a1a]" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-20 bg-[#1a1a1a]" />
          <Skeleton className="h-10 w-3/4 bg-[#1a1a1a]" />
          <Skeleton className="h-3 w-1/2 bg-[#1a1a1a]" />
        </div>
      </div>
      <Skeleton className="h-4 w-full bg-[#1a1a1a]" />
    </section>
  );
}
