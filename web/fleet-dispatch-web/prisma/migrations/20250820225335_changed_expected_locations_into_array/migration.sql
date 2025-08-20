/*
  Warnings:

  - You are about to drop the column `expected_location` on the `Driver` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Driver" DROP COLUMN "expected_location",
ADD COLUMN     "expected_locations" TEXT[];
