import { ZodError } from "zod";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  createSyncJob,
  scheduleSyncJob,
  validateSyncDateRange,
} from "@/lib/strava/sync";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.athleteId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      from?: string;
      to?: string;
    };

    const { from, to } = validateSyncDateRange({
      from: body.from ?? "",
      to: body.to ?? "",
    });

    const job = await createSyncJob({
      athleteId: session.user.athleteId,
      from,
      to,
    });

    scheduleSyncJob({
      athleteId: session.user.athleteId,
      from,
      to,
      jobId: job.id,
    });

    return NextResponse.json({ job });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid sync range",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start sync" },
      { status: 500 },
    );
  }
}
