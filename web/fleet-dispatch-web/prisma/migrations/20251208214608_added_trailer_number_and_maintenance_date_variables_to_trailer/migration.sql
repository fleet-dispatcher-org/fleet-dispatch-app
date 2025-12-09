/*
  Warnings:

  - You are about to drop the column `last_inspection_date` on the `Trailer` table. All the data in the column will be lost.
  - You are about to drop the column `next_inspection_date` on the `Trailer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Trailer" DROP COLUMN "last_inspection_date",
DROP COLUMN "next_inspection_date",
ADD COLUMN     "last_maintenance_date" TIMESTAMP(3),
ADD COLUMN     "next_maintenance_date" TIMESTAMP(3),
ADD COLUMN     "trailer_number" BIGINT;
