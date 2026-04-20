import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { auth } from "@/auth";
import { MobileShell } from "@/app/_components/mobile-shell";
import { prisma } from "@/lib/prisma";
import { TrainingLog } from "@/app/feed/_components/training-log";

export default async function TrainingLogPage() {
  const session = await auth();

  if (!session?.user?.athleteId) {
    redirect("/login");
  }

  const activities = await prisma.activity.findMany({
    where: {
      athleteId: session.user.athleteId,
      startDate: {
        gte: new Date(new Date().setDate(new Date().getDate() - 13 * 7)), // 12 weeks + buffer
      },
    },
    orderBy: {
      startDate: "desc",
    },
    select: {
      id: true,
      sportType: true,
      movingTime: true,
      startDate: true,
    }
  });

  return (
    <MobileShell title="Training Log" subtitle="12-Week Visual Overview">
      <div className="flex flex-col h-full space-y-4 px-1 pb-10">
        <div className="px-3 pt-2">
          <Link
            href="/feed"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#ff906d] hover:brightness-110 transition-all font-['Space_Grotesk'] uppercase tracking-[0.2em]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Feed
          </Link>
        </div>

        <div className="mt-2">
            <TrainingLog activities={activities} />
        </div>
        
        <div className="px-4 py-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-sm">
            <h4 className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-[0.2em] text-[#ff906d] mb-3">
                How to read
            </h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#00D084]" />
                    <span className="text-[0.65rem] text-[#8f8f8f] uppercase font-medium">Running</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#00AAAA]" />
                    <span className="text-[0.65rem] text-[#8f8f8f] uppercase font-medium">Walking</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF6B35]" />
                    <span className="text-[0.65rem] text-[#8f8f8f] uppercase font-medium">Strength</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#9F9F9F]" />
                    <span className="text-[0.65rem] text-[#8f8f8f] uppercase font-medium">Other</span>
                </div>
            </div>
            <p className="mt-4 text-[0.6rem] text-[#666] leading-relaxed">
                The number inside each circle represents the total duration. If multiple activities occurred on the same day, a badge indicates the count.
            </p>
        </div>
      </div>
    </MobileShell>
  );
}
