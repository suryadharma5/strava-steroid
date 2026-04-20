"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function clearChatHistory(activityId?: string) {
  const session = await auth();
  if (!session?.user?.athleteId) {
    throw new Error("Unauthorized");
  }

  const athleteId = session.user.athleteId;

  const existingChat = await prisma.coachChat.findFirst({
    where: { 
      athleteId,
      activityId: activityId || null,
    },
  });

  if (existingChat) {
    await prisma.coachChat.update({
      where: { id: existingChat.id },
      data: { messages: [] },
    });
  } else {
    await prisma.coachChat.create({
      data: {
        athleteId,
        activityId: activityId || null,
        messages: [],
      },
    });
  }

  if (activityId) {
    revalidatePath(`/progress/${activityId}`);
  } else {
    revalidatePath("/coach");
  }
}
