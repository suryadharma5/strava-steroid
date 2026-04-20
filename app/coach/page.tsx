import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MobileShell } from "@/app/_components/mobile-shell";
import { Info } from "lucide-react";
import { Suspense } from "react";
import { CoachContent } from "./_components/coach-content";
import { Skeleton } from "@/components/ui/skeleton";

// Inline skeleton for coach just in case coach-skeleton wasn't created separately (I'll use the one I plan to create later if needed, but for now this matches the UI)
function CoachSkeleton() {
  return (
    <div className="space-y-4 px-1 pb-10">
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
      <div className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-md border border-[#2a2a2a]">
        <Info className="h-4 w-4 text-[#ff906d] shrink-0 opacity-50" />
        <Skeleton className="h-3 w-full bg-[#2a2a2a]" />
      </div>
    </div>
  );
}

export default async function CoachPage() {
  const session = await auth();

  const athleteId = session?.user?.athleteId;

  if (!athleteId) {
    redirect("/login");
  }

  return (
    <MobileShell title="Coach" subtitle="AI Performance Analytics">
      <Suspense fallback={<CoachSkeleton />}>
        <CoachContent athleteId={athleteId} />
      </Suspense>
    </MobileShell>
  );
}
