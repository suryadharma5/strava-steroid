import "server-only";

import type { Account } from "next-auth";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { stravaAthleteProfileSchema } from "@/lib/strava/schemas";

type StravaProfile = z.infer<typeof stravaAthleteProfileSchema>;

export async function upsertAthleteFromStravaAccount(params: {
  account: Account;
  profile: StravaProfile;
}) {
  const { account, profile } = params;
  const fullName = `${profile.firstname} ${profile.lastname}`.trim();
  const scopes = account.scope
    ? account.scope
        .split(",")
        .map((scope) => scope.trim())
        .filter(Boolean)
    : ["read", "activity:read_all"];

  return prisma.athlete.upsert({
    where: {
      stravaAthleteId: profile.id,
    },
    update: {
      username: profile.username ?? null,
      firstName: profile.firstname,
      lastName: profile.lastname,
      fullName,
      city: profile.city ?? null,
      state: profile.state ?? null,
      country: profile.country ?? null,
      sex: profile.sex ?? null,
      bio: profile.bio ?? null,
      profileMedium: profile.profile_medium ?? null,
      profile: profile.profile ?? null,
      accessToken: account.access_token ?? "",
      refreshToken: account.refresh_token ?? "",
      tokenExpiresAt: new Date((account.expires_at ?? 0) * 1000),
      scopes,
    },
    create: {
      stravaAthleteId: profile.id,
      username: profile.username ?? null,
      firstName: profile.firstname,
      lastName: profile.lastname,
      fullName,
      city: profile.city ?? null,
      state: profile.state ?? null,
      country: profile.country ?? null,
      sex: profile.sex ?? null,
      bio: profile.bio ?? null,
      profileMedium: profile.profile_medium ?? null,
      profile: profile.profile ?? null,
      accessToken: account.access_token ?? "",
      refreshToken: account.refresh_token ?? "",
      tokenExpiresAt: new Date((account.expires_at ?? 0) * 1000),
      scopes,
    },
  });
}

export async function getAthleteById(id: string) {
  return prisma.athlete.findUnique({
    where: { id },
  });
}
