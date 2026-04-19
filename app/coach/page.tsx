import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MobileShell } from "@/app/_components/mobile-shell";
import { CoachChat } from "@/components/coach-chat";
import { prisma } from "@/lib/prisma";
import { Brain, Info } from "lucide-react";

export default async function CoachPage() {
  const session = await auth();

  if (!session?.user?.athleteId) {
    redirect("/login");
  }

  const athlete = await prisma.athlete.findUnique({
    where: { id: session.user.athleteId },
    select: { profileMedium: true }
  });

  const initialSuggestions = [
    "How was my training this week?",
    "Am I running my easy runs too fast?",
    "What should I focus on next week?",
  ];

  return (
    <MobileShell title="Coach" subtitle="AI Performance Analytics">
      <div className="space-y-4 px-1 pb-10">
        {/* Status Card */}
        <section className="bg-[#131313] p-4 border border-[#2a2a2a] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-[#ff906d]/10 group-hover:text-[#ff906d]/20 transition-colors">
            <Brain size={80} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-[#ff906d] animate-pulse" />
              <p className="text-[0.62rem] uppercase tracking-[0.16em] text-[#ff906d] font-bold">
                Coach Axel Active
              </p>
            </div>
            <h2 className="text-xl font-['Space_Grotesk'] font-bold text-[#f5f5f5]">
              Real-time Analytics Ready
            </h2>
            <p className="mt-2 text-sm text-[#8f8f8f] max-w-[80%]">
              Axel is analyzing your last 30 days of running data to provide personalized coaching advice.
            </p>
          </div>
        </section>

        {/* Info Tip */}
        <div className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-md border border-[#2a2a2a]">
          <Info className="h-4 w-4 text-[#ff906d] shrink-0" />
          <p className="text-xs text-[#a4a4a4]">
            Axel focuses on effort levels, base building, and consistency. Ask about your recent runs.
          </p>
        </div>

        {/* Chat Interface */}
        <CoachChat 
          apiEndpoint="/api/coach" 
          initialSuggestions={initialSuggestions} 
          userProfileUrl={athlete?.profileMedium || undefined}
        />
      </div>
    </MobileShell>
  );
}
