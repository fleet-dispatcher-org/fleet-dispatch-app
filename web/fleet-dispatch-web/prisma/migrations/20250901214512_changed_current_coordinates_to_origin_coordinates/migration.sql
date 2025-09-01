/*
  Warnings:

  - You are about to drop the column `current_coordinates` on the `Load` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Load" DROP COLUMN "current_coordinates",
ADD COLUMN     "origin_coordinates" JSONB;
