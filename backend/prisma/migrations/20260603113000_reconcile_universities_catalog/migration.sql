-- Reconcile databases where candidate_profiles.institution was re-added
-- manually after the universities catalog migration had already run.

DO $$
DECLARE
  unmatched_count integer := 0;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'candidate_profiles'
      AND column_name = 'institution'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'candidate_profiles'
      AND column_name = 'universityId'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'universities'
  ) THEN
    EXECUTE '
      UPDATE "candidate_profiles" cp
      SET "universityId" = u."id"
      FROM "universities" u
      WHERE cp."universityId" IS NULL
        AND cp."institution" IS NOT NULL
        AND TRIM(cp."institution") <> ''''
        AND LOWER(TRIM(cp."institution")) = LOWER(TRIM(u."name"))
    ';

    EXECUTE '
      SELECT COUNT(*)
      FROM "candidate_profiles" cp
      WHERE cp."universityId" IS NULL
        AND cp."institution" IS NOT NULL
        AND TRIM(cp."institution") <> ''''
        AND NOT EXISTS (
          SELECT 1
          FROM "universities" u
          WHERE LOWER(TRIM(cp."institution")) = LOWER(TRIM(u."name"))
        )
    ' INTO unmatched_count;

    IF unmatched_count > 0 THEN
      RAISE NOTICE 'candidate_profiles rows with institution text but no university match: %', unmatched_count;
    END IF;
  END IF;
END $$;

ALTER TABLE "candidate_profiles" DROP COLUMN IF EXISTS "institution";

CREATE INDEX IF NOT EXISTS "candidate_profiles_universityId_idx"
  ON "candidate_profiles"("universityId");

CREATE UNIQUE INDEX IF NOT EXISTS "institution_profiles_universityId_key"
  ON "institution_profiles"("universityId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'candidate_profiles_universityId_fkey'
  ) THEN
    ALTER TABLE "candidate_profiles"
      ADD CONSTRAINT "candidate_profiles_universityId_fkey"
      FOREIGN KEY ("universityId") REFERENCES "universities"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'institution_profiles_universityId_fkey'
  ) THEN
    ALTER TABLE "institution_profiles"
      ADD CONSTRAINT "institution_profiles_universityId_fkey"
      FOREIGN KEY ("universityId") REFERENCES "universities"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
