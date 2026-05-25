-- CreateEnum
CREATE TYPE "PaymentScheme" AS ENUM ('SINGLE', 'MILESTONES', 'PERIODIC');

-- CreateEnum
CREATE TYPE "DeliverableStatus" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- AlterTable: contracts — add new columns, migrate paymentScheme
ALTER TABLE "contracts" ADD COLUMN "applicationId" TEXT;
ALTER TABLE "contracts" ADD COLUMN "cancelledAt" TIMESTAMP(3);

-- Migrate paymentScheme string → enum
ALTER TABLE "contracts" ADD COLUMN "paymentScheme_new" "PaymentScheme" NOT NULL DEFAULT 'SINGLE';
UPDATE "contracts" SET "paymentScheme_new" = CASE
  WHEN UPPER("paymentScheme") IN ('MILESTONES', 'MILESTONE') THEN 'MILESTONES'::"PaymentScheme"
  WHEN UPPER("paymentScheme") IN ('PERIODIC', 'PERIODICO') THEN 'PERIODIC'::"PaymentScheme"
  ELSE 'SINGLE'::"PaymentScheme"
END;
ALTER TABLE "contracts" DROP COLUMN "paymentScheme";
ALTER TABLE "contracts" RENAME COLUMN "paymentScheme_new" TO "paymentScheme";

-- AlterTable: payments
ALTER TABLE "payments" ALTER COLUMN "description" SET DEFAULT '';
UPDATE "payments" SET "description" = '' WHERE "description" IS NULL;
ALTER TABLE "payments" ADD COLUMN "dueDate" TIMESTAMP(3);
ALTER TABLE "payments" ADD COLUMN "sequence" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "deliverables" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "dueDate" TIMESTAMP(3),
    "status" "DeliverableStatus" NOT NULL DEFAULT 'PENDING',
    "fileUrl" TEXT,
    "candidateNotes" TEXT,
    "companyFeedback" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contracts_applicationId_key" ON "contracts"("applicationId");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
