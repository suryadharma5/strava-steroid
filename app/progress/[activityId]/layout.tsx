import Link from "next/link";
import { MobileShell } from "@/app/_components/mobile-shell";

export default function ActivityDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileShell title="Activity" subtitle="Workout details">
      <div className="space-y-4">
        {/* Instant Header with Back Button */}
        <section className="bg-[#131313] p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold uppercase tracking-tight text-[#ff906d]">
              Workout Details
            </h2>
            <Link
              href="/progress"
              className="shrink-0 text-xs font-semibold uppercase tracking-widest text-[#ff906d] border-2 border-[#ff906d] px-3 py-1.5 hover:bg-[#ff906d] hover:text-black transition-all"
            >
              Back
            </Link>
          </div>
        </section>

        {/* Dynamic Content Boundary */}
        {children}
      </div>
    </MobileShell>
  );
}
