-- CreateTable
CREATE TABLE "universities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_key" ON "universities"("name");
CREATE UNIQUE INDEX "universities_slug_key" ON "universities"("slug");

-- Add nullable FK columns before backfill
ALTER TABLE "candidate_profiles" ADD COLUMN "universityId" TEXT;
ALTER TABLE "institution_profiles" ADD COLUMN "universityId" TEXT;

-- Backfill universities from existing institution profiles
INSERT INTO "universities" ("id", "name", "slug", "isActive", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    ip."institutionName",
    LOWER(REGEXP_REPLACE(SPLIT_PART(ip."institutionName", ' ', 1), '[^a-zA-Z0-9]', '', 'g'))
        || COALESCE('-' || ip."id", ''),
    ip."isActive",
    NOW(),
    NOW()
FROM "institution_profiles" ip
ON CONFLICT DO NOTHING;

-- Better slug backfill: use institution name lowercased with id suffix for uniqueness
UPDATE "universities" u
SET "slug" = LOWER(REGEXP_REPLACE(LEFT(u."name", 20), '[^a-zA-Z0-9]', '', 'g')) || '-' || LEFT(u."id", 8)
WHERE EXISTS (
    SELECT 1 FROM "institution_profiles" ip WHERE ip."institutionName" = u."name"
);

-- Link institution profiles to universities by name
UPDATE "institution_profiles" ip
SET "universityId" = u."id"
FROM "universities" u
WHERE LOWER(TRIM(ip."institutionName")) = LOWER(TRIM(u."name"));

-- Link candidate profiles by institution name match
UPDATE "candidate_profiles" cp
SET "universityId" = u."id"
FROM "universities" u
WHERE cp."institution" IS NOT NULL
  AND LOWER(TRIM(cp."institution")) = LOWER(TRIM(u."name"));

-- Drop institution text column
ALTER TABLE "candidate_profiles" DROP COLUMN "institution";

-- Make institution_profiles.universityId required (delete orphans if any without match)
DELETE FROM "institution_profiles" WHERE "universityId" IS NULL;

ALTER TABLE "institution_profiles" ALTER COLUMN "universityId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "institution_profiles_universityId_key" ON "institution_profiles"("universityId");
CREATE INDEX "candidate_profiles_universityId_idx" ON "candidate_profiles"("universityId");

-- AddForeignKey
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "institution_profiles" ADD CONSTRAINT "institution_profiles_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
