import { z } from "zod";

const stravaLatLngSchema = z
  .union([
    z.tuple([z.coerce.number(), z.coerce.number()]),
    z.array(z.coerce.number()).length(0),
  ])
  .nullable()
  .optional()
  .transform((value) => {
    if (!value || value.length !== 2) {
      return null;
    }

    return value;
  });

export const stravaTokenResponseSchema = z.object({
  token_type: z.string(),
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number().int(),
  expires_in: z.number().int().optional(),
});

export const stravaAthleteProfileSchema = z.object({
  id: z.coerce.bigint(),
  username: z.string().nullable().optional(),
  firstname: z.string(),
  lastname: z.string(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  sex: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  profile_medium: z.string().url().nullable().optional(),
  profile: z.string().url().nullable().optional(),
});

export const stravaActivitySummarySchema = z.object({
  id: z.coerce.bigint(),
  external_id: z.string().nullable().optional(),
  upload_id: z.coerce.bigint().nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  distance: z.number(),
  moving_time: z.number().int(),
  elapsed_time: z.number().int(),
  total_elevation_gain: z.number(),
  type: z.string(),
  sport_type: z.string(),
  workout_type: z.number().nullable().optional(),
  start_date: z.string(),
  start_date_local: z.string(),
  timezone: z.string(),
  utc_offset: z.number().nullable().optional(),
  achievement_count: z.number().int(),
  kudos_count: z.number().int(),
  comment_count: z.number().int(),
  athlete_count: z.number().int(),
  photo_count: z.number().int(),
  trainer: z.boolean(),
  commute: z.boolean(),
  manual: z.boolean(),
  private: z.boolean(),
  flagged: z.boolean(),
  average_speed: z.number().nullable().optional(),
  max_speed: z.number().nullable().optional(),
  average_cadence: z.number().nullable().optional(),
  average_watts: z.number().nullable().optional(),
  weighted_average_watts: z.number().int().nullable().optional(),
  kilojoules: z.number().nullable().optional(),
  device_watts: z.boolean().nullable().optional(),
  has_heartrate: z.boolean().nullable().optional(),
  average_heartrate: z.number().nullable().optional(),
  max_heartrate: z.number().nullable().optional(),
  start_latlng: stravaLatLngSchema,
  end_latlng: stravaLatLngSchema,
  map: z
    .object({
      summary_polyline: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const stravaActivitySummaryListSchema = z.array(stravaActivitySummarySchema);

export const stravaLapSchema = z.object({
  id: z.coerce.bigint(),
  name: z.string(),
  lap_index: z.number().int(),
  distance: z.number(),
  moving_time: z.number().int(),
  elapsed_time: z.number().int(),
  total_elevation_gain: z.number(),
  start_date: z.string(),
  start_date_local: z.string(),
  average_speed: z.number().nullable().optional(),
  max_speed: z.number().nullable().optional(),
  average_cadence: z.number().nullable().optional(),
  average_watts: z.number().nullable().optional(),
  average_heartrate: z.number().nullable().optional(),
  max_heartrate: z.number().nullable().optional(),
});

export const stravaLapListSchema = z.array(stravaLapSchema);

export const stravaActivityStreamsSchema = z.record(
  z.string(),
  z.object({
    type: z.string(),
    data: z.array(z.unknown()),
    series_type: z.string().nullable().optional(),
    original_size: z.number().int().nullable().optional(),
    resolution: z.string().nullable().optional(),
  }),
);
