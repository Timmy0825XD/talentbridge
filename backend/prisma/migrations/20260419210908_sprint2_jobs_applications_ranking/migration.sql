-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FORMAL', 'FREELANCE');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'SELECTING', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('RECEIVED', 'REVIEWING', 'SELECTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('REMOTE', 'ONSITE', 'HYBRID');

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'ACTIVE',
    "workMode" "WorkMode" NOT NULL,
    "area" TEXT,
    "skills" TEXT[],
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "duration" TEXT,
    "deadline" TIMESTAMP(3),
    "deliverables" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'RECEIVED',
    "scoreAtApply" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_rank_configs" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "skillsWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.30,
    "experienceWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "educationWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "certsWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "reputationWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "languagesWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "completionWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.05,

    CONSTRAINT "job_rank_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_scores" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "skillsScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "experienceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "educationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "certsScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reputationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "languagesScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completionScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applications_jobId_candidateId_key" ON "applications"("jobId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "job_rank_configs_jobId_key" ON "job_rank_configs"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "profile_scores_candidateId_key" ON "profile_scores"("candidateId");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_rank_configs" ADD CONSTRAINT "job_rank_configs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_scores" ADD CONSTRAINT "profile_scores_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
