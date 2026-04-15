-- CreateTable
CREATE TABLE "Athlete" (
    "id" TEXT NOT NULL,
    "stravaAthleteId" BIGINT NOT NULL,
    "username" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "sex" TEXT,
    "bio" TEXT,
    "profileMedium" TEXT,
    "profile" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "scopes" TEXT[],
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Athlete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "stravaActivityId" BIGINT NOT NULL,
    "externalId" TEXT,
    "uploadId" BIGINT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "sportType" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "startDateLocal" TIMESTAMP(3) NOT NULL,
    "utcOffset" INTEGER,
    "distance" DOUBLE PRECISION NOT NULL,
    "movingTime" INTEGER NOT NULL,
    "elapsedTime" INTEGER NOT NULL,
    "totalElevationGain" DOUBLE PRECISION NOT NULL,
    "achievementCount" INTEGER NOT NULL,
    "kudosCount" INTEGER NOT NULL,
    "commentCount" INTEGER NOT NULL,
    "athleteCount" INTEGER NOT NULL,
    "photoCount" INTEGER NOT NULL,
    "trainer" BOOLEAN NOT NULL,
    "commute" BOOLEAN NOT NULL,
    "manual" BOOLEAN NOT NULL,
    "isPrivate" BOOLEAN NOT NULL,
    "flagged" BOOLEAN NOT NULL,
    "averageSpeed" DOUBLE PRECISION,
    "maxSpeed" DOUBLE PRECISION,
    "averageCadence" DOUBLE PRECISION,
    "averageWatts" DOUBLE PRECISION,
    "weightedAverageWatts" INTEGER,
    "kilojoules" DOUBLE PRECISION,
    "deviceWatts" BOOLEAN,
    "hasHeartrate" BOOLEAN,
    "averageHeartrate" DOUBLE PRECISION,
    "maxHeartrate" DOUBLE PRECISION,
    "startLatitude" DOUBLE PRECISION,
    "startLongitude" DOUBLE PRECISION,
    "endLatitude" DOUBLE PRECISION,
    "endLongitude" DOUBLE PRECISION,
    "mapSummaryPolyline" TEXT,
    "rawPayload" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lap" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "stravaLapId" BIGINT NOT NULL,
    "lapIndex" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "movingTime" INTEGER NOT NULL,
    "elapsedTime" INTEGER NOT NULL,
    "totalElevationGain" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "startDateLocal" TIMESTAMP(3) NOT NULL,
    "averageSpeed" DOUBLE PRECISION,
    "maxSpeed" DOUBLE PRECISION,
    "averageCadence" DOUBLE PRECISION,
    "averageWatts" DOUBLE PRECISION,
    "averageHeartrate" DOUBLE PRECISION,
    "maxHeartrate" DOUBLE PRECISION,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stream" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "seriesType" TEXT,
    "resolution" TEXT,
    "originalSize" INTEGER,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Athlete_stravaAthleteId_key" ON "Athlete"("stravaAthleteId");

-- CreateIndex
CREATE INDEX "Athlete_lastSyncedAt_idx" ON "Athlete"("lastSyncedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_stravaActivityId_key" ON "Activity"("stravaActivityId");

-- CreateIndex
CREATE INDEX "Activity_athleteId_startDate_idx" ON "Activity"("athleteId", "startDate" DESC);

-- CreateIndex
CREATE INDEX "Activity_sportType_startDate_idx" ON "Activity"("sportType", "startDate" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Lap_stravaLapId_key" ON "Lap"("stravaLapId");

-- CreateIndex
CREATE INDEX "Lap_activityId_lapIndex_idx" ON "Lap"("activityId", "lapIndex");

-- CreateIndex
CREATE INDEX "Stream_activityId_idx" ON "Stream"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "Stream_activityId_type_key" ON "Stream"("activityId", "type");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lap" ADD CONSTRAINT "Lap_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
