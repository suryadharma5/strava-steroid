import "server-only";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { stravaTokenResponseSchema } from "@/lib/strava/schemas";

const STRAVA_OAUTH_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_BASE_URL = "https://www.strava.com/api/v3";
const ACCESS_TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

export class StravaApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(message);
    this.name = "StravaApiError";
  }
}

async function refreshStravaAccessToken(athleteId: string) {
  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    select: {
      id: true,
      refreshToken: true,
    },
  });

  if (!athlete) {
    throw new Error(`Athlete ${athleteId} not found`);
  }

  const response = await fetch(STRAVA_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: athlete.refreshToken,
    }),
    cache: "no-store",
  });

  const body = await response.text();

  if (!response.ok) {
    throw new StravaApiError(
      "Failed to refresh Strava access token",
      response.status,
      body,
    );
  }

  const tokens = stravaTokenResponseSchema.parse(JSON.parse(body));

  await prisma.athlete.update({
    where: { id: athleteId },
    data: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: new Date(tokens.expires_at * 1000),
    },
  });

  return tokens.access_token;
}

export async function getValidStravaAccessToken(athleteId: string) {
  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    select: {
      accessToken: true,
      tokenExpiresAt: true,
    },
  });

  if (!athlete) {
    throw new Error(`Athlete ${athleteId} not found`);
  }

  if (
    athlete.tokenExpiresAt.getTime() - Date.now() >
    ACCESS_TOKEN_REFRESH_BUFFER_MS
  ) {
    return athlete.accessToken;
  }

  return refreshStravaAccessToken(athleteId);
}

export async function fetchStravaJson<T>(
  athleteId: string,
  path: string,
  init?: RequestInit,
) {
  const accessToken = await getValidStravaAccessToken(athleteId);
  const response = await fetch(`${STRAVA_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  const body = await response.text();

  if (!response.ok) {
    throw new StravaApiError(
      `Strava request failed for ${path}`,
      response.status,
      body,
    );
  }

  return JSON.parse(body) as T;
}
