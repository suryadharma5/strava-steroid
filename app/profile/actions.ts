"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateHrZones } from "@/lib/activity-utils";

export async function updateAthleteHrSettings(data: {
  hrZones: Array<{ label: string; rule: string; color?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.athleteId) {
    throw new Error("Unauthorized");
  }

  // Validate the manual rules before saving
  const validation = validateHrZones(data.hrZones);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  await prisma.athlete.update({
    where: { id: session.user.athleteId },
    data: {
      hrZones: data.hrZones,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/progress");
}
