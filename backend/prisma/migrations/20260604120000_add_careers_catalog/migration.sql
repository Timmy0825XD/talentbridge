-- CreateTable
CREATE TABLE "careers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "careers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "careers_name_key" ON "careers"("name");
CREATE UNIQUE INDEX "careers_slug_key" ON "careers"("slug");

ALTER TABLE "candidate_profiles" ADD COLUMN "careerId" TEXT;

-- Backfill careers from distinct candidate career text
INSERT INTO "careers" ("id", "name", "slug", "isActive", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    trimmed.name,
    LOWER(REGEXP_REPLACE(LEFT(trimmed.name, 24), '[^a-zA-Z0-9]', '', 'g'))
        || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8),
    true,
    NOW(),
    NOW()
FROM (
    SELECT DISTINCT TRIM("career") AS name
    FROM "candidate_profiles"
    WHERE "career" IS NOT NULL AND TRIM("career") <> ''
) trimmed
WHERE NOT EXISTS (
    SELECT 1 FROM "careers" c
    WHERE LOWER(TRIM(c."name")) = LOWER(trimmed.name)
);

UPDATE "candidate_profiles" cp
SET "careerId" = c."id"
FROM "careers" c
WHERE cp."career" IS NOT NULL
  AND TRIM(cp."career") <> ''
  AND LOWER(TRIM(cp."career")) = LOWER(TRIM(c."name"));

DROP INDEX IF EXISTS "candidate_profiles_career_idx";
ALTER TABLE "candidate_profiles" DROP COLUMN IF EXISTS "career";

CREATE INDEX "candidate_profiles_careerId_idx" ON "candidate_profiles"("careerId");

ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_careerId_fkey"
    FOREIGN KEY ("careerId") REFERENCES "careers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
