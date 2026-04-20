import NextAuth from "next-auth";
import Strava from "next-auth/providers/strava";

import { upsertAthleteFromStravaAccount } from "@/lib/athletes";
import { prisma } from "@/lib/prisma";
import { stravaAthleteProfileSchema } from "@/lib/strava/schemas";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Strava({
      clientId: process.env.STRAVA_CLIENT_ID,
      clientSecret: process.env.STRAVA_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "read,activity:read_all",
          approval_prompt: "auto",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "strava" && profile) {
        const parsedProfile = stravaAthleteProfileSchema.parse(profile);
        const athlete = await upsertAthleteFromStravaAccount({
          account,
          profile: parsedProfile,
        });

        token.athleteId = athlete.id;
        token.stravaAthleteId = athlete.stravaAthleteId.toString();
      }

      if (token.athleteId && !token.stravaAthleteId) {
        const athlete = await prisma.athlete.findUnique({
          where: { id: token.athleteId },
          select: {
            stravaAthleteId: true,
          },
        });

        if (athlete) {
          token.stravaAthleteId = athlete.stravaAthleteId.toString();
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.athleteId) {
        session.user.athleteId = token.athleteId;
        session.user.stravaAthleteId =
          typeof token.stravaAthleteId === "string"
            ? token.stravaAthleteId
            : "";
      }

      return session;
    },
  },
});
