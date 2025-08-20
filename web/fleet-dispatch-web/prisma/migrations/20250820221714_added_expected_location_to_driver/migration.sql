-- AlterTable
ALTER TABLE "public"."Driver" ADD COLUMN     "expected_coordinates" JSONB,
ADD COLUMN     "expected_location" TEXT;
