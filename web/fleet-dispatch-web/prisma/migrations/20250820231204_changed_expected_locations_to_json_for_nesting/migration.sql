/*
  Warnings:

  - You are about to drop the column `expected_coordinates` on the `Driver` table. All the data in the column will be lost.
  - The `expected_locations` column on the `Driver` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Driver" DROP COLUMN "expected_coordinates",
DROP COLUMN "expected_locations",
ADD COLUMN     "expected_locations" JSONB;
