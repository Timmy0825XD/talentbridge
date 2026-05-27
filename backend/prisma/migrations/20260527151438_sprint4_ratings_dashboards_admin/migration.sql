-- CreateEnum
CREATE TYPE "RatingRaterRole" AS ENUM ('COMPANY', 'CANDIDATE');

-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reputationAvg" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "completedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "contract_ratings" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "raterRole" "RatingRaterRole" NOT NULL,
    "quality" INTEGER,
    "deadlines" INTEGER,
    "communication" INTEGER,
    "attitude" INTEGER,
    "paymentPunctuality" INTEGER,
    "instructionClarity" INTEGER,
    "workEnvironment" INTEGER,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_rank_config" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "skillsWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "experienceWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "educationWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "certsWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "reputationWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "languagesWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "completionWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_rank_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institution_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contract_ratings_contractId_raterRole_key" ON "contract_ratings"("contractId", "raterRole");

-- CreateIndex
CREATE UNIQUE INDEX "institution_profiles_userId_key" ON "institution_profiles"("userId");

-- CreateIndex
CREATE INDEX "candidate_profiles_career_idx" ON "candidate_profiles"("career");

-- AddForeignKey
ALTER TABLE "contract_ratings" ADD CONSTRAINT "contract_ratings_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_profiles" ADD CONSTRAINT "institution_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
