-- AlterTable
ALTER TABLE "Athlete" ADD COLUMN     "lastSyncActivityCount" INTEGER,
ADD COLUMN     "lastSyncRangeEnd" TIMESTAMP(3),
ADD COLUMN     "lastSyncRangeStart" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SyncJob" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requestedFrom" TIMESTAMP(3) NOT NULL,
    "requestedTo" TIMESTAMP(3) NOT NULL,
    "fetchedCount" INTEGER NOT NULL DEFAULT 0,
    "upsertedCount" INTEGER NOT NULL DEFAULT 0,
    "currentPage" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SyncJob_athleteId_createdAt_idx" ON "SyncJob"("athleteId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SyncJob_status_createdAt_idx" ON "SyncJob"("status", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;
