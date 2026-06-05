-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "aiGaps" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "aiReasons" TEXT[] DEFAULT ARRAY[]::TEXT[];
