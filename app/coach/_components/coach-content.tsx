import { prisma } from "@/lib/prisma";
import { Info } from "lucide-react";
import { CoachChat } from "@/components/coach-chat";
import { ClearChatButton } from "./clear-chat-button";
import { clearChatHistory } from "../actions";

type CoachContentProps = {
  athleteId: string;
};

export async function CoachContent({ athleteId }: CoachContentProps) {
  const [athlete, chatData] = await Promise.all([
    prisma.athlete.findUnique({
      where: { id: athleteId },
      select: { profileMedium: true }
    }),
    prisma.coachChat.findFirst({
      where: { 
        athleteId: athleteId,
        activityId: null
      }
    })
  ]);

  const initialMessages = (chatData?.messages as any[]) || [];

  const initialSuggestions = [
    "How was my training this week?",
    "Am I running my easy runs too fast?",
    "What should I focus on next week?",
  ];

  return (
    <div className="space-y-4 px-1 pb-10">
      {/* Status Card */}
      <section className="bg-[#131313] p-4 border border-[#2a2a2a] relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#ff906d] animate-pulse" />
              <p className="text-[0.62rem] uppercase tracking-[0.16em] text-[#ff906d] font-bold">
                Coach Axel Active
              </p>
            </div>
            
            <ClearChatButton onClear={clearChatHistory} />
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
        <div className="shrink-0">
          <Info className="h-4 w-4 text-[#ff906d]" />
        </div>
        <p className="text-xs text-[#a4a4a4]">
          Axel focuses on effort levels, base building, and consistency. Ask about your recent runs.
        </p>
      </div>

      {/* Chat Interface */}
      <div className="h-[500px]">
        <CoachChat 
          key={initialMessages.length}
          apiEndpoint="/api/coach" 
          initialMessages={initialMessages}
          initialSuggestions={initialSuggestions} 
          userProfileUrl={athlete?.profileMedium || undefined}
        />
      </div>
    </div>
  );
}
