-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "averageTemp" INTEGER,
ADD COLUMN     "detailFetched" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deviceName" TEXT,
ADD COLUMN     "elevHigh" DOUBLE PRECISION,
ADD COLUMN     "elevLow" DOUBLE PRECISION,
ADD COLUMN     "gearId" TEXT,
ADD COLUMN     "maxWatts" INTEGER,
ADD COLUMN     "prCount" INTEGER,
ADD COLUMN     "sufferScore" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "SplitMetric" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "split" INTEGER NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "elapsedTime" INTEGER NOT NULL,
    "movingTime" INTEGER NOT NULL,
    "elevationDifference" DOUBLE PRECISION,
    "averageSpeed" DOUBLE PRECISION,
    "paceZone" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SplitMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SplitMetric_activityId_idx" ON "SplitMetric"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "SplitMetric_activityId_split_key" ON "SplitMetric"("activityId", "split");

-- AddForeignKey
ALTER TABLE "SplitMetric" ADD CONSTRAINT "SplitMetric_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
