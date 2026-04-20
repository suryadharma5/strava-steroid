import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { MobileShell } from "@/app/_components/mobile-shell";
import { FeedContent } from "./_components/feed-content";
import { FeedSkeleton } from "./_components/feed-skeleton";

type FeedPageProps = {
  searchParams: Promise<{
    sport?: string;
  }>;
};

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const session = await auth();

  if (!session?.user?.athleteId) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const selectedSport =
    resolvedSearchParams.sport && resolvedSearchParams.sport !== "all"
      ? resolvedSearchParams.sport
      : null;

  return (
    <MobileShell title="Feed" subtitle="Activity dashboard">
      <Suspense fallback={<FeedSkeleton />}>
        <FeedContent 
          athleteId={session.user.athleteId} 
          selectedSport={selectedSport} 
        />
      </Suspense>
    </MobileShell>
  );
}
