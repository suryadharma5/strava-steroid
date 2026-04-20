import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MobileShell } from "@/app/_components/mobile-shell";
import { Suspense } from "react";
import { ProgressContent } from "./_components/progress-content";
import { ProgressSkeleton } from "./_components/progress-skeleton";

type ProgressPageProps = {
  searchParams: Promise<{
    page?: string;
    sport?: string;
  }>;
};

const SPORT_FILTERS = [
  { label: "ALL", value: "all" },
  { label: "RUN", value: "run" },
  { label: "WALK", value: "walk" },
  { label: "Weight Training", value: "weighttraining" },
  { label: "BADMINTON", value: "badminton" },
  { label: "BIKE", value: "bike" },
] as const;

type SportFilterValue = (typeof SPORT_FILTERS)[number]["value"];

export default async function ProgressPage({
  searchParams,
}: ProgressPageProps) {
  const session = await auth();

  if (!session?.user?.athleteId) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const parsedPage = Number.parseInt(resolvedSearchParams.page ?? "1", 10);
  const currentPage =
    Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const selectedSport = SPORT_FILTERS.some(
    (option) => option.value === resolvedSearchParams.sport,
  )
    ? (resolvedSearchParams.sport as SportFilterValue)
    : "all";

  return (
    <MobileShell title="Progress" subtitle="Performance analytics">
      <Suspense fallback={<ProgressSkeleton />}>
        <ProgressContent 
          athleteId={session.user.athleteId} 
          currentPage={currentPage} 
          selectedSport={selectedSport} 
        />
      </Suspense>
    </MobileShell>
  );
}
