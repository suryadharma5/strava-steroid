import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";


import { auth } from "@/auth";
import { getSyncJobStatus } from "@/lib/strava/sync";

type SyncStatusRouteProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: SyncStatusRouteProps,
) {
  const session = await auth();

  if (!session?.user?.athleteId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;
  const job = await getSyncJobStatus(jobId, session.user.athleteId);

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ job });
}
