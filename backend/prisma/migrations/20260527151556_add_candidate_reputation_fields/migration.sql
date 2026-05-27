-- AlterTable
ALTER TABLE "candidate_profiles" ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reputationAvg" DOUBLE PRECISION NOT NULL DEFAULT 0;
