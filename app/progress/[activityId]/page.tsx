import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ActivityDetailContent } from "./_components/activity-detail-content";
import ActivityDetailLoading from "./loading";

type ActivityDetailPageProps = {
  params: Promise<{
    activityId: string;
  }>;
};

export default async function ActivityDetailPage({
  params,
}: ActivityDetailPageProps) {
  const session = await auth();

  if (!session?.user?.athleteId) {
    redirect("/login");
  }

  const { activityId } = await params;
  const athleteId = session.user.athleteId;

  return (
    <Suspense fallback={<ActivityDetailLoading />}>
      <ActivityDetailContent 
        activityId={activityId} 
        athleteId={athleteId} 
      />
    </Suspense>
  );
}
