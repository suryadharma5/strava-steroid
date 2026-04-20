import "server-only";

import { z } from "zod";

const databaseUrlSchema = z
  .string()
  .min(1, "DATABASE_URL is required")
  .superRefine((value, ctx) => {
    if (value.includes("\\@")) {
      ctx.addIssue({
        code: "custom",
        message:
          "DATABASE_URL contains '\\@'. Do not escape '@' in the connection string; URL-encode password characters only when needed.",
      });
      return;
    }

    try {
      new URL(value);
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "DATABASE_URL must be a valid URL",
      });
    }
  });

const envSchema = z.object({
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  DATABASE_URL: databaseUrlSchema,
  STRAVA_CLIENT_ID: z.string().min(1, "STRAVA_CLIENT_ID is required"),
  STRAVA_CLIENT_SECRET: z.string().min(1, "STRAVA_CLIENT_SECRET is required"),
});

function validateEnv() {
  return envSchema.parse({
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    STRAVA_CLIENT_ID: process.env.STRAVA_CLIENT_ID,
    STRAVA_CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  });
}

export const env = validateEnv();
