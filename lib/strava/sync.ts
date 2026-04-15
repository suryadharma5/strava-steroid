import "server-only";

import type { Prisma } from "@prisma/client";
import { after } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { fetchStravaJson } from "@/lib/strava/client";
import {
  stravaActivityDetailSchema,
  stravaActivitySummaryListSchema,
} from "@/lib/strava/schemas";

const STRAVA_PAGE_SIZE = 200;
const MAX_SYNC_RANGE_DAYS = 366;

const dateRangeSchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  })
  .superRefine(({ from, to }, ctx) => {
    const normalizedFrom = new Date(from);
    normalizedFrom.setHours(0, 0, 0, 0);

    const normalizedTo = new Date(to);
    normalizedTo.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (normalizedTo > today) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: '"to" date cannot be later than today.',
      });
    }

    if (normalizedFrom > normalizedTo) {
      ctx.addIssue({
        code: "custom",
        path: ["from"],
        message: '"from" date must be before or equal to "to".',
      });
    }

    const diffDays = Math.ceil(
      (normalizedTo.getTime() - normalizedFrom.getTime()) /
        (24 * 60 * 60 * 1000),
    );

    if (diffDays > MAX_SYNC_RANGE_DAYS) {
      ctx.addIssue({
        code: "custom",
        path: ["from"],
        message: "Sync range cannot exceed 1 year.",
      });
    }
  })
  .transform(({ from, to }) => {
    const normalizedFrom = new Date(from);
    normalizedFrom.setHours(0, 0, 0, 0);

    const normalizedTo = new Date(to);
    normalizedTo.setHours(23, 59, 59, 999);

    return {
      from: normalizedFrom,
      to: normalizedTo,
    };
  });

function toJsonValue(value: unknown) {
  return JSON.parse(
    JSON.stringify(value, (_key, nestedValue) =>
      typeof nestedValue === "bigint" ? nestedValue.toString() : nestedValue,
    ),
  ) as Prisma.InputJsonValue;
}

async function upsertActivity(
  athleteId: string,
  activity: z.infer<typeof stravaActivitySummaryListSchema>[number],
) {
  await prisma.activity.upsert({
    where: {
      stravaActivityId: activity.id,
    },
    update: {
      athleteId,
      externalId: activity.external_id ?? null,
      uploadId: activity.upload_id ?? null,
      name: activity.name,
      description: activity.description ?? null,
      type: activity.type,
      sportType: activity.sport_type,
      timezone: activity.timezone,
      startDate: new Date(activity.start_date),
      startDateLocal: new Date(activity.start_date_local),
      utcOffset:
        activity.utc_offset !== null && activity.utc_offset !== undefined
          ? Math.round(activity.utc_offset)
          : null,
      distance: activity.distance,
      movingTime: activity.moving_time,
      elapsedTime: activity.elapsed_time,
      totalElevationGain: activity.total_elevation_gain,
      achievementCount: activity.achievement_count,
      kudosCount: activity.kudos_count,
      commentCount: activity.comment_count,
      athleteCount: activity.athlete_count,
      photoCount: activity.photo_count,
      trainer: activity.trainer,
      commute: activity.commute,
      manual: activity.manual,
      isPrivate: activity.private,
      flagged: activity.flagged,
      averageSpeed: activity.average_speed ?? null,
      maxSpeed: activity.max_speed ?? null,
      averageCadence: activity.average_cadence ?? null,
      averageWatts: activity.average_watts ?? null,
      weightedAverageWatts: activity.weighted_average_watts ?? null,
      kilojoules: activity.kilojoules ?? null,
      deviceWatts: activity.device_watts ?? null,
      hasHeartrate: activity.has_heartrate ?? null,
      averageHeartrate: activity.average_heartrate ?? null,
      maxHeartrate: activity.max_heartrate ?? null,
      startLatitude: activity.start_latlng?.[0] ?? null,
      startLongitude: activity.start_latlng?.[1] ?? null,
      endLatitude: activity.end_latlng?.[0] ?? null,
      endLongitude: activity.end_latlng?.[1] ?? null,
      mapSummaryPolyline: activity.map?.summary_polyline ?? null,
      rawPayload: toJsonValue(activity),
      syncedAt: new Date(),
    },
    create: {
      athleteId,
      stravaActivityId: activity.id,
      externalId: activity.external_id ?? null,
      uploadId: activity.upload_id ?? null,
      name: activity.name,
      description: activity.description ?? null,
      type: activity.type,
      sportType: activity.sport_type,
      timezone: activity.timezone,
      startDate: new Date(activity.start_date),
      startDateLocal: new Date(activity.start_date_local),
      utcOffset:
        activity.utc_offset !== null && activity.utc_offset !== undefined
          ? Math.round(activity.utc_offset)
          : null,
      distance: activity.distance,
      movingTime: activity.moving_time,
      elapsedTime: activity.elapsed_time,
      totalElevationGain: activity.total_elevation_gain,
      achievementCount: activity.achievement_count,
      kudosCount: activity.kudos_count,
      commentCount: activity.comment_count,
      athleteCount: activity.athlete_count,
      photoCount: activity.photo_count,
      trainer: activity.trainer,
      commute: activity.commute,
      manual: activity.manual,
      isPrivate: activity.private,
      flagged: activity.flagged,
      averageSpeed: activity.average_speed ?? null,
      maxSpeed: activity.max_speed ?? null,
      averageCadence: activity.average_cadence ?? null,
      averageWatts: activity.average_watts ?? null,
      weightedAverageWatts: activity.weighted_average_watts ?? null,
      kilojoules: activity.kilojoules ?? null,
      deviceWatts: activity.device_watts ?? null,
      hasHeartrate: activity.has_heartrate ?? null,
      averageHeartrate: activity.average_heartrate ?? null,
      maxHeartrate: activity.max_heartrate ?? null,
      startLatitude: activity.start_latlng?.[0] ?? null,
      startLongitude: activity.start_latlng?.[1] ?? null,
      endLatitude: activity.end_latlng?.[0] ?? null,
      endLongitude: activity.end_latlng?.[1] ?? null,
      mapSummaryPolyline: activity.map?.summary_polyline ?? null,
      rawPayload: toJsonValue(activity),
    },
  });
}

export async function fetchAndStoreActivityDetail(
  stravaActivityId: bigint,
  athleteId: string,
) {
  const payload = await fetchStravaJson<unknown>(
    athleteId,
    `/activities/${stravaActivityId}`,
  );

  const detail = stravaActivityDetailSchema.parse(payload);

  await prisma.$transaction(async (tx) => {
    const activityRecord = await tx.activity.update({
      where: { stravaActivityId },
      data: {
        description: detail.description,
        calories: detail.calories,
        elevHigh: detail.elev_high,
        elevLow: detail.elev_low,
        maxWatts: detail.max_watts,
        averageWatts: detail.average_watts,
        weightedAverageWatts: detail.weighted_average_watts,
        kilojoules: detail.kilojoules,
        deviceWatts: detail.device_watts,
        averageCadence: detail.average_cadence,
        averageTemp: detail.average_temp,
        prCount: detail.pr_count,
        sufferScore: detail.suffer_score,
        gearId: detail.gear_id,
        deviceName: detail.device_name,
        detailFetched: true,
      },
    });

    if (detail.laps && detail.laps.length > 0) {
      for (const lap of detail.laps) {
        await tx.lap.upsert({
          where: { stravaLapId: lap.id },
          update: {
            lapIndex: lap.lap_index,
            name: lap.name,
            distance: lap.distance,
            movingTime: lap.moving_time,
            elapsedTime: lap.elapsed_time,
            totalElevationGain: lap.total_elevation_gain,
            startDate: new Date(lap.start_date),
            startDateLocal: new Date(lap.start_date_local),
            averageSpeed: lap.average_speed,
            maxSpeed: lap.max_speed,
            averageCadence: lap.average_cadence,
            averageWatts: lap.average_watts,
            averageHeartrate: lap.average_heartrate,
            maxHeartrate: lap.max_heartrate,
            rawPayload: toJsonValue(lap),
          },
          create: {
            activityId: activityRecord.id,
            stravaLapId: lap.id,
            lapIndex: lap.lap_index,
            name: lap.name,
            distance: lap.distance,
            movingTime: lap.moving_time,
            elapsedTime: lap.elapsed_time,
            totalElevationGain: lap.total_elevation_gain,
            startDate: new Date(lap.start_date),
            startDateLocal: new Date(lap.start_date_local),
            averageSpeed: lap.average_speed,
            maxSpeed: lap.max_speed,
            averageCadence: lap.average_cadence,
            averageWatts: lap.average_watts,
            averageHeartrate: lap.average_heartrate,
            maxHeartrate: lap.max_heartrate,
            rawPayload: toJsonValue(lap),
          },
        });
      }
    }

    if (detail.splits_metric && detail.splits_metric.length > 0) {
      await tx.splitMetric.deleteMany({
        where: { activityId: activityRecord.id },
      });

      await tx.splitMetric.createMany({
        data: detail.splits_metric.map((split) => ({
          activityId: activityRecord.id,
          split: split.split,
          distance: split.distance,
          elapsedTime: split.elapsed_time,
          movingTime: split.moving_time,
          elevationDifference: split.elevation_difference,
          averageSpeed: split.average_speed,
          paceZone: split.pace_zone,
        })),
      });
    }
  });
}

export function validateSyncDateRange(input: { from: string; to: string }) {
  return dateRangeSchema.parse(input);
}

export async function createSyncJob(params: {
  athleteId: string;
  from: Date;
  to: Date;
}) {
  return prisma.syncJob.create({
    data: {
      athleteId: params.athleteId,
      status: "queued",
      requestedFrom: params.from,
      requestedTo: params.to,
    },
  });
}

export async function getLatestSyncJob(athleteId: string) {
  return prisma.syncJob.findFirst({
    where: { athleteId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSyncJobStatus(jobId: string, athleteId: string) {
  return prisma.syncJob.findFirst({
    where: {
      id: jobId,
      athleteId,
    },
  });
}

export function scheduleSyncJob(params: {
  athleteId: string;
  from: Date;
  to: Date;
  jobId: string;
  maxPages?: number;
}) {
  after(async () => {
    await runSyncJob(params);
  });
}

async function runSyncJob(params: {
  athleteId: string;
  from: Date;
  to: Date;
  jobId: string;
  maxPages?: number;
}) {
  const { athleteId, from, to, jobId, maxPages } = params;
  let fetchedCount = 0;
  let upsertedCount = 0;

  try {
    await prisma.syncJob.update({
      where: { id: jobId },
      data: {
        status: "running",
      },
    });

    const afterTimestamp = Math.floor(from.getTime() / 1000);
    const beforeTimestamp = Math.floor(to.getTime() / 1000);

    for (let page = 1; ; page += 1) {
      const payload = await fetchStravaJson<unknown>(
        athleteId,
        `/athlete/activities?after=${afterTimestamp}&before=${beforeTimestamp}&per_page=${STRAVA_PAGE_SIZE}&page=${page}`,
      );

      const activities = stravaActivitySummaryListSchema.parse(payload);
      fetchedCount += activities.length;

      for (const activity of activities) {
        await upsertActivity(athleteId, activity);
        upsertedCount += 1;
      }

      await prisma.syncJob.update({
        where: { id: jobId },
        data: {
          fetchedCount,
          upsertedCount,
          currentPage: page,
        },
      });

      if (activities.length < STRAVA_PAGE_SIZE || (maxPages && page >= maxPages)) {
        break;
      }
    }

    const completedAt = new Date();

    await prisma.$transaction([
      prisma.syncJob.update({
        where: { id: jobId },
        data: {
          status: "completed",
          fetchedCount,
          upsertedCount,
          finishedAt: completedAt,
        },
      }),
      prisma.athlete.update({
        where: { id: athleteId },
        data: {
          lastSyncedAt: completedAt,
          lastSyncRangeStart: from,
          lastSyncRangeEnd: to,
          lastSyncActivityCount: upsertedCount,
        },
      }),
    ]);
  } catch (error) {
    await prisma.syncJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        fetchedCount,
        upsertedCount,
        finishedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : "Sync failed",
      },
    });
  }
}
